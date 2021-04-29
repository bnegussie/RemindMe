import { PushGeneralReminderTimeAhead } from "./PushGeneralReminderTimeAhead";

async function ReminderCompletedState(reminder_id, reminder_completed, activeRemindersEmpty) {
    reminder_completed = !reminder_completed;

    try {
        if (reminder_completed) {
            // The Completed checkbox just got checked.

            const respActiveReminders = await fetch(
                `/api/dashboard/reminder/active/${reminder_id}`, {
                    method: "DELETE",
                    credentials: 'include'
                }
            );

            await fetch(`/api/dashboard/reminder/overdue/${reminder_id}`, {
                    method: "DELETE",
                    credentials: 'include'
                }
            );

            const parseResp = await respActiveReminders.json();
            
            const id = reminder_id;
            const completed = reminder_completed,
                title = parseResp.reminder_title,
                desc = parseResp.reminder_desc,
                dueDate = parseResp.reminder_due_date,
                reminderDate = parseResp.reminder_reminder_date,
                reminderSent = parseResp.reminder_reminder_sent;

            const body = { completed, title, desc, dueDate, reminderDate, reminderSent };
            const bodyPlusId = { id, completed, title, desc, dueDate, reminderDate, reminderSent };

            await fetch( `/api/dashboard/reminder/all/${reminder_id}`, {
                    method: "PUT",
                    headers: {"Content-type": "application/json"},
                    body: JSON.stringify(body),
                    credentials: 'include'
                }
            );

            await fetch( "/api/dashboard/reminder/completed", {
                    method: "POST",
                    headers: {"Content-type": "application/json"},
                    body: JSON.stringify(bodyPlusId),
                    credentials: 'include'
                }
            );

        } else {
            // The Completed checkbox has now been unchecked.

            if (activeRemindersEmpty) {
                await PushGeneralReminderTimeAhead();
            }

            const respCompletedReminders = await fetch(
                `/api/dashboard/reminder/completed/${reminder_id}`, {
                    method: "DELETE",
                    credentials: 'include'
                }
            );

            const parseResp = await respCompletedReminders.json();

            const id = reminder_id;
            const completed = reminder_completed,
                title = parseResp.reminder_title,
                desc = parseResp.reminder_desc,
                dueDate = parseResp.reminder_due_date,
                reminderDate = parseResp.reminder_reminder_date,
                reminderSent = parseResp.reminder_reminder_sent;

            const body = { completed, title, desc, dueDate, reminderDate, reminderSent };
            const bodyPlusId = { id, completed, title, desc, dueDate, reminderDate, reminderSent };

            await fetch(`/api/dashboard/reminder/all/${reminder_id}`, {
                    method: "PUT",
                    headers: {"Content-type": "application/json"},
                    body: JSON.stringify(body),
                    credentials: 'include'
                }
            );

            await fetch("/api/dashboard/reminder/active", {
                    method: "POST",
                    headers: {"Content-type": "application/json"},
                    body: JSON.stringify(bodyPlusId),
                    credentials: 'include'
                }
            );
        }

    } catch (error) {
        console.error(error.message);
    }
}

export { ReminderCompletedState };

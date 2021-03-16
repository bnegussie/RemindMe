import React, { Fragment, useState, useEffect } from 'react';
import InlineConfirmButton from "react-inline-confirm";

import EditReminder from "./EditReminder";
import { PushGeneralReminderTimeAhead } from "./PushGeneralReminderTimeAhead";

import "./../../../App.css";

function Search({ isAuth }) {

    const [allReminders, setAllReminders] = useState([]);
    const [filteredReminders, setFilteredReminders] = useState([]);
    const [titleSearched, setTitleSearched] = useState("");
	const [activeRemindersEmpty, setActiveRemindersEmpty] = useState(true);

    const textValues = ["Delete", "Are you sure?", "Deleting..."];
	var isExecuting = false;
	const confirmIconClass = `fa fa-${isExecuting ? "circle-o-notch fa-spin" : "fa fa-trash"}`;

    async function getAllReminders() {
		try {
			const response = await fetch("/api/dashboard/reminder/all", {
				method: "GET",
				headers: {token: localStorage.token}
			});
			const parseResp = await response.json();

			// Determining if there is at least one active reminder:
			const reminderLength = parseResp.length;
			let i = 0;
			while (i < reminderLength) {
				if (!parseResp[i].reminder_completed) {
					setActiveRemindersEmpty(false);
					break
				}
				i++;
			}
			// Finished checking to see if there is at least one active reminder.
            
            setAllReminders(parseResp);
            setFilteredReminders(parseResp);
            
		} catch (error) {
			console.error(error.message);
		}
	}

    async function searchForReminders(e) {
        e.preventDefault();
        try {
            if (e.target.value === '') {
                setFilteredReminders(allReminders);
            } else {
                const response = await fetch(`/api/dashboard/search/?title=${titleSearched}`, {
                    method: "GET",
                    headers: {"token": localStorage.token}
                });
                const parseResp = await response.json();

                if (response.status === 200) {
                    setFilteredReminders(parseResp);
                }
            }

        } catch (error) {
            console.error(error.message);
        }
    }

    async function deleteReminderTask(reminder_id) {
		try {
			// eslint-disable-next-line
			const respActiveReminders = await fetch(
				`/api/dashboard/reminder/active/${reminder_id}`,
				{
					method: "DELETE",
					headers: {token: localStorage.token}
				}
			);

			// eslint-disable-next-line
			const respCompletedReminders = await fetch(
				`/api/dashboard/reminder/completed/${reminder_id}`,
				{
					method: "DELETE",
					headers: {token: localStorage.token}
				}
			);

			// eslint-disable-next-line
			const respOverdueReminders = await fetch(
				`/api/dashboard/reminder/overdue/${reminder_id}`,
				{
					method: "DELETE",
					headers: {token: localStorage.token}
				}
			);

			// eslint-disable-next-line
			const respAllReminders = await fetch(
				`/api/dashboard/reminder/all/${reminder_id}`,
				{
					method: "DELETE",
					headers: {token: localStorage.token}
				}
            );
            
            // Updating the filtered search result:
            setFilteredReminders(
                filteredReminders.filter((reminder) => reminder.reminder_id !== reminder_id)
            );

		} catch (error) {
			console.error(error.message);
		}
    }
    
    async function reminderCompletedState(reminder_id, reminder_completed) {
		reminder_completed = !reminder_completed;

		const myHeaders = new Headers();
		myHeaders.append("Content-type", "application/json");
		myHeaders.append("token", localStorage.token);

		try {
			if (reminder_completed) {
				// The Completed checkbox just got checked.
	
				const respActiveReminders = await fetch(
					`/api/dashboard/reminder/active/${reminder_id}`, {
						method: "DELETE",
						headers: {token: localStorage.token}
					}
				);
	
				// eslint-disable-next-line
				const respOverdueReminders = await fetch(
					`/api/dashboard/reminder/overdue/${reminder_id}`, {
						method: "DELETE",
						headers: {token: localStorage.token}
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
	
				// eslint-disable-next-line
				const respAllReminders = await fetch(
					`/api/dashboard/reminder/all/${reminder_id}`,
					{
						method: "PUT",
						headers: myHeaders,
						body: JSON.stringify(body)
					}
				);
	
				// eslint-disable-next-line
				const respCompletedReminders = await fetch(
					"/api/dashboard/reminder/completed", {
						method: "POST",
						headers: myHeaders,
						body: JSON.stringify(bodyPlusId)
				});
	
			} else {
				// The Completed checkbox has now been unchecked.

				if (activeRemindersEmpty) {
					await PushGeneralReminderTimeAhead(myHeaders);
				}
	
				// eslint-disable-next-line
				const respCompletedReminders = await fetch(
					`/api/dashboard/reminder/completed/${reminder_id}`,
					{
						method: "DELETE",
						headers: {token: localStorage.token}
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
	
				// eslint-disable-next-line
				const respAllReminders = await fetch(
					`/api/dashboard/reminder/all/${reminder_id}`,
					{
						method: "PUT",
						headers: myHeaders,
						body: JSON.stringify(body)
					}
				);
	
				// eslint-disable-next-line
				const respActiveReminders = await fetch(
					"/api/dashboard/reminder/active", {
						method: "POST",
						headers: myHeaders,
						body: JSON.stringify(bodyPlusId)
				});
			}
	
			window.location = "/Dashboard/Search";

		} catch (error) {
			console.error(error.message);
		}
	}

    async function activeInput(e) {
        try {
            setTitleSearched(e.target.value);
            searchForReminders(e);

        } catch (error) {
            console.error(error.message);
        }
    }

    useEffect(() => {
		getAllReminders();
		
		return () => {
			setAllReminders([]);
			setFilteredReminders([]);
		}
    }, []);


    return (
        <Fragment>
            <div className="search-container">
                <div className="search-top-component" onClick={isAuth} onMouseEnter={isAuth}>
                    <form className="d-flex" onSubmit={searchForReminders}>
                        <input 
                            type="search" 
                            name="title" 
                            placeholder="Enter a reminder title" 
                            className="form-control search"
                            value={titleSearched}
                            onChange={e => activeInput(e)}
							autoFocus
                        />

                        <div className="search-btn-on-search" onClick={searchForReminders}>
                            <i className="fas fa-search" type="submit" />
                        </div>        
                    </form>
                </div>

                <div className="reminders-container">
                    <table className="table">
                        <thead>
                            <tr id="reminders-table-row">
                                <th width="10%" className="reminders-headers">Completed</th>
                                <th width="50%" className="reminders-headers">Title</th>
                                <th width="20%" className="reminders-headers">View</th>
                                <th width="20%" className="reminders-headers">Delete</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredReminders.map((currReminder) => (
                                <tr key={currReminder.reminder_id}>
                                    <td onClick={isAuth} >
                                        <input
                                            type="checkbox"
                                            className="completed-checkboxes"
                                            onChange={() =>
                                                reminderCompletedState(
                                                    currReminder.reminder_id,
                                                    currReminder.reminder_completed
                                                )
                                            }
                                            checked={currReminder.reminder_completed}
                                        />
                                    </td>
                                    <td className="reminder-titles">
                                        {currReminder.reminder_title}
                                    </td>
                                    <td onClick={isAuth} >
										<EditReminder 
											currReminder={currReminder} 
											redirectTo="/Dashboard/Search" 
											activeRemindersEmpty={activeRemindersEmpty}
										/>
                                    </td>
                                    <td onClick={isAuth} >
                                        <InlineConfirmButton
                                            className="btn btn-danger delete-reminder"
                                            textValues={textValues}
                                            showTimer
                                            isExecuting={isExecuting}
                                            onClick={() =>
                                                deleteReminderTask(currReminder.reminder_id)
                                            }
                                        >
                                            <i className={confirmIconClass}></i>
                                        </InlineConfirmButton>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
					{filteredReminders.length === 0 && 
						<p className="no-data-available-msg">No results found.</p>
					}
                </div>

            </div>
        </Fragment>
    )
}

export default Search

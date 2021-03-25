import { ClearDateMinAndSecAndMill } from "./ClearDate";

/* Updating the General Reminder Time to the following day, at the specified time.
 * This edge case comes up when a user doesn't use the reminder app (doesn't have 
 * any Active Reminders) for one or more days and the next time the user creates 
 * a reminder or marks an old reminder task as uncompleted, then soon after, the user
 * will get a General Daily Reminder at the next full hour and this should not happen.
 */
async function PushGeneralReminderTimeAhead( myHeaders ) {
    try {
        const grtGetResponse = await fetch("/api/profile/general/reminder", {
            method: "GET",
            headers: myHeaders
        });

        const parseResp = await grtGetResponse.json();
        const finalTime = new Date(parseResp.user_general_reminder_time);

        const newGRT = new Date( ClearDateMinAndSecAndMill() );
        newGRT.setDate( newGRT.getDate() + 1 );
        newGRT.setHours( finalTime.getHours() );
        
        let body = { newGRT };

        // eslint-disable-next-line
        const grtUpdateResponse = await fetch("/api/profile/general/reminder", {
            method: "PUT",
            headers: myHeaders,
            body: JSON.stringify(body)
        });

    } catch (error) {
        console.error(error.message);
    }
    // Finished updating the General Reminder Time.
    
    return null;
}

export { PushGeneralReminderTimeAhead };

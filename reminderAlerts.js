// Connecting to the DB:
const pool = require("./db");
require("dotenv").config();

const nodeMailer = require('nodeMailer');

// Using the file-system library to be able to log the activities in this file.
fs = require('fs');



/************************************** START: Email and Text Message services *******************/
async function processAllUserReminders(loggingFile) {
    var loggingData = (new Date()).toLocaleString() + " ENTERING: processAllUserReminders(). \n";

    try {
        // The way in which this data is processed is reversed so this script will end up
        // looking at the upcoming reminders first, categorized by each user.
        const activeRemindersPlusUserData = await pool.query(
            "SELECT * FROM active_reminders AS a_r INNER JOIN users AS u ON a_r.user_id = u.user_id ORDER BY a_r.user_id DESC, a_r.reminder_due_date DESC, a_r.reminder_title DESC;"
        );
        
        const reminderLength = activeRemindersPlusUserData.rowCount;
        var rIndex = 0;
        const allUserReminders = [];

        loggingData += "Pre: reminders loop. \n";

        while (rIndex < reminderLength) {
            loggingData += "        Processing a user's reminders. \n";

            const currUserReminders = [];
            
            const currReminder = activeRemindersPlusUserData.rows.pop();
            
            currUserReminders.push(currReminder);
            const userEmail = currReminder.user_email;
            const userId = currReminder.user_id;


            // Trying to gather all reminders for the current user & sending it off:
            while (rIndex + 1 < reminderLength) {
                const additionalR = activeRemindersPlusUserData.rows.pop();
                
                const tempUserId = additionalR.user_id;
                if (tempUserId === userId) {
                    currUserReminders.push(additionalR);
                } else {
                    activeRemindersPlusUserData.rows.push(additionalR);
                    break;
                }
                rIndex++;
            }

            allUserReminders.push(currUserReminders);
            
            rIndex++;
        }
        loggingData += "Post: reminders loop. \n";
        loggingData += (new Date()).toLocaleString() + " EXITING: processAllUserReminders() \n\n";

        // Changing dir into logging dir:
        process.chdir(process.env.loggingFilePath);
        fs.writeFile( loggingFile, loggingData, {flag:'a'}, function (error, data) {
            if (error) {
                return console.log(error);
            }
        }); 

        return allUserReminders;

    } catch (error) {
        console.error(error.message);
    }
}




// Setting up the time trigger to send the users, their daily list of reminders.--------------------------
var initialGRHasNotBeenSent = true;
var nextHourTime = new Date( ClearDateMinAndSecAndMill() );
nextHourTime.setHours( nextHourTime.getHours() + 1 );

var nextAvailableGR = nextHourTime - (new Date());


setTimeout(function() {
    // Cheching every hour because users can adjust their General Reminder to different hours of the day.
    // And since the users can live in different timezones, we want the system to send the email
    // at the appropriate time.
    setInterval(triggerGeneralReminder, (1000 * 60 * 60));

    if (initialGRHasNotBeenSent) {
        initialGRHasNotBeenSent = false;
        triggerGeneralReminder();
    }

}, nextAvailableGR);


async function triggerGeneralReminder() {
    var loggingData = (new Date()).toLocaleString() + " ENTERING: triggerGeneralReminder(). \n";
    const fullDate = new Date();
    // Month + 1 is an odd JavaScript behavior as it starts at index 0: https://stackoverflow.com/a/14680423
    const dateToday = fullDate.getFullYear() + "-" + (fullDate.getMonth() + 1) + "-" + fullDate.getDate();
    const loggingFile = "RemindMe- " + dateToday + ".txt";

    try {
        const allUserReminders = await processAllUserReminders(loggingFile);

        let currentTime = new Date();
        // It's a loop because the timer keeps getting triggered a few seconds earlier
        // as time goes on (like a second faster every few weeks).
        while (currentTime.getMinutes() === 59) {
            loggingData += "    Pre: sleep(). \n";
            // Waiting for five seconds because the earlies this function has ever been
            // called is four seconds early.
            await sleep(1000 * 5);
            loggingData += "    Post: sleep(). \n";

            currentTime = new Date();
        }

        allUserReminders.forEach(async function(currUserAllActiveReminders, index) {
            loggingData += "    " + (new Date()).toLocaleString() + " Accessing a user's reminders. \n";

            const allActive = currUserAllActiveReminders;
            
            // Checking to see if the current hour is the time the user wants our system to send
            // out the general reminder, if they have any upcoming tasks for the week.
            const thisSpecificMoment = new Date( ClearDateMinAndSecAndMill() );
            
            const specifiedTime = new Date( 
                ClearDateMinAndSecAndMill( allActive[0].user_general_reminder_time ) 
            );

            loggingData += "    specifiedTime.toLocaleString() = " + specifiedTime.toLocaleString() + "\n";
            loggingData += "    thisSpecificMoment.toLocaleString() = " + thisSpecificMoment.toLocaleString() + "\n";
            
            // Checking if our server failed to send a general reminder, maybe because it was down.
            // Either the server failed to send a general reminder, or this was the time the user
            // has specified to get their general email reminder:
            if ( specifiedTime.getTime()  <= thisSpecificMoment.getTime() ) {
                
                // Updating the DB with the user's new General Reminder Time:
                const newGRT = new Date( ClearDateMinAndSecAndMill() );
                newGRT.setDate( newGRT.getDate() + 1 );
                newGRT.setHours( specifiedTime.getHours() );


                try {
                    loggingData += "            Pre: updating the DB with user's new GRT. \n";

                    // Updating the user's General Reminder Time:
                    const updateGRT = await pool.query(
                        "UPDATE users SET user_general_reminder_time = $1 WHERE user_id = $2;",
                            [newGRT, allActive[0].user_id]
                    );
                    loggingData += "            Post: updating the DB with user's new GRT. \n";

                } catch (error) {
                    console.error(error.message);
                    loggingData += "            error = " + error + "\n";
                }
                
                
                const userId = allActive[0].user_id;
                const generalReminderTime = allActive[0].user_general_reminder_time;
                const userEmail = allActive[0].user_email;
                const userCPCarrierEmailExtn = allActive[0].user_cp_carrier_email_extn;
                const userPNum = allActive[0].user_p_num;
                const userFName = allActive[0].user_f_name;

                var lookedThroughTheUpcomingWeekReminders = false;
                var activeLength = allActive.length;
                var activeIndex = 0;


                const today = thisSpecificMoment;
                const oneWeek = new Date( ClearDateMinAndSecAndMill() );
                oneWeek.setDate(oneWeek.getDate() + 7);

                /* The email will list out the upcoming reminders in the next seven days.
                * For each day there is the time (in ms) at 12:00 am and another time at 11:45 pm
                * to make sure the date time comparison is always going to be accurate.
                */
                const upcomingDates = [today.getTime(), 
                    (new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 45, 59, 59)).getTime(),
                    (new Date(today.getFullYear(), today.getMonth(), (today.getDate() + 1), 0, 0, 0, 0)).getTime(),
                    (new Date(today.getFullYear(), today.getMonth(), (today.getDate() + 1), 23, 45, 59, 59)).getTime(),
                    (new Date(today.getFullYear(), today.getMonth(), (today.getDate() + 2), 0, 0, 0, 0)).getTime(),
                    (new Date(today.getFullYear(), today.getMonth(), (today.getDate() + 2), 23, 45, 59, 59)).getTime(),
                    (new Date(today.getFullYear(), today.getMonth(), (today.getDate() + 3), 0, 0, 0, 0)).getTime(),
                    (new Date(today.getFullYear(), today.getMonth(), (today.getDate() + 3), 23, 45, 59, 59)).getTime(),
                    oneWeek.getTime()];
                
                
                // [0, 			1,			 2,					3,				 4,							 5]
                // [Due today, Due tomorrow, Due in two days, Due in three days, Due in less than a week, Overdue]
                var reminders = ["", "", "", "", "", ""];

                const dueDateTimeCheck = ClearDateSecAndMill( allActive[activeIndex].reminder_due_date );

                if (dueDateTimeCheck >= upcomingDates[8]) {
                    // There are not any reminders within the next seven days, for the current user.		
                    return
                }

                var numOfReminders = 0;

                while (activeIndex < activeLength && !lookedThroughTheUpcomingWeekReminders) {

                    const dueDateTime = ClearDateSecAndMill( allActive[activeIndex].reminder_due_date );

                    if (dueDateTime < upcomingDates[0]) { // Overdue
                        reminders[5] += "<br/>" + allActive[activeIndex].reminder_title;
                    } else if (dueDateTime >= upcomingDates[0] && dueDateTime <= upcomingDates[1]) { // Due Today
                        reminders[0] += "<br/>" + allActive[activeIndex].reminder_title;
                    } else if (dueDateTime >= upcomingDates[2] && dueDateTime <= upcomingDates[3]) { // Due tomorrow
                        reminders[1] += "<br/>" + allActive[activeIndex].reminder_title;
                    } else if (dueDateTime >= upcomingDates[4] && dueDateTime <= upcomingDates[5]) { // Due in two days
                        reminders[2] += "<br/>" + allActive[activeIndex].reminder_title;
                    } else if (dueDateTime >= upcomingDates[6] && dueDateTime <= upcomingDates[7]) { // Due in three days
                        reminders[3] += "<br/>" + allActive[activeIndex].reminder_title;
                    } else if (dueDateTime < upcomingDates[8]) { // Due in less than one week
                        reminders[4] += "<br/>" + allActive[activeIndex].reminder_title;
                    } else {
                        lookedThroughTheUpcomingWeekReminders = true;
                    }

                    if (dueDateTime < upcomingDates[8]) {
                        /* Separate check needed so if there is more than one reminder, within the 
                         * upcoming week, the grammar needs to be slightly different in the reminder 
                         * email and text message.
                         */
                        numOfReminders++;
                    }

                    activeIndex++;
                }

                loggingData += "        Pre: sendGeneralReminder() call. \n";
                sendGeneralReminder(reminders, userEmail, userCPCarrierEmailExtn, userPNum,
                                    userFName, numOfReminders, userId, generalReminderTime, loggingFile);
                loggingData += "        Post: sendGeneralReminder() call. \n";
            }
            loggingData += "\n";
        });

    } catch (error) {
        console.error(error.message);
        loggingData += "    error = " + error + "\n";
    }

    loggingData += (new Date()).toLocaleString() + " EXITING: triggerGeneralReminder() \n\n";

    // Changing dir into logging dir:
    process.chdir(process.env.loggingFilePath);
    fs.writeFile( loggingFile, loggingData, {flag:'a'}, function (error, data) {
        if (error) {
          return console.log(error);
        }
    }); 
}

async function sendGeneralReminder(req, userEmail, userCPCarrierEmailExtn, userPNum,
                                    userFName, numOfReminders, userId, generalReminderTime, loggingFile) {
    var loggingData = (new Date()).toLocaleString() + " ENTERING: sendGeneralReminder(). \n";

    // Step 1: create a reuseable transporter object.
    let transporter = nodeMailer.createTransport({
        host: process.env.host,
        auth: {
            user: process.env.serviceAccount,
            pass: process.env.serviceSecret
        },
		tls: {
			rejectUnauthorized: process.env.usingTLS
		}
    });

    loggingData += (new Date()).toLocaleString() + " Processing a user's reminders. \n";

    let todayEmail = "", tomorrowEmail = "", inTwoDaysEmail = "", inThreeDaysEmail = "", 
        inLessThanAWeekEmail = "", overdueEmail = "";

    let allSMSReminders = "\n";
    let numOfDifferentDays = 0;

    if (req[0] !== "") {
        let todayTasks = req[0].split("<br/>").reverse();
        const todayTasksLength = todayTasks.length;
        let todayTasksIndex = 0;

        todayEmail = `<h2 style="text-indent: 40px;">Due today:</h2>`;
        allSMSReminders += "            Due today: \n";

        // The last element is empty:
        todayTasks.pop();

        while (todayTasksIndex < todayTasksLength - 1) {
            let task = todayTasks.pop();
            todayEmail += `
                <div style="white-space: nowrap; overflow-x: auto;">
                    <h3 style="display: inline-block; padding:0; margin:0;">Task:</h3>
                    <p style="font-size:18px; display: inline-block; padding:0; margin:0; text-indent: 5px;">
                        ${task}
                    </p>
                </div>`;
            allSMSReminders += `Task: ${task} \n`;

            todayTasksIndex++;
        }
        allSMSReminders += "\n";
        numOfDifferentDays++;
    }
    if (req[1] !== "") {
        let tmrTasks = req[1].split("<br/>").reverse();
        const tmrTasksLength = tmrTasks.length;
        let tmrTasksIndex = 0;

        tomorrowEmail = `<h2 style="text-indent: 40px;">Due tomorrow:</h2>`;
        allSMSReminders += "            Due tomorrow: \n";

        // The last element is empty:
        tmrTasks.pop();

        while (tmrTasksIndex < tmrTasksLength - 1) {
            let task = tmrTasks.pop();
            tomorrowEmail += `
                <div style="white-space: nowrap; overflow-x: auto;">
                    <h3 style="display: inline-block; padding:0; margin:0;">Task:</h3>
                    <p style="font-size:18px; display: inline-block; padding:0; margin:0; text-indent: 5px;">
                        ${task}
                    </p>
                </div>`;
            allSMSReminders += `Task: ${task} \n`;

            tmrTasksIndex++;
        }
        allSMSReminders += "\n";
        numOfDifferentDays++;
    }
    if (req[2] !== "") {
        let tasksInTwoDays = req[2].split("<br/>").reverse();
        const tasksInTwoDaysLength = tasksInTwoDays.length;
        let tasksInTwoDaysIndex = 0;

        inTwoDaysEmail = `<h2 style="text-indent: 40px;">Due in two days:</h2>`;
        allSMSReminders += "            Due in two days: \n"

        // The last element is empty:
        tasksInTwoDays.pop();

        while (tasksInTwoDaysIndex < tasksInTwoDaysLength - 1) {
            let task = tasksInTwoDays.pop();
            inTwoDaysEmail += `
                <div style="white-space: nowrap; overflow-x: auto;">
                    <h3 style="display: inline-block; padding:0; margin:0;">Task:</h3>
                    <p style="font-size:18px; display: inline-block; padding:0; margin:0; text-indent: 5px;">
                        ${task}
                    </p>
                </div>`;
            allSMSReminders += `Task: ${task} \n`;

            tasksInTwoDaysIndex++;
        }
        allSMSReminders += "\n";
        numOfDifferentDays++;
    }
    if (req[3] !== "") {
        let tasksInThreeDays = req[3].split("<br/>").reverse();
        const tasksInThreeDaysLength = tasksInThreeDays.length;
        let tasksInThreeDaysIndex = 0;

        inThreeDaysEmail = `<h2 style="text-indent: 40px;">Due in three days:</h2>`;
        allSMSReminders += "            Due in three days: \n";

        // The last element is empty:
        tasksInThreeDays.pop();

        while (tasksInThreeDaysIndex < tasksInThreeDaysLength - 1) {
            let task = tasksInThreeDays.pop();
            inThreeDaysEmail += `
                <div style="white-space: nowrap; overflow-x: auto;">
                    <h3 style="display: inline-block; padding:0; margin:0;">Task:</h3>
                    <p style="font-size:18px; display: inline-block; padding:0; margin:0; text-indent: 5px;">
                        ${task}
                    </p>
                </div>`;
            allSMSReminders += `Task: ${task} \n`;

            tasksInThreeDaysIndex++;
        }
        allSMSReminders += "\n";
        numOfDifferentDays++;
    }
    if (req[4] !== "") {
        let tasksInLessThanAWeek = req[4].split("<br/>").reverse();
        const tasksInLessThanAWeekLength = tasksInLessThanAWeek.length;
        let tasksInLessThanAWeekIndex = 0;

        inLessThanAWeekEmail = `<h2 style="text-indent: 40px;">Due in less than a week:</h2>`;
        allSMSReminders += "            Due in less than a week: \n";

        // The last element is empty:
        tasksInLessThanAWeek.pop();

        while (tasksInLessThanAWeekIndex < tasksInLessThanAWeekLength - 1) {
            let task = tasksInLessThanAWeek.pop();
            inLessThanAWeekEmail += `
                <div style="white-space: nowrap; overflow-x: auto;">
                    <h3 style="display: inline-block; padding:0; margin:0;">Task:</h3>
                    <p style="font-size:18px; display: inline-block; padding:0; margin:0; text-indent: 5px;">
                        ${task}
                    </p>
                </div>`;
            allSMSReminders += `Task: ${task} \n`;

            tasksInLessThanAWeekIndex++;
        }
        allSMSReminders += "\n";
        numOfDifferentDays++;
    }
    
    if (req[5] !== "") {
        let overdueTasks = req[5].split("<br/>").reverse();
        const overdueTasksLength = overdueTasks.length;
        let overdueTasksIndex = 0;

        overdueEmail = `<h2 style="color:red; text-indent: 40px;">Overdue:</h2>`;
        allSMSReminders += "            Overdue: \n";

        // The last element is empty:
        overdueTasks.pop();

        while (overdueTasksIndex < overdueTasksLength - 1) {
            let task = overdueTasks.pop();
            overdueEmail += `
                <div style="white-space: nowrap; overflow-x: auto;">
                    <h3 style="display: inline-block; padding:0; margin:0;">Task:</h3>
                    <p style="font-size:18px; display: inline-block; padding:0; margin:0; color:red; text-indent: 5px;">
                        ${task}
                    </p>
                </div>`;
            allSMSReminders += `Task: ${task} \n`;

            overdueTasksIndex++;
        }
        allSMSReminders += "\n";
        numOfDifferentDays++;
    }

    var initialGreeting = "Here is your upcoming task for the week."
    if (numOfReminders > 1) {
        initialGreeting = "Here are your upcoming tasks for the week."
    }

    // Addressing odd UI issue where the SMS header doesn't display correctly,
    // on some devices, if the text message overall length is short.
    if (numOfDifferentDays < 2 && numOfReminders < 3) {
        allSMSReminders += "            - \n";
        if (numOfReminders == 1) {
            allSMSReminders += "            - \n";
        }
    }

    // Step 2, part 1: sending email with defined transport object:
    let emailInfo = {
        from: `RemindMe <${process.env.serviceEmail}>`,
        to: `${userEmail}`,
        subject: "RemindMe: General Daily Reminder",
        html: `
        <div style="color: #000 !important;">
            <center>
                <h1 style="color: #000;">RemindMe</h1>
            </center>

            <h3 style="color: #000;">Hi ${userFName},</h3>
            <h3 style="color: #000; text-indent: 50px;"> 
            ${initialGreeting} Make sure to keep moving forward and keep making the most out of this day!
            </h3>
            <br/>
            
            ${todayEmail}

            ${tomorrowEmail}
            
            ${inTwoDaysEmail}
            
            ${inThreeDaysEmail}
            
            ${inLessThanAWeekEmail}

            ${overdueEmail}
        </div>
        
        <br/>
        <div>
            <!--[if mso]>
            <center>
                <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="https://RemindMeee.com" style="height:40px;v-text-anchor:middle;width:200px;" arcsize="25%" strokecolor="#000" fillcolor="#8B4513">
                    <w:anchorlock/>
                    <center style="color:#fff; font-family:sans-serif; font-size:15px; font-weight:bold;">
                        RemindMeee.com
                    </center>
                </v:roundrect>
            </center>
            <![endif]-->

            <center>
                <a 
                    href="https://RemindMeee.com" 
                    style="background-color:#8B4513; border:1px solid #000; border-radius:10px; color:#fff; display:inline-block; font-family:sans-serif; font-size:15px; font-weight:bold; line-height:40px; text-align:center; text-decoration:none; width:200px; -webkit-text-size-adjust:none; mso-hide:all;">

                    RemindMeee.com
                </a>
            </center>
        </div>
        `
    };

    loggingData += "Pre: sendingEmail. \n";

    transporter.sendMail(emailInfo, async function(error, data) {
        if (error) {
            let errorTime = (new Date()).toLocaleString();
            console.log(errorTime + ": An error occurred while sending the general reminder email.");
            console.error("error = ", [error]);
            console.log("");
            loggingData += "        error = " + error + "\n";

            /* Changing the General Reminder Time back since the reminder was not sent:
             *
             * This generalReminderTime variable is actually the original GRT and not the recently
             * updated value currently in the DB so setting the DB value to the original GRT will be best.
             */
            const pushedBackGRT = new Date( ClearDateMinAndSecAndMill( generalReminderTime ) );

            try {
                const updateGRT = await pool.query(
                    "UPDATE users SET user_general_reminder_time = $1 WHERE user_id = $2;",
                        [pushedBackGRT, userId]
                );

            } catch (error) {
                console.error(error.message);
                loggingData += "            error = " + error + "\n";
            }

        } else {
            let sentTime = (new Date()).toLocaleString();
            console.log(sentTime + ": The general reminder email was successfully sent.");
            loggingData += "        " + sentTime + ": The general reminder email was successfully sent. \n";
        }
    });

    loggingData += "Post: sendingEmail. \n";

    // Checking if the phone number was provided before sending out an SMS:
    const userPNumNoSpaces = userPNum.replace(/\s/g,'');
    if (userPNumNoSpaces !== '') {
        loggingData += "    Pre: sendingSMS. \n";

        // Step 2, part 2: sending text message with defined transport object:
        let smsInfo = {
            from: `RemindMe <${process.env.serviceEmail}>`,
            to: `${userPNum}${userCPCarrierEmailExtn}`,
            subject: "RemindMe: General Daily Reminder",
            text: `Hi ${userFName},
            ${initialGreeting} Make sure to keep moving forward and keep making the most out of this day!
            ${allSMSReminders}
            Click the link below to view all of your reminders: 
            RemindMeee.com
            `
        };

        transporter.sendMail(smsInfo, function(error, data) {
            if (error) {
                let errorTime = (new Date()).toLocaleString();
                console.log(errorTime + 
                            ": An error occurred while sending the general reminder text message.");
                console.error("error = ", [error]);
                console.log("");
                loggingData += "        error = " + error + "\n";
            } else {
                let sentTime = (new Date()).toLocaleString();
                console.log(sentTime + ": The general reminder text message was successfully sent.");
                loggingData += "        " + sentTime + ": The general reminder text message was successfully sent. \n";
            }
        });
        loggingData += "    Post: sendingSMS. \n";
    }
    loggingData += (new Date()).toLocaleString() + " EXITING: sendGeneralReminder() \n\n";

    // Changing dir into logging dir:
    process.chdir(process.env.loggingFilePath);
    fs.writeFile( loggingFile, loggingData, {flag:'a'}, function (error, data) {
        if (error) {
          return console.log(error);
        }
    }); 
}







// Setting a timer to check if one or more Reminders need to be sent ------------------------------
// and if so, the server sends out an email and a text message:
var initialSpecificReminderHasNotBeenSent = true;
const possibleMinutes = [0, 15, 30, 45];
const nextAvailable = new Date( ClearDateSecAndMill() );

const currentMinute = nextAvailable.getMinutes();

if (currentMinute < possibleMinutes[1]) {
    nextAvailable.setMinutes( possibleMinutes[1] );

} else if (currentMinute < possibleMinutes[2]) {
    nextAvailable.setMinutes( possibleMinutes[2] );

} else if (currentMinute < possibleMinutes[3]) {
    nextAvailable.setMinutes( possibleMinutes[3] );

} else {
    nextAvailable.setHours( nextAvailable.getHours() + 1 );
    nextAvailable.setMinutes( possibleMinutes[0] );
}

const remainingMS = nextAvailable - (new Date());

setTimeout(function() {
    setInterval(triggerSpecifiedReminder, (1000 * 60 * 15));

    if (initialSpecificReminderHasNotBeenSent) {
        initialSpecificReminderHasNotBeenSent = false;
        triggerSpecifiedReminder();
    }
}, remainingMS);




async function triggerSpecifiedReminder() {
    var loggingData = (new Date()).toLocaleString() + " ENTERING: triggerSpecifiedReminder(). \n";
    const fullDate = new Date();
    // Month + 1 is an odd JavaScript behavior as it starts at index 0: https://stackoverflow.com/a/14680423
    const dateToday = fullDate.getFullYear() + "-" + (fullDate.getMonth() + 1) + "-" + fullDate.getDate();
    const loggingFile = "RemindMe- " + dateToday + ".txt";

    const allUserReminders = await processAllUserReminders(loggingFile);

    let currentTime = new Date();
    // Checking if it's a few seconds behind than desired.
    // It's a loop because the timer keeps getting triggered a few seconds earlier
    // as time goes on (like a second faster every few weeks).
    while (currentTime.getMinutes() === possibleMinutes[1] - 1 || 
        currentTime.getMinutes() === possibleMinutes[2] - 1 ||
        currentTime.getMinutes() === possibleMinutes[3] - 1 ||
        currentTime.getMinutes() === 59) {
        
        loggingData += "    Pre: sleep(). \n";
        // Waiting for five seconds because the earlies this function has ever been
        // called is four seconds early.
        await sleep(1000 * 5);
        loggingData += "    Post: sleep(). \n";

        currentTime = new Date();
    }


    allUserReminders.forEach(function(currUserAllActiveReminders, index) {
        loggingData += "    " + (new Date()).toLocaleString() + " Accessing a user's reminders. \n";

        const userEmail = currUserAllActiveReminders[0].user_email;
        const userCPCarrierEmailExtn = currUserAllActiveReminders[0].user_cp_carrier_email_extn;
        const userPNum = currUserAllActiveReminders[0].user_p_num;
        const userFName = currUserAllActiveReminders[0].user_f_name;
        const userTimeZone = currUserAllActiveReminders[0].user_time_zone;

        
        const allActive = currUserAllActiveReminders;

        // For each reminder, this array will contain 4 things, each in separate indexes.
        // [Reminder title, Reminder details, Due date, Reminder date]
        var reminders = [];

        const currentReminderTime = new Date( ClearDateSecAndMill() );

        // The two variables below are used to update the state, that the reminders have been sent out.
        const userId = currUserAllActiveReminders[0].user_id;
        const reminderIdList = [];

        
        allActive.forEach(async function(activeReminder, index) {
            
            const updatedSpecifiedReminder = new Date( 
                ClearDateSecAndMill( activeReminder.reminder_reminder_date ) 
            );

            loggingData += "        updatedSpecifiedReminder.toLocaleString() = " + updatedSpecifiedReminder.toLocaleString() + "\n";
            loggingData += "        currentReminderTime.toLocaleString() = " + currentReminderTime.toLocaleString() + "\n";
            loggingData += "        activeReminder.reminder_reminder_sent = " + activeReminder.reminder_reminder_sent + "\n";

            if ( updatedSpecifiedReminder.getTime() <= currentReminderTime.getTime() && 
                !activeReminder.reminder_reminder_sent ) {

                loggingData += "            Processing to send out reminder.  \n";

                // Quickly updating the DB that this reminder has been sent:
                updateDBReminderSent(true, userId, activeReminder.reminder_id, loggingFile);

                loggingData += "            Returned from updateDBReminderSent() call.  \n";

                
                reminders.push( activeReminder.reminder_title );
                reminders.push( activeReminder.reminder_desc );
                reminders.push( properTime(activeReminder.reminder_due_date, userTimeZone, loggingFile) );
                reminders.push( properTime(activeReminder.reminder_reminder_date, userTimeZone, loggingFile) );

                reminderIdList.push( activeReminder.reminder_id );
            }
            loggingData += "\n";
        });

        loggingData += "    Post: allActive loop. \n";

        if (reminders.length > 0) {
            loggingData += "        Pre: sendSpecifiedReminder() call. \n";
            sendSpecifiedReminder(reminders, userEmail, userCPCarrierEmailExtn, userPNum, userFName,
                                    userId, reminderIdList, loggingFile);
            loggingData += "        Post: sendSpecifiedReminder() call. \n";
        }
        loggingData += "\n";
    });

    loggingData += "Post: allUserReminders loop. \n";
    loggingData += (new Date()).toLocaleString() + " EXITING: triggerSpecifiedReminder() \n\n";

    // Changing dir into logging dir:
    process.chdir(process.env.loggingFilePath);
    fs.writeFile( loggingFile, loggingData, {flag:'a'}, function (error, data) {
        if (error) {
          return console.log(error);
        }
    }); 
}

async function sendSpecifiedReminder(req, userEmail, userCPCarrierEmailExtn, userPNum, userFName,
                                    userId, reminderIdList, loggingFile) {
    
    var loggingData = (new Date()).toLocaleString() + " ENTERING: sendSpecifiedReminder(). \n";
    
    // Step 1: create a reuseable transporter object.
    let transporter = nodeMailer.createTransport({
        host: process.env.host,
        auth: {
            user: process.env.serviceAccount,
            pass: process.env.serviceSecret
        },
        tls: {
            rejectUnauthorized: process.env.usingTLS
        }
    });

    var emailReminders = "";
    var smsReminders = "\n";
    
    if (req.length > 0) {
        loggingData += "    " + (new Date()).toLocaleString() + " Processing a user's reminders. \n";

        req.forEach(function(reminderData, index) {

            if (index % 4 === 0) {
                emailReminders += `<h1 style="text-indent: 40px;">${reminderData}</h1>`;
                smsReminders += "            " + reminderData + "\n";
            } else if (index % 4 === 1) {
                emailReminders += `
                    <div style="white-space: nowrap; overflow-x: auto;">
                        <h3 style="display: inline-block; padding:0; margin:0;">Details:</h3>
                        <p style="font-size:18px; display: inline-block; padding:0; margin:0; text-indent: 5px;">
                            ${reminderData}
                        </p>
                    </div>`;
                smsReminders += `Details: ${reminderData} \n`;
            } else if (index % 4 === 2) {
                emailReminders += `
                    <div style="white-space: nowrap; overflow-x: auto;">
                        <h3 style="display: inline-block; padding:0; margin:0;">Due Date:</h3>
                        <p style="font-size:18px; display: inline-block; padding:0; margin:0; text-indent: 5px;">
                            ${reminderData}
                        </p>
                    </div>`;
                smsReminders += `Due Date: ${reminderData}  \n`;
            } else {
                emailReminders += `
                    <div style="white-space: nowrap; overflow-x: auto;">
                        <h3 style="display: inline-block; padding:0; margin:0;">Reminder Date:</h3>
                        <p style="font-size:18px; display: inline-block; padding:0; margin:0; text-indent: 5px;">
                            ${reminderData}
                        </p>
                    </div>`;
                smsReminders += `Reminder Date: ${reminderData} \n\n`;
            }
        });
    } 

    var initialGreeting = "Here is the task";

    /* 4 because each reminder contains four components: [title, details, due date, reminder date].
     * So if there are more than 4, we know there are at least two reminders so the grammar needs 
     * to be adjusted.
     */
    if (req.length > 4) {
        initialGreeting = "Here are the tasks";
    }

    // Step 2, part 1: sending email with defined transport object:
    let emailInfo = {
        from: `RemindMe <${process.env.serviceEmail}>`,
        to: `${userEmail}`,
        subject: "RemindMe: Specific Reminder",
        html: `
        <div style="color: #000 !important;">
            <center>
                <h1 style="color: #000;">RemindMe</h1>
            </center>

            <h3 style="color: #000;">Hi ${userFName},</h3>
            <h3 style="color: #000; text-indent: 40px;"> 
            ${initialGreeting} which you wanted to be reminded about. 
            Make sure to keep moving forward and keep making the most out of this day!
            </h3>
            <br/>
            
            ${emailReminders}
        </div>
        
        <br/>
        <div>
            <!--[if mso]>
            <center>
                <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="https://RemindMeee.com" style="height:40px;v-text-anchor:middle;width:200px;" arcsize="25%" strokecolor="#000" fillcolor="#8B4513">
                    <w:anchorlock/>
                    <center style="color:#fff; font-family:sans-serif; font-size:15px; font-weight:bold;">
                        RemindMeee.com
                    </center>
                </v:roundrect>
            </center>
            <![endif]-->

            <center>
                <a 
                    href="https://RemindMeee.com" 
                    style="background-color:#8B4513; border:1px solid #000; border-radius:10px; color:#fff; display:inline-block; font-family:sans-serif; font-size:15px; font-weight:bold; line-height:40px; text-align:center; text-decoration:none; width:200px; -webkit-text-size-adjust:none; mso-hide:all;">

                    RemindMeee.com
                </a>
            </center>
        </div>
        `
    };

    loggingData += "Pre: sendingEmail. \n";

    transporter.sendMail(emailInfo, function(error, data) {
        if (error) {
            let errorTime = (new Date()).toLocaleString();
            console.log(errorTime + ": An error occurred while sending the specified reminder email.");
            console.error("error = ", [error]);
            console.log("");
            loggingData += "        error = " + error + "\n";

            // Updating the DB that the reminder has failed to be sent properly:
            reminderIdList.forEach(async function(reminderId, index) {

                updateDBReminderSent(false, userId, reminderId);
            });

        } else {
            let sentTime = (new Date()).toLocaleString();
            console.log(sentTime + ": The specified reminder email was successfully sent.");
            loggingData += "        " + sentTime + ": The specified reminder email was successfully sent. \n";
        }
    });
    loggingData += "Post: sendingEmail. \n";

    // Checking if the phone number was provided before sending out an SMS:
    const userPNumNoSpaces = userPNum.replace(/\s/g,'');
    if (userPNumNoSpaces !== '') {
        loggingData += "    Pre: sendingSMS. \n";

        // Step 2, part 2: sending a text message with defined transport object:
        let smsInfo = {
            from: `RemindMe <${process.env.serviceEmail}>`,
            to: `${userPNum}${userCPCarrierEmailExtn}`,
            subject: "RemindMe: Specific Reminder",
            text: `Hi ${userFName},
            ${initialGreeting} which you wanted to be reminded about. Make sure to keep moving forward and keep making the most out of this day!
            ${smsReminders}
            Click the link below to view all of your reminders: 
            RemindMeee.com `
        };

        transporter.sendMail(smsInfo, function(error, data) {
            if (error) {
                let errorTime = (new Date()).toLocaleString();
                console.log(errorTime + 
                            ": An error occurred while sending the specified reminder text message.");
                console.error("error = ", [error]);
                console.log("");
                loggingData += "        error = " + error + "\n";
            } else {
                let sentTime = (new Date()).toLocaleString();
                console.log(sentTime + ": The specified reminder text message was successfully sent.");
                loggingData += "        " + sentTime + ": The specified reminder text message was successfully sent. \n";
            }
        });
        loggingData += "    Post: sendingSMS. \n";
    }

    loggingData += (new Date()).toLocaleString() + " EXITING: sendSpecifiedReminder() \n\n";

    // Changing dir into logging dir:
    process.chdir(process.env.loggingFilePath);
    fs.writeFile( loggingFile, loggingData, {flag:'a'}, function (error, data) {
        if (error) {
          return console.log(error);
        }
    }); 
}

async function updateDBReminderSent(sent, userId, reminderId, loggingFile) {
    var loggingData = (new Date()).toLocaleString() + " ENTERING: updateDBReminderSent(). \n";
    
    try {
        const updateActiveReminders = await pool.query(
            "UPDATE active_reminders SET reminder_reminder_sent = $1 WHERE user_id = $2 AND reminder_id = $3;",
            [sent, userId, reminderId]
        );

        const updateAllReminders = await pool.query(
            "UPDATE all_reminders SET reminder_reminder_sent = $1 WHERE user_id = $2 AND reminder_id = $3;",
            [sent, userId, reminderId]
        );

        // Checking if the Overdue table has this reminder, and if so, 
        // update the sent state as well:
        const checkOverdueContains = await pool.query(
            "SELECT * FROM overdue_reminders WHERE user_id = $1 AND reminder_id = $2;", 
            [userId, reminderId]
        );

        if (checkOverdueContains.rows.length > 0) {
            const updateOverdueReminders = await pool.query(
                "UPDATE overdue_reminders SET reminder_reminder_sent = $1 WHERE user_id = $2 AND reminder_id = $3;",
                [sent, userId, reminderId]
            );
        }
    
    } catch (error) {
        console.error(error.message);
        loggingData += "    error = " + error + "\n";
    }

    loggingData += (new Date()).toLocaleString() + " EXITING: updateDBReminderSent() \n\n";

    // Changing dir into logging dir:
    process.chdir(process.env.loggingFilePath);
    fs.writeFile( loggingFile, loggingData, {flag:'a'}, function (error, data) {
        if (error) {
          return console.log(error);
        }
    }); 
}

// Returns a string with the user's proper time zone:
function properTime(time, userTimeZone, loggingFile) {
    var loggingData = (new Date()).toLocaleString() + " ENTERING: properTime(). \n";

    const minInHr = 60;

    const dbTimeZone = (-1) * ( (new Date()).getTimezoneOffset() / minInHr );
    var timeInDBTimeZoneInMill = (new Date(time)).getTime();
    var dbTimeZoneRemoved;

    const dbUTCOffset = dbTimeZone * minInHr;
    var userUTCOffset = userTimeZone * minInHr;

    // Meaning if the UTC is a negative value:
    if (dbUTCOffset < 0) {
        dbTimeZoneRemoved = timeInDBTimeZoneInMill + (-1)*(1000 * 60 * dbUTCOffset);
    } else {
        dbTimeZoneRemoved = timeInDBTimeZoneInMill + (1000 * 60 * dbUTCOffset);
    }

    const utcTimeInMill = dbTimeZoneRemoved;
    var userTime = utcTimeInMill +  (1000 * 60 * userUTCOffset);

    var dateOptions = { dateStyle: "full", timeStyle: "short" }

    loggingData += (new Date()).toLocaleString() + " EXITING: properTime() \n\n";

    // Changing dir into logging dir:
    process.chdir(process.env.loggingFilePath);
    fs.writeFile( loggingFile, loggingData, {flag:'a'}, function (error, data) {
        if (error) {
          return console.log(error);
        }
    });

    return (new Date(userTime)).toLocaleString("en-US", dateOptions);
}
/************************************** END: Email and Text Message services *********************/
/************************************** START: HELPER FUNCTIONS **********************************/
// Clearing the minutes, seconds, and milliseconds of the given date.
// Returns the Date object in milliseconds form.
function ClearDateMinAndSecAndMill(givenDate) {
    const dateObj = new Date( ClearDateSecAndMill(givenDate) );
    dateObj.setMinutes(0);
    return dateObj.getTime();
}

// Clears out the seconds and milliseconds of a Date object and
// returns the Date object in milliseconds form.
function ClearDateSecAndMill(givenDate) {
    if (!givenDate) {
        givenDate = new Date();
    }
    const dateObj = new Date(givenDate);
    dateObj.setSeconds(0);
	dateObj.setMilliseconds(0);
    return dateObj.getTime();
}

/* Helper function to pause the reminders if they are early, so the user gets
 * their reminder at the exact time they requested.
 */
function sleep(ms) {
    return new Promise((accept) => {
        setTimeout(() => {
            accept();
        }, ms);
    });
}
/************************************** END: HELPER FUNCTIONS ************************************/

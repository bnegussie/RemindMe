const expressLib = require("express");
const app = expressLib();

const nodeMailer = require('nodeMailer');

// Setting up the Middleware (Express):
const corsLib = require("cors");

// Connecting to the DB:
const pool = require("./db");
require("dotenv").config();

// Allowing client to access data from the client side:
app.use(expressLib.json());

// Connecting the back & front end:
app.use(corsLib());



// ROUTES (defined in jwtAuth.js):---------------------------->

// SignUp and login routes:
// Every time this path is hit in the URL, then it's going to go 
// to that route file and run what is there:
app.use("/auth", require("./routes/jwtAuth"));

app.use("/dashboard", require("./routes/dashboard"));



/************************************** START: Email and Text Message services *******************/

async function processAllUserReminders() {
    try {
        // The way in which this data is process reverses the data so
        // we end up looking at the upcoming reminders first, categorized by each user.
        const activeRemindersPlusUserData = await pool.query(
            "SELECT * FROM active_reminders AS a_r INNER JOIN users AS u ON a_r.user_id = u.user_id ORDER BY a_r.user_id DESC, a_r.reminder_due_date DESC, a_r.reminder_title DESC;");
        
        const reminderLength = activeRemindersPlusUserData.rowCount;
        var rIndex = 0;
        const allUserReminders = [];

        while (rIndex < reminderLength) {
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
        return allUserReminders;

    } catch (error) {
        console.error(error.message);
    }
}



// Setting up the time trigger to send the user, their daily list of reminders.--------------------------
var timeNow = new Date();
var millisTillSixAM = new Date(timeNow.getFullYear(), timeNow.getMonth(), 
                                timeNow.getDate(), 9, 0, 0, 0) - timeNow;

if (millisTillSixAM < 0) {
    millisTillSixAM += new Date(timeNow.getFullYear(), timeNow.getMonth(), 
                (timeNow.getDate()  + 1), 9, 0, 0, 0).getTime(); // it's after 6am, try 6am tomorrow.
} else {
    setTimeout( triggerGeneralEmail, millisTillSixAM );		
}




async function triggerGeneralEmail() {
    try {
        const allUserReminders = await processAllUserReminders();

        allUserReminders.forEach(function(currUserAllActiveReminders, index) {
            const allActive = currUserAllActiveReminders;

            const userEmail = allActive[0].user_email;
            const userCPCarrierEmailExtn = allActive[0].user_cp_carrier_email_extn;
            const userPNum = allActive[0].user_p_num;
            const userFName = allActive[0].user_f_name;

            var lookedThroughTheUpcomingWeekReminders = false;
            var activeLength = allActive.length;
            var activeIndex = 0;

            if (activeLength === 0) {
                return
            }

            const today = new Date();
            var oneWeek = new Date();
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

            const dueDate = new Date(allActive[activeIndex].reminder_due_date);
            const dueDateTime = dueDate.getTime();

            if (dueDateTime >= upcomingDates[8]) {
                // There are not any reminders within the next seven days.				
                return
            }

            while (activeIndex < activeLength && !lookedThroughTheUpcomingWeekReminders) {

                const dueDate = new Date(allActive[activeIndex].reminder_due_date);
                const dueDateTime = dueDate.getTime();

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

                activeIndex++;
            }

            // eslint-disable-next-line
            sendGeneralReminderEmail(reminders, userEmail, userCPCarrierEmailExtn, userPNum, userFName);
        });

    } catch (error) {
        console.error(error.message);
    }
}

async function sendGeneralReminderEmail(req, userEmail, userCPCarrierEmailExtn, userPNum, userFName) {
    
    // Step 1: create a reuseable transporter object.
    let transporter = nodeMailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.userEmail,
            pass: process.env.userSecret
        }
    });

    let todayEmail = "", tomorrowEmail = "", inTwoDaysEmail = "", inThreeDaysEmail = "", 
        inLessThanAWeekEmail = "", overdueEmail = "";

    let allSMSReminders = "\n";

    if (req[0] !== "") {
        let todayTasks = req[0].split("<br/>").reverse();
        const todayTasksLength = todayTasks.length;
        let todayTasksIndex = 0;

        todayEmail = `<li> <h2>Due today:</h2> </li>`;
        allSMSReminders += "        Due today: \n";

        // The last element is empty:
        todayTasks.pop();

        while (todayTasksIndex < todayTasksLength - 1) {
            let task = todayTasks.pop();
            todayEmail += `
                <div style="white-space: nowrap; overflow-x: auto;">
                    <h3 style="display: inline-block; padding:0; margin:0;">Task:</h3>
                    <p style="font-size:18px; display: inline-block; padding:0; margin:0;">
                        ${task}
                    </p>
                </div>`;
            allSMSReminders += `Task: ${task} \n`;

            todayTasksIndex++;
        }
        allSMSReminders += "\n";
    }
    if (req[1] !== "") {
        let tmrTasks = req[1].split("<br/>").reverse();
        const tmrTasksLength = tmrTasks.length;
        let tmrTasksIndex = 0;

        tomorrowEmail = `<li> <h2>Due tomorrow:</h2> </li>`;
        allSMSReminders += "        Due tomorrow: \n";

        // The last element is empty:
        tmrTasks.pop();

        while (tmrTasksIndex < tmrTasksLength - 1) {
            let task = tmrTasks.pop();
            tomorrowEmail += `
                <div style="white-space: nowrap; overflow-x: auto;">
                    <h3 style="display: inline-block; padding:0; margin:0;">Task:</h3>
                    <p style="font-size:18px; display: inline-block; padding:0; margin:0;">
                        ${task}
                    </p>
                </div>`;
            allSMSReminders += `Task: ${task} \n`;

            tmrTasksIndex++;
        }
        allSMSReminders += "\n";
    }
    if (req[2] !== "") {
        let tasksInTwoDays = req[2].split("<br/>").reverse();
        const tasksInTwoDaysLength = tasksInTwoDays.length;
        let tasksInTwoDaysIndex = 0;

        inTwoDaysEmail = `<li> <h2>Due in two days:</h2> </li>`;
        allSMSReminders += "        Due in two days: \n"

        // The last element is empty:
        tasksInTwoDays.pop();

        while (tasksInTwoDaysIndex < tasksInTwoDaysLength - 1) {
            let task = tasksInTwoDays.pop();
            inTwoDaysEmail += `
                <div style="white-space: nowrap; overflow-x: auto;">
                    <h3 style="display: inline-block; padding:0; margin:0;">Task:</h3>
                    <p style="font-size:18px; display: inline-block; padding:0; margin:0;">
                        ${task}
                    </p>
                </div>`;
            allSMSReminders += `Task: ${task} \n`;

            tasksInTwoDaysIndex++;
        }
        allSMSReminders += "\n";
    }
    if (req[3] !== "") {
        let tasksInThreeDays = req[3].split("<br/>").reverse();
        const tasksInThreeDaysLength = tasksInThreeDays.length;
        let tasksInThreeDaysIndex = 0;

        inThreeDaysEmail = `<li> <h2>Due in three days:</h2> </li>`;
        allSMSReminders += "        Due in three days: \n";

        // The last element is empty:
        tasksInThreeDays.pop();

        while (tasksInThreeDaysIndex < tasksInThreeDaysLength - 1) {
            let task = tasksInThreeDays.pop();
            inThreeDaysEmail += `
                <div style="white-space: nowrap; overflow-x: auto;">
                    <h3 style="display: inline-block; padding:0; margin:0;">Task:</h3>
                    <p style="font-size:18px; display: inline-block; padding:0; margin:0;">
                        ${task}
                    </p>
                </div>`;
            allSMSReminders += `Task: ${task} \n`;

            tasksInThreeDaysIndex++;
        }
        allSMSReminders += "\n";
    }
    if (req[4] !== "") {
        let tasksInLessThanAWeek = req[4].split("<br/>").reverse();
        const tasksInLessThanAWeekLength = tasksInLessThanAWeek.length;
        let tasksInLessThanAWeekIndex = 0;

        inLessThanAWeekEmail = `<li> <h2>Due in less than a week:</h2> </li>`;
        allSMSReminders += "        Due in less than a week: \n";

        // The last element is empty:
        tasksInLessThanAWeek.pop();

        while (tasksInLessThanAWeekIndex < tasksInLessThanAWeekLength - 1) {
            let task = tasksInLessThanAWeek.pop();
            inLessThanAWeekEmail += `
                <div style="white-space: nowrap; overflow-x: auto;">
                    <h3 style="display: inline-block; padding:0; margin:0;">Task:</h3>
                    <p style="font-size:18px; display: inline-block; padding:0; margin:0;">
                        ${task}
                    </p>
                </div>`;
            allSMSReminders += `Task: ${task} \n`;

            tasksInLessThanAWeekIndex++;
        }
        allSMSReminders += "\n";
    }
    
    if (req[5] !== "") {
        let overdueTasks = req[5].split("<br/>").reverse();
        const overdueTasksLength = overdueTasks.length;
        let overdueTasksIndex = 0;

        overdueEmail = `<li> <h2 style="color:red;">Overdue:</h2> </li>`;
        allSMSReminders += "        Overdue: \n";

        // The last element is empty:
        overdueTasks.pop();

        while (overdueTasksIndex < overdueTasksLength - 1) {
            let task = overdueTasks.pop();
            overdueEmail += `
                <div style="white-space: nowrap; overflow-x: auto;">
                    <h3 style="display: inline-block; padding:0; margin:0;">Task:</h3>
                    <p style="font-size:18px; display: inline-block; padding:0; margin:0; color:red;">
                        ${task}
                    </p>
                </div>`;
            allSMSReminders += `Task: ${task} \n`;

            overdueTasksIndex++;
        }
        allSMSReminders += "\n";
    }

    // Step 2, part 1: sending email with defined transport object:
    let emailInfo = {
        from: "RemindMe <brookninfo@gmail.com>",
        to: `${userEmail}`,
        subject: "RemindMe: General Daily Reminders",
        text: "RemindMe",
        html: `
        <center><h1>RemindMe</h1></center>

        <h3>Hi ${userFName},</h3>
        <h3 style="text-indent: 50px;"> 
        We just wanted to remind you about your upcoming tasks. We hope that you make 
        the most out of this day!
        </h3>
        <br/>
        
        ${todayEmail}

        ${tomorrowEmail}
        
        ${inTwoDaysEmail}
        
        ${inThreeDaysEmail}
        
        ${inLessThanAWeekEmail}

        ${overdueEmail}
        
        <br/>
        <center>
            <a href='http://localhost:3000'>
                <button style="font-weight: bold; font-size: 15px;">
                    Click here to view all of your reminders
                </button>
            </a>
        </center>
        `
    };

    transporter.sendMail(emailInfo, function(error, data) {
        if (error) {
            console.log("An error occurred while sending the general reminder email.");
            console.error(error.message);
        } else {
            console.log("The general reminder email was successfully sent.");
        }
    });

    // Checking if the phone number was provided before sending out an SMS:
    const userPNumNoSpaces = userPNum.replace(/\s/g,'');
    if (userPNumNoSpaces !== '') {
        // Step 2, part 2: sending text message with defined transport object:
        let smsInfo = {
            from: "RemindMe <brookninfo@gmail.com>",
            to: `${userPNum}${userCPCarrierEmailExtn}`,
            subject: "RemindMe: General Daily Reminders",
            text: `Hi ${userFName},
            We just wanted to remind you about your upcoming tasks. We hope that you make the most out of this day!
            ${allSMSReminders}
            Click here to view all of your reminders: 
            http://localhost:3000
            `
        };

        transporter.sendMail(smsInfo, function(error, data) {
            if (error) {
                console.log("An error occurred while sending the general reminder text message.");
                console.error(error.message);
            } else {
                console.log("The general reminder text message was successfully sent.");
            }
        });
    }
}







// Setting a timer to check if one or more Reminders need to be sent ------------------------------
// out every five minutes; and if so, the server sends out an email and a text message:
const possibleMinutes = [0, 5];
const now = new Date();
var nextAvailable;
var finalMinute;

const smallMinute = now.getMinutes() % 10;
const bigMinute = Math.floor(now.getMinutes() / 10);

if (smallMinute < possibleMinutes[1]) {
    if (bigMinute === 0) {
        finalMinute = possibleMinutes[1];
    } else {
        finalMinute = bigMinute * 10 + possibleMinutes[1];
    }

} else {
    if (bigMinute === 0) {
        finalMinute = possibleMinutes[0];
    } else {
        finalMinute = (bigMinute + 1) * 10 + possibleMinutes[0];
    }
}
nextAvailable = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 
                        now.getHours(), finalMinute, 0, 0);

const remainingMS = nextAvailable - now;

setTimeout(function() {
    setInterval(triggerSpecifiedReminderEmailAndSMS, (1000 * 60 * 5));
}, remainingMS);





async function triggerSpecifiedReminderEmailAndSMS() {

    const allUserReminders = await processAllUserReminders();

    allUserReminders.forEach(function(currUserAllActiveReminders, index) {
        const userEmail = currUserAllActiveReminders[0].user_email;
        const userCPCarrierEmailExtn = currUserAllActiveReminders[0].user_cp_carrier_email_extn;
        const userPNum = currUserAllActiveReminders[0].user_p_num;
        const userFName = currUserAllActiveReminders[0].user_f_name;

        
        const allActive = currUserAllActiveReminders;

        // For each reminder, this array will contain 4 things, each in seperate indexes.
        // [Reminder title, Reminder details, Due date, Reminder date]
        var reminders = [];

        const current = new Date();
        const currentReminderTime = new Date(current.getFullYear(), current.getMonth(), current.getDate(), 
                                current.getHours(), current.getMinutes(), 0, 0);

        
        allActive.forEach(function(activeReminder, index) {
            const specifiedReminder = new Date(activeReminder.reminder_reminder_date);
            const updatedSpecifiedReminder = new Date(specifiedReminder.getFullYear(), 
                                specifiedReminder.getMonth(), specifiedReminder.getDate(), 
                                specifiedReminder.getHours(), specifiedReminder.getMinutes(), 0, 0);

            if (updatedSpecifiedReminder.getTime() === currentReminderTime.getTime()) {
                var dateOptions = { dateStyle: "full", timeStyle: "short" }

                reminders.push( activeReminder.reminder_title );
                reminders.push( activeReminder.reminder_desc );
                reminders.push( 
                    (new Date(activeReminder.reminder_due_date)).toLocaleString("en-US", dateOptions) );
                reminders.push( 
                    (new Date(activeReminder.reminder_reminder_date)).toLocaleString("en-US", dateOptions) );
            }
        });

        if (reminders.length > 0) {
            sendSpecifiedReminderEmail(reminders, userEmail, userCPCarrierEmailExtn, userPNum, userFName);
        }
    });
}

async function sendSpecifiedReminderEmail(req, userEmail, userCPCarrierEmailExtn, userPNum, userFName) {
    
    // Step 1: create a reuseable transporter object.
    let transporter = nodeMailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.userEmail,
            pass: process.env.userSecret
        }
    });

    var emailReminders = "";
    var smsReminders = "\n";
    
    if (req.length > 0) {

        req.forEach(function(reminderData, index) {

            if (index % 4 === 0) {
                emailReminders += `<li> <h2>${reminderData}</h2> </li>`;
                smsReminders += "        " + reminderData + "\n";
            } else if (index % 4 === 1) {
                emailReminders += `
                    <div style="white-space: nowrap; overflow-x: auto;">
                        <h3 style="display: inline-block; padding:0; margin:0;">Details:</h3>
                        <p style="font-size:18px; display: inline-block; padding:0; margin:0;">
                            ${reminderData}
                        </p>
                    </div>`;
                smsReminders += `Details: ${reminderData} \n`;
            } else if (index % 4 === 2) {
                emailReminders += `
                    <div style="white-space: nowrap; overflow-x: auto;">
                        <h3 style="display: inline-block; padding:0; margin:0;">Due Date:</h3>
                        <p style="font-size:18px; display: inline-block; padding:0; margin:0;">
                            ${reminderData}
                        </p>
                    </div>`;
                smsReminders += `Due Date: ${reminderData}  \n`;
            } else {
                emailReminders += `
                    <div style="white-space: nowrap; overflow-x: auto;">
                        <h3 style="display: inline-block; padding:0; margin:0;">Reminder Date:</h3>
                        <p style="font-size:18px; display: inline-block; padding:0; margin:0;">
                            ${reminderData}
                        </p>
                    </div>`;
                smsReminders += `Reminder Date: ${reminderData} \n\n`;
            }
        });
    } 

    // Step 2, part 1: sending email with defined transport object:
    let emailInfo = {
        from: "RemindMe <brookninfo@gmail.com>",
        to: `${userEmail}`,
        subject: "RemindMe: Specific Reminders",
        html: `
        <center><h1>RemindMe</h1></center>

        <h3>Hi ${userFName},</h3>
        <h3 style="text-indent: 50px;"> 
        Here are the tasks which you wanted us to remind you about. We hope that you 
        make the most out of this day!
        </h3><br/>
        
        ${emailReminders}
        
        <br/>
        <center>
            <a href='http://localhost:3000'>
                <button style="font-weight: bold; font-size: 15px;">
                    Click here to view all of your reminders
                </button>
            </a>
        </center>
        `
    };

    transporter.sendMail(emailInfo, function(error, data) {
        if (error) {
            console.log("An error occurred while sending the specified reminder email.");
            console.error(error.message);
        } else {
            console.log("The specified reminder email was successfully sent.");
        }
    });

    // Checking if the phone number was provided before sending out an SMS:
    const userPNumNoSpaces = userPNum.replace(/\s/g,'');
    if (userPNumNoSpaces !== '') {
        // Step 2, part 2: sending a text message with defined transport object:
        let smsInfo = {
            from: "RemindMe <brookninfo@gmail.com>",
            to: `${userPNum}${userCPCarrierEmailExtn}`,
            subject: "RemindMe: Specific Reminders",
            text: `Hi ${userFName},
            Here are the tasks which you wanted us to remind you about. We hope that you make the most out of this day!
            ${smsReminders}
            Click here to view all of your reminders: 
            http://localhost:3000 `
        };

        transporter.sendMail(smsInfo, function(error, data) {
            if (error) {
                console.log("An error occurred while sending the specified reminder text message.");
                console.error(error.message);
            } else {
                console.log("The specified reminder text message was successfully sent.");
            }
        });
    }
}
/************************************** END: Email and Text Message services *********************/



// Listening to a specific port:
app.listen(5000, () => {
    console.log("The server is running on port 5000.");
})

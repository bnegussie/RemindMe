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
    setInterval(processAllUserReminders, (1000 * 60 * 5));
}, remainingMS);



async function processAllUserReminders() {
    try {
        // The way in which this data is process reverses the data so
        // we end up looking at the upcoming reminders first, categorized by each user.
        const activeRemindersPlusUserData = await pool.query(
            "SELECT * FROM active_reminders AS a_r INNER JOIN users AS u ON a_r.user_id = u.user_id ORDER BY a_r.user_id DESC, a_r.reminder_due_date DESC, a_r.reminder_title DESC;");
        
        const reminderLength = activeRemindersPlusUserData.rowCount;
        var rIndex = 0;

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

            triggerSpecifiedReminderEmailAndSMS(currUserReminders);
            
            rIndex++;
        }

    } catch (error) {
        console.error(error.message);
    }
}

async function triggerSpecifiedReminderEmailAndSMS(allActiveReminders) {
    const userEmail = allActiveReminders[0].user_email;
    const userPNum = allActiveReminders[0].user_p_num;
    const userFName = allActiveReminders[0].user_f_name;

    
    const allActive = allActiveReminders;

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
        sendSpecifiedReminderEmail(reminders, userEmail, userPNum, userFName);
    }
}

async function sendSpecifiedReminderEmail(req, userEmail, userPNum, userFName) {
    
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
            to: `${userPNum}@tmomail.net`,
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

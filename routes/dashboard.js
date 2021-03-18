const router = require("express").Router();
const pool = require("../db");
const authorization = require("../middleware/authorization");

require("dotenv").config();
const nodeMailer = require('nodeMailer');



/************************************** STARTS: all_reminders DB ******************************/
// (Creating) Placing a new reminder into the all_reminders DB table:
router.post("/reminder/all", authorization, async(req, res) => {
    try {
        const {completed, title, desc, dueDate, reminderDate, reminderSent} = req.body;

        const addingToAllReminders = await pool.query(
            "INSERT INTO all_reminders (user_id, reminder_completed, reminder_title, reminder_desc, reminder_due_date, reminder_reminder_date, reminder_reminder_sent) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
            [req.user, completed, title, desc, dueDate, reminderDate, reminderSent]
        );

        res.status(200).json(addingToAllReminders.rows[0]);

    } catch (error) {
        console.error(error.message);
    }
});

// Get all reminders, filtering by the user cred:
router.get("/reminder/all", authorization, async(req, res) => {
    try {
        const allReminders = await pool.query(
            "SELECT * FROM all_reminders WHERE user_id = $1 ORDER BY reminder_due_date DESC, reminder_title ASC;", 
            [req.user]
        );

        res.status(200).json(allReminders.rows);

    } catch (error) {
        console.error(error.message);
    }
});

// Get a specific reminder, filtering by the user cred:
router.get("/reminder/all/:id", authorization, async (req, res) => {
    try {
        const {id} = req.params;

        const getReminder = await pool.query(
            "SELECT * FROM all_reminders WHERE reminder_id = $1 AND user_id = $2", [id, req.user]
        );
        if (getReminder.rows.length === 0 ) {
            return res.status(403).json("Unauthorized to get this reminder.");
        }
        
        res.status(200).json(getReminder.rows[0]);
    } catch (error) {
        console.error(error.message);
    }
});

// Updating the reminder task:
router.put("/reminder/all/:id", authorization, async (req, res) => {
    try {
        const {id} = req.params;
        const {completed, title, desc, dueDate, reminderDate, reminderSent} = req.body;

        const updatingAllReminders = await pool.query(
            "UPDATE all_reminders SET reminder_completed = $1, reminder_title = $2, reminder_desc = $3, reminder_due_date = $4, reminder_reminder_date = $5, reminder_reminder_sent = $8 WHERE reminder_id = $6 AND user_id = $7 RETURNING *",
            [completed, title, desc, dueDate, reminderDate, id, req.user, reminderSent]
        );
        if (updatingAllReminders.rows.length === 0 ) {
            return res.status(403).json("Unauthorized to perform this update.");
        }

        res.status(200).json(updatingAllReminders.rows[0]);
    } catch (error) {
        console.error(error.message);
    }
});

// Deleting the reminder from the all DB because the reminder has either 
// been deleted.
router.delete("/reminder/all/:id", authorization, async (req, res) => {
    try {
        const {id} = req.params;
        const deletingResponse = await pool.query(
            "DELETE FROM all_reminders WHERE reminder_id = $1 AND user_id = $2 RETURNING *", [id, req.user]
        );
        if (deletingResponse.rows.length === 0 ) {
            return res.status(403).json("Unauthorized to perform this deletion.");
        }

        res.status(200).json("The reminder was successfully deleted.");
    } catch (error) {
        console.error(error.message);
    }
});
/************************************** ENDS: all_reminders DB ***********************************/
/************************************** START: active_reminders DB ****************************/
// (Creating) Placing a new reminder into the active_reminders DB table:
router.post("/reminder/active", authorization, async(req, res) => {
    try {
        const {id, completed, title, desc, dueDate, reminderDate, reminderSent} = req.body;

        const addingToActiveReminders = await pool.query(
            "INSERT INTO active_reminders (user_id, reminder_id, reminder_completed, reminder_title, reminder_desc, reminder_due_date, reminder_reminder_date, reminder_reminder_sent) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *",
            [req.user, id, completed, title, desc, dueDate, reminderDate, reminderSent]
        );

        res.status(200).json(addingToActiveReminders.rows[0]);

    } catch (error) {
        console.error(error.message);
    }
});

// Get all active reminders, filtering by the user cred:
router.get("/reminder/active", authorization, async(req, res) => {
    try {
        const allActiveReminders = await pool.query(
            "SELECT * FROM active_reminders WHERE user_id = $1 ORDER BY reminder_due_date ASC, reminder_title ASC;",
            [req.user]
        );

        res.status(200).json(allActiveReminders.rows);

    } catch (error) {
        console.error(error.message);
    }
});

// Get a specific reminder, filtering by the user cred:
router.get("/reminder/active/:id", authorization, async (req, res) => {
    try {
        const {id} = req.params;

        const getReminder = await pool.query(
            "SELECT * FROM active_reminders WHERE reminder_id = $1 AND user_id = $2", [id, req.user]
        );
        if (getReminder.rows.length === 0 ) {
            return res.status(403).json("Unauthorized to get this reminder.");
        }
        
        res.status(200).json(getReminder.rows[0]);
    } catch (error) {
        console.error(error.message);
    }
});

// Updating the active reminder task:
router.put("/reminder/active/:id", authorization, async (req, res) => {
    try {
        const {id} = req.params;
        const {completed, title, desc, dueDate, reminderDate, reminderSent} = req.body;

        const updatingActiveReminders = await pool.query(
            "UPDATE active_reminders SET reminder_completed = $1, reminder_title = $2, reminder_desc = $3, reminder_due_date = $4, reminder_reminder_date = $5, reminder_reminder_sent = $8 WHERE EXISTS (SELECT reminder_id FROM active_reminders WHERE reminder_id = $6) AND reminder_id = $6 AND user_id = $7 RETURNING *",
            [completed, title, desc, dueDate, reminderDate, id, req.user, reminderSent]
        );
        if (updatingActiveReminders.rows.length === 0 ) {
            return res.status(403).json("Unauthorized to perform this update.");
        }

        res.status(200).json("The active reminder was updated successfully.");
    } catch (error) {
        console.error(error.message);
    }
});

// Deleting the reminder from active DB because the reminder has either 
// been completed or it has been deleted.
router.delete("/reminder/active/:id", authorization, async (req, res) => {
    try {
        const {id} = req.params;
        const userId = req.user;

        // Checking if this user actually owns this reminder:
        const authorizationCheck = await pool.query(
            "SELECT * FROM all_reminders WHERE user_id = $1 AND reminder_id = $2;",
            [userId, id]
        );

        if (authorizationCheck.rows.length > 0) {
            // Checking if that reminder exists in this table:
            const validationCheck = await pool.query(
                "SELECT * FROM active_reminders WHERE user_id = $1 AND reminder_id = $2;",
                [userId, id]
            );
    
            if (validationCheck.rows.length > 0) {
                const deletingResponse = await pool.query(
                    "DELETE FROM active_reminders WHERE user_id = $1 AND reminder_id = $2 RETURNING *", 
                    [userId, id]
                );
                return res.status(200).json(deletingResponse.rows[0]);
            } else {
                return res.status(200).json("This reminder does not exist.");
            }

        } else {
            return res.status(403).json("Unauthorized to perform this delete action.");
        }

    } catch (error) {
        console.error(error.message);
    }
});
/************************************** END: active_reminders DB *********************************/
/************************************** START: completed_reminders DB ****************************/
// Reminder task completed so it's being added to the completed list.
router.post("/reminder/completed", authorization, async(req, res) => {
    try {
        const {id, completed, title, desc, dueDate, reminderDate, reminderSent} = req.body;

        const addingToCompletedReminders = await pool.query(
            "INSERT INTO completed_reminders (user_id, reminder_id, reminder_completed, reminder_title, reminder_desc, reminder_due_date, reminder_reminder_date, reminder_reminder_sent) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *",
            [req.user, id, completed, title, desc, dueDate, reminderDate, reminderSent]
        );

        res.status(200).json(addingToCompletedReminders.rows[0]);

    } catch (error) {
        console.error(error.message);
    }
});

// Get all completed reminders, filtering by the user cred:
router.get("/reminder/completed", authorization, async(req, res) => {
    try {
        const allCompletedReminders = await pool.query(
            "SELECT * FROM completed_reminders WHERE user_id = $1 ORDER BY reminder_due_date DESC, reminder_title ASC;",
            [req.user]
        );

        res.status(200).json(allCompletedReminders.rows);

    } catch (error) {
        console.error(error.message);
    }
});

// Get a specific reminder, filtering by the user cred:
router.get("/reminder/completed/:id", authorization, async (req, res) => {
    try {
        const {id} = req.params;

        const getReminder = await pool.query(
            "SELECT * FROM completed_reminders WHERE reminder_id = $1 AND user_id = $2", [id, req.user]
        );
        if (getReminder.rows.length === 0 ) {
            return res.status(403).json("Unauthorized to get this reminder.");
        }
        res.status(200).json(getReminder.rows[0]);
    } catch (error) {
        console.error(error.message);
    }
});

// Updating the completed reminder task:
router.put("/reminder/completed/:id", authorization, async (req, res) => {
    try {
        const {id} = req.params;
        const {completed, title, desc, dueDate, reminderDate, reminderSent} = req.body;

        const updatingCompletedReminders = await pool.query(
            "UPDATE completed_reminders SET reminder_completed = $1, reminder_title = $2, reminder_desc = $3, reminder_due_date = $4, reminder_reminder_date = $5, reminder_reminder_sent = $8 WHERE EXISTS (SELECT reminder_id FROM completed_reminders WHERE reminder_id = $6) AND reminder_id = $6 AND user_id = $7 RETURNING *",
            [completed, title, desc, dueDate, reminderDate, id, req.user, reminderSent]
        );
        if (updatingCompletedReminders.rows.length === 0 ) {
            return res.status(403).json("Unauthorized to perform this update.");
        }

        res.status(200).json("The completed reminder was updated successfully.");
    } catch (error) {
        console.error(error.message);
    }
});

// Deleting the reminder from completed DB because the reminder has either been
// marked uncompleted or it has been deleted:
router.delete("/reminder/completed/:id", authorization, async (req, res) => {
    try {
        const {id} = req.params;
        const userId = req.user;

        // Checking if this user actually owns this reminder:
        const authorizationCheck = await pool.query(
            "SELECT * FROM all_reminders WHERE user_id = $1 AND reminder_id = $2;",
            [userId, id]
        );

        if (authorizationCheck.rows.length > 0) {
            // Checking if that reminder exists in this table:
            const validationCheck = await pool.query(
                "SELECT * FROM completed_reminders WHERE user_id = $1 AND reminder_id = $2;",
                [userId, id]
            );
    
            if (validationCheck.rows.length > 0) {
                const deletingResponse = await pool.query(
                    "DELETE FROM completed_reminders WHERE user_id = $1 AND reminder_id = $2 RETURNING *", 
                    [userId, id]
                );
                return res.status(200).json(deletingResponse.rows[0]);
            } else {
                return res.status(200).json("This reminder does not exist.");
            }

        } else {
            return res.status(403).json("Unauthorized to perform this delete action.");
        }

    } catch (error) {
        console.error(error.message);
    }
});
/************************************** END: completed_reminders DB ******************************/
/************************************** START: overdue_reminders DB ******************************/
// Ading to the overdue reminder list.
router.post("/reminder/overdue", authorization, async(req, res) => {
    try {
        const {id, completed, title, desc, dueDate, reminderDate, reminderSent} = req.body;

        const addingToOverdueReminders = await pool.query(
            "INSERT INTO overdue_reminders (user_id, reminder_id, reminder_completed, reminder_title, reminder_desc, reminder_due_date, reminder_reminder_date, reminder_reminder_sent) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *",
            [req.user, id, completed, title, desc, dueDate, reminderDate, reminderSent]
        );

        res.status(200).json(addingToOverdueReminders.rows[0]);

    } catch (error) {
        console.error(error.message);
    }
});

// Get all overdue reminders, filtering by the user cred:
router.get("/reminder/overdue", authorization, async(req, res) => {
    try {
        const allOverdueReminders = await pool.query(
            "SELECT * FROM overdue_reminders WHERE user_id = $1 ORDER BY reminder_due_date ASC, reminder_title ASC;",
            [req.user]
        );

        res.status(200).json(allOverdueReminders.rows);

    } catch (error) {
        console.error(error.message);
    }
});

// Get a specific overdue reminder, filtering by the user cred:
router.get("/reminder/overdue/:id", authorization, async (req, res) => {
    try {
        const {id} = req.params;

        const getOverdueReminder = await pool.query(
            "SELECT * FROM overdue_reminders WHERE reminder_id = $1 AND user_id = $2", [id, req.user]
        );
        if (getOverdueReminder.rows.length === 0 ) {
            return res.status(403).json("Unauthorized to get this reminder.");
        }
        res.status(200).json(getOverdueReminder.rows[0]);
    } catch (error) {
        console.error(error.message);
    }
});

// Updating the completed reminder task:
router.put("/reminder/overdue/:id", authorization, async (req, res) => {
    try {
        const {id} = req.params;
        const {completed, title, desc, dueDate, reminderDate, reminderSent} = req.body;

        const updatingOverdueReminder = await pool.query(
            "UPDATE overdue_reminders SET reminder_completed = $1, reminder_title = $2, reminder_desc = $3, reminder_due_date = $4, reminder_reminder_date = $5, reminder_reminder_sent = $8 WHERE EXISTS (SELECT reminder_id FROM overdue_reminders WHERE reminder_id = $6) AND reminder_id = $6 AND user_id = $7 RETURNING *",
            [completed, title, desc, dueDate, reminderDate, idm, req.user, reminderSent]
        );
        if (updatingOverdueReminder.rows.length === 0 ) {
            return res.status(403).json("Unauthorized to perform this update.");
        }

        res.status(200).json("The overdue reminder was updated successfully.");
    } catch (error) {
        console.error(error.message);
    }
});

// Deleting the reminder from overdue DB because the reminder has either gotten the due date
// updated to an upcomming date or the reminder has completely been removed from this app:
router.delete("/reminder/overdue/:id", authorization, async (req, res) => {
    try {
        const {id} = req.params;
        const userId = req.user;

        // Checking if this user actually owns this reminder:
        const authorizationCheck = await pool.query(
            "SELECT * FROM all_reminders WHERE user_id = $1 AND reminder_id = $2;",
            [userId, id]
        );

        if (authorizationCheck.rows.length > 0) {
            // Checking if that reminder exists in this table:
            const validationCheck = await pool.query(
                "SELECT * FROM overdue_reminders WHERE user_id = $1 AND reminder_id = $2;",
                [userId, id]
            );
    
            if (validationCheck.rows.length > 0) {
                const deletingResponse = await pool.query(
                    "DELETE FROM overdue_reminders WHERE user_id = $1 AND reminder_id = $2;", 
                    [userId, id]
                );
                return res.status(200).json("Successfully deleted the reminder.");
            } else {
                return res.status(200).json("This reminder does not exist.");
            }

        } else {
            return res.status(403).json("Unauthorized to perform this delete action.");
        }
        
    } catch (error) {
        console.error(error.message);
    }
});
/************************************** END: overdue_reminders DB ********************************/
/************************************** START: cellphone_carriers DB *****************************/
// Gets all of the cellphone carriers:
router.get("/reminder/cellphone-carriers", async (req, res) => {
    try {
        const cellphoneCarriers = await pool.query("SELECT * FROM cellphone_carriers ORDER BY carrier_name ASC;");
        res.status(200).json(cellphoneCarriers.rows);
    } catch (error) {
        console.error(error.message);
    }
});
/************************************** END: cellphone_carriers DB *******************************/
/************************************** START: USERS DB ******************************************/
// Provides the user's first name:
router.get("/user/username", authorization, async (req, res) => {
    try {
        const userName = await pool.query(
            "SELECT user_f_name FROM users WHERE user_id = $1", [req.user]
        )
        res.status(200).json(userName.rows[0]);
    } catch (error) {
        console.error(error.message);
    }
})
/************************************** END: USERS DB ********************************************/
/************************************** START: SEARCH BAR ACCESSING all_reminders DB *************/
router.get("/search", authorization, async (req, res) => {
    try {
        const { title } = req.query;
        const userId = req.user;

        const result = await pool.query("SELECT * FROM all_reminders WHERE user_id = $1 AND reminder_title ILIKE $2 ORDER BY reminder_due_date DESC, reminder_title ASC;",
            [userId, `%${title}%`]
        );

        res.status(200).json(result.rows);

    } catch (error) {
        console.error(error.message);
    }
});
/************************************** END: SEARCH BAR ACCESSING all_reminders DB ***************/
/************************************** START: WELCOME MESSAGE ***********************************/
// This API is called once a user signs up for an account.
router.post("/welcome", authorization, async (req, res) => {
    try {
        const { f_name, email, cPhoneCarrierEmailExtn, p_num } = req.body;

        // Making sure to capitalize the user's first name:
        const givenFirstName = f_name;
        var firstNameFinalForm = givenFirstName.charAt(0).toUpperCase();
        if (givenFirstName.length > 1) {
            firstNameFinalForm += givenFirstName.slice(1);
        }

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

        // Step 2, part 1: sending email with defined transport object:
        let emailInfo = {
            from: `RemindMe <${process.env.serviceEmail}>`,
            to: `${email}`,
            subject: "RemindMe: Welcome",
            html: `
            <div style="color: #000 !important;">
                <center>
                    <h1 style="color: #000;">RemindMe</h1>
                </center>

                <h3 style="color: #000;">Hi ${firstNameFinalForm},</h3>
                <h3 style="color: #000; text-indent: 50px;"> 
                Thank you for signing up for an account. Now start reaping the rewards 
                of this application by creating your first reminder task.
                </h3>
            </div>
            
            <br/>
            <div>
                <!--[if mso]>
                <center>
                    <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="https://RemindMeee.com" style="height:40px;v-text-anchor:middle;width:300px;" arcsize="25%" strokecolor="#000" fillcolor="#8B4513">
                        <w:anchorlock/>
                        <center style="color:#fff; font-family:sans-serif; font-size:15px; font-weight:bold;">
                            Click here to create your first reminder
                        </center>
                    </v:roundrect>
                </center>
                <![endif]-->

                <center>
                    <a 
                        href="https://RemindMeee.com" 
                        style="background-color:#8B4513; border:1px solid #000; border-radius:10px; color:#fff; display:inline-block; font-family:sans-serif; font-size:15px; font-weight:bold; line-height:40px; text-align:center; text-decoration:none; width:300px; -webkit-text-size-adjust:none; mso-hide:all;">

                        Click here to create your first reminder
                    </a>
                </center>
            </div>
            `
        };

        transporter.sendMail(emailInfo, function(error, data) {
            if (error) {
                let errorTime = (new Date()).toLocaleString();
                console.log(errorTime + ": An error occurred while sending the welcome email.");
    
            } else {
                let sentTime = (new Date()).toLocaleString();
                console.log(sentTime + ": The welcome email was successfully sent.");
            }
        });

        // Checking if the phone number was provided before sending out an SMS:
        const userPNumNoSpaces = p_num.replace(/\s/g,'');
        if (userPNumNoSpaces !== '') {

            // Step 2, part 2: sending text message with defined transport object:
            let smsInfo = {
                from: `RemindMe <${process.env.serviceEmail}>`,
                to: `${p_num}${cPhoneCarrierEmailExtn}`,
                subject: "RemindMe: Welcome",
                text: `Hi ${firstNameFinalForm},
                Thank you for signing up for an account. Now start reaping the rewards of this application by creating your first reminder task.

                -
                -
                -
                -

                Click the link below to create your first reminder:
                www.RemindMeee.com
                `
            };

            transporter.sendMail(smsInfo, function(error, data) {
                if (error) {
                    let errorTime = (new Date()).toLocaleString();
                    console.log(errorTime + ": An error occurred while sending the welcome text message.");
                } else {
                    let sentTime = (new Date()).toLocaleString();
                    console.log(sentTime + ": The welcome text message was successfully sent.");
                }
            });
        }

        res.status(200).json("Successfully sent welcome message.");

    } catch (error) {
        console.error(error.message);
    }
})
/************************************** END: WELCOME MESSAGE *************************************/



module.exports = router;

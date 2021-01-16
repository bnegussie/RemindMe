const router = require("express").Router();
const pool = require("../db");
const authorization = require("../middleware/authorization");
const bcryptLib = require("bcrypt");

/************************************** START: MY PROFILE ****************************************/
// Getting the general information from the user's profile:
router.get("/general", authorization, async(req, res) => {
    try {
        const generalInfo = await pool.query(
            "SELECT user_f_name, user_l_name, user_email, user_cp_carrier, user_cp_carrier_email_extn, user_p_num FROM users WHERE user_id = $1",
            [req.user]
        );
        res.status(200).json(generalInfo.rows[0]);

    } catch (error) {
        console.error(error.message);
    }
});

router.put("/general", authorization, async(req, res) => {
    try {
        // Breaking down the data provided by the user:
        const { fName, lName, email, cPhoneCarrier, cPhoneCarrierEmailExtn, pNum } = req.body;

        const lowerCaseEmail = email.toLowerCase();
        const userId = req.user;

        // Checking if the user is trying to change their email
        // as this needs to be handled carefully:
        const user = await pool.query("SELECT * FROM users WHERE user_id = $1;", [req.user] );

        
        const userEmailInDB = user.rows[0].user_email;

        if (lowerCaseEmail !== userEmailInDB) {
            const desiredUserEmail = await pool.query("SELECT * FROM users WHERE user_email = $1;", [lowerCaseEmail] );
            if (desiredUserEmail.rows.length > 0) {
                // Someone is already using this email address:
                return res.status(400).json("A user with this email address already exists.");
            }
        }

        const updateUserInfo = await pool.query(
            "UPDATE users SET user_f_name = $1, user_l_name = $2, user_email = $3, user_cp_carrier = $4, user_cp_carrier_email_extn = $5, user_p_num = $6 WHERE user_id = $7",
            [fName, lName, lowerCaseEmail, cPhoneCarrier, cPhoneCarrierEmailExtn, pNum, userId]
        );

        res.status(200).json("Successfully updated the user profile.");
        
    } catch (error) {
        console.error(error.message);
    }
});
/************************************** END: MY PROFILE ******************************************/
/************************************** START: MY PASSWORD ***************************************/
router.put("/pwd", authorization, async (req, res) => {
    try {
        const { currentPwd, newPwd } = req.body;
        const userId = req.user;

        const currentUserPwd = await pool.query("SELECT user_pwd FROM users WHERE user_id = $1",
            [userId]
        );

        // The password is currently encrypted so we have to decrpt it before
        // we compare it with the password the user claims to be their password.
        const validPwd = await bcryptLib.compare(currentPwd, currentUserPwd.rows[0].user_pwd);

        if (!validPwd) {
            return res.status(401).json("Please check your Current Password and try again.");
        }

        // Encrypting the new password:
        const saltRound = 10;
        const salt = await bcryptLib.genSalt(saltRound);
        const bcryptPwd = await bcryptLib.hash(newPwd, salt);

        const changePwd = await pool.query("UPDATE users SET user_pwd = $1 WHERE user_id = $2", 
            [bcryptPwd, userId]
        );

        res.status(200).json("Password has been updated.");


    } catch (error) {
        res.status(500).json(error.message);
    }
});
/************************************** END: MY PASSWORD *****************************************/
/************************************** START: MY ACCOUNT ****************************************/
router.delete("/account", authorization, async (req, res) => {
    try {
        const userId = req.user;

        const dRemindersFromOverdue = await pool.query("DELETE FROM overdue_reminders WHERE user_id = $1", 
            [userId]
        );
        const dRemindersFromCompleted = await pool.query("DELETE FROM completed_reminders WHERE user_id = $1", 
            [userId]
        );
        const dRemindersFromActive = await pool.query("DELETE FROM active_reminders WHERE user_id = $1", 
            [userId]
        );
        const dRemindersFromAll = await pool.query("DELETE FROM all_reminders WHERE user_id = $1", 
            [userId]
        );
        const dUserAccount = await pool.query("DELETE FROM users WHERE user_id = $1", 
            [userId]
        );

        res.status(200).json("All user's data has been remomved.");

    } catch (error) {
        res.status(500).json(error.message);
    }
});
/************************************** END: MY ACCOUNT ******************************************/
/************************************** START: MY GENERAL REMINDER TIME **************************/
router.get("/general/reminder", authorization, async (req, res) => {
    try {
        const userId = req.user;

        const gReminderTime = await pool.query("SELECT user_general_reminder_time FROM users WHERE user_id = $1",
            [userId]
        );
        res.status(200).json(gReminderTime.rows[0]);

    } catch (error) {
        res.status(500).json(error.message);
    }
});

router.put("/general/reminder", authorization, async (req, res) => {
    try {
        const { generalReminderTime } = req.body;
        const userId = req.user;

        const gReminderTime = await pool.query("UPDATE users SET user_general_reminder_time = $1 WHERE user_id = $2",
            [generalReminderTime, userId]
        );
        res.status(200).json("Successfully update the General Reminder Time.");

    } catch (error) {
        res.status(500).json(error.message);
    }
});
/************************************** END: MY GENERAL REMINDER TIME ****************************/

module.exports = router;

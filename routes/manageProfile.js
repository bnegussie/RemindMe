const router = require("express").Router();
const pool = require("../db");
const authorization = require("../middleware/authorization");
const bcryptLib = require("bcrypt");
var crypto = require("crypto");
require("dotenv").config();
const nodeMailer = require('nodeMailer');

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
                return res.status(200).json("A user with this email address already exists.");
            }
        }

        if (pNum !== "") {
            const userWithPNum = await pool.query("SELECT * FROM users WHERE user_p_num = $1 AND user_id != $2", 
                [pNum, userId]
            );
            if (userWithPNum.rows.length !== 0) {
                // 401 = unauthenticated (user already exists):
                return res.status(200).json("A user with this phone number already exists.");
            }
        }

        // Making sure that the user's first and last name is capitalized:
        const firstNameFinalForm = CapitalizeName( fName );
        const lastNameFinalForm = CapitalizeName( lName );

        const updateUserInfo = await pool.query(
            "UPDATE users SET user_f_name = $1, user_l_name = $2, user_email = $3, user_cp_carrier = $4, user_cp_carrier_email_extn = $5, user_p_num = $6 WHERE user_id = $7",
            [firstNameFinalForm, lastNameFinalForm, lowerCaseEmail, cPhoneCarrier, cPhoneCarrierEmailExtn, pNum, userId]
        );

        res.status(200).json("Your Profile has now been successfully update!");
        
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
            return res.status(200).json("Please check your Current Password and try again.");
        }

        // Encrypting the new password:
        const saltRound = 10;
        const salt = await bcryptLib.genSalt(saltRound);
        const bcryptPwd = await bcryptLib.hash(newPwd, salt);

        const changePwd = await pool.query("UPDATE users SET user_pwd = $1 WHERE user_id = $2", 
            [bcryptPwd, userId]
        );

        res.status(200).json("Your password has now been successfully updated!");

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
        const { newGRT } = req.body;
        const userId = req.user;

        const gReminderTime = await pool.query("UPDATE users SET user_general_reminder_time = $1 WHERE user_id = $2",
            [newGRT, userId]
        );
        res.status(200).json("Successfully update the General Reminder Time.");

    } catch (error) {
        res.status(500).json(error.message);
    }
});
/************************************** END: MY GENERAL REMINDER TIME ****************************/
/************************************** START: FORGOT AND RESET PASSWORD *************************/
router.post("/forgotpwd", async (req, res) => {
    try {
        const { email } = req.body;
        
        // Checking if the user even exists:
        const user = await pool.query("SELECT * FROM users WHERE user_email = $1", [email]);

        if (user.rows.length === 0) {
            return res.status(200).json("A user with this email does not exist.");
        }


        // Generating the URL for this user to reset their password:
        const urlStarterLink = crypto.randomBytes(20).toString('hex');
        const saltRound = 12;
        const salt = await bcryptLib.genSalt(saltRound);
        const bcryptURL = await bcryptLib.hash(urlStarterLink, salt);
        const partialUserURL = email + "/" + bcryptURL;


        // Placing URL into user's account along with a time stamp
        // because the link will not be valid after one hour:
        const updateUser = await pool.query("UPDATE users SET user_reset_pwd_url = $1, user_reset_pwd_time = $2 WHERE user_email = $3",
            [partialUserURL, new Date(), email]
        );


        const fName = user.rows[0].user_f_name;
        const pNum = user.rows[0].user_p_num;
        const cPhoneCarrierEmailExtn = user.rows[0].user_cp_carrier_email_extn;

        await sendResetPwdLink(fName, email, cPhoneCarrierEmailExtn, pNum, partialUserURL);


        var successMessage = "A Reset Password link has been sent to you via email ";

        const userPNumNoSpaces = pNum.replace(/\s/g,'');
        if (userPNumNoSpaces !== '') {
            successMessage += "and text message ";
        }
        successMessage += "now.";

        res.status(200).json(successMessage);

    } catch (error) {
        res.status(500).json(error.message);
    }
});

// Simply checking if the given reset URL is valid:
router.get("/resetpwd", async (req, res) => {
    try {
        const { id } = req.query;

        // Checking if it's a valid password reset link:
        const checkId = await pool.query("SELECT * FROM users WHERE user_reset_pwd_url = $1", [id]);

        if (checkId.rows.length === 0) {
            return res.status(200).json({message: "Invalid Reset Password link."});
        }
        // Finished link validity check.


        // Checking if the link has expired (one hour limit):
        const resetLinkDate = (new Date( checkId.rows[0].user_reset_pwd_time )).getTime();

        const now = new Date();
        const deadline = 1000 * 60 * 60;

        if ( now - resetLinkDate >= deadline ) {
            return res.status(200).json({message: "The Reset Password link has expired."});
        }
        // Finished link expiration check.


        const userEmail = checkId.rows[0].user_email;
        res.status(200).json( {userEmail, message: "Valid Reset Password link."} )

    } catch (error) {
        res.status(500).json(error.message);
    }
});

router.put("/resetpwd", async (req, res) => {
    try {
        const { userEmail, newPwd } = req.body;

        if (!userEmail || !newPwd) {
            return res.status(200).json("Invalid values.")
        }

        // Encrypting the new password:
        const saltRound = 10;
        const salt = await bcryptLib.genSalt(saltRound);
        const bcryptPwd = await bcryptLib.hash(newPwd, salt);

        const changePwd = await pool.query("UPDATE users SET user_pwd = $1, user_reset_pwd_url = $2, user_reset_pwd_time = $3 WHERE user_email = $4", 
            [bcryptPwd, '', null,  userEmail]
        );

        res.status(200).json("Your password has now been successfully reset!");

    } catch (error) {
        console.error(error.message);
    }
});
/************************************** END: FORGOT AND RESET PASSWORD ***************************/
/************************************** START: HELPER FUNCTIONS **********************************/
function CapitalizeName(givenName) {
    var nameFinalForm = "";
    if (givenName) {
        nameFinalForm += givenName.charAt(0).toUpperCase();
        if (givenName.length > 1) {
            nameFinalForm += givenName.slice(1);
        }
    }
    
    return nameFinalForm;
}

async function sendResetPwdLink(fName, email, cPhoneCarrierEmailExtn, pNum, partialUserURL ) {
    try {
        const finalURL = "RemindMeee.com/ResetPassword/" + partialUserURL;
        
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
            subject: "RemindMe: Reset Password",
            html: `
            <div style="color: #000 !important;">
                <center>
                    <h1 style="color: #000;">RemindMe</h1>
                </center>

                <h3 style="color: #000;">Hi ${fName},</h3>
                <h3 style="color: #000; text-indent: 50px;"> 
                Please click the button below to reset your password. You have one hour before the
                link expires.
                </h3>
            </div>
            
            <br/>
            <div>
                <!--[if mso]>
                <center>
                    <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="https://${finalURL}" style="height:40px;v-text-anchor:middle;width:300px;" arcsize="25%" strokecolor="#000" fillcolor="#8B4513">
                        <w:anchorlock/>
                        <center style="color:#fff; font-family:sans-serif; font-size:15px; font-weight:bold;">
                            Reset Password
                        </center>
                    </v:roundrect>
                </center>
                <![endif]-->

                <center>
                    <a 
                        href="https://${finalURL}" 
                        style="background-color:#8B4513; border:1px solid #000; border-radius:10px; color:#fff; display:inline-block; font-family:sans-serif; font-size:15px; font-weight:bold; line-height:40px; text-align:center; text-decoration:none; width:300px; -webkit-text-size-adjust:none; mso-hide:all;">

                        Reset Password
                    </a>
                </center>
            </div>
            `
        };

        transporter.sendMail(emailInfo, function(error, data) {
            if (error) {
                let errorTime = (new Date()).toLocaleString();
                console.log(errorTime + ": An error occurred while sending the Reset Password email.");
    
            } else {
                let sentTime = (new Date()).toLocaleString();
                console.log(sentTime + ": The Reset Password email was successfully sent.");
            }
        });

        // Checking if the phone number was provided before sending out an SMS:
        const userPNumNoSpaces = pNum.replace(/\s/g,'');
        if (userPNumNoSpaces !== '') {

            // Step 2, part 2: sending text message with defined transport object:
            let smsInfo = {
                from: `RemindMe <${process.env.serviceEmail}>`,
                to: `${pNum}${cPhoneCarrierEmailExtn}`,
                subject: "RemindMe: Reset Password",
                text: `Hi ${fName},
                Please click the link below to reset your password. You have one hour before the link expires.

                -
                -
                -
                -

                Reset password link:
                ${finalURL}
                `
            };

            transporter.sendMail(smsInfo, function(error, data) {
                if (error) {
                    let errorTime = (new Date()).toLocaleString();
                    console.log(errorTime + ": An error occurred while sending the Reset Password text message.");
                } else {
                    let sentTime = (new Date()).toLocaleString();
                    console.log(sentTime + ": The Reset Password text message was successfully sent.");
                }
            });
        }

        return

    } catch (error) {
        console.error(error.message);
    }
}
/************************************** END: HELPER FUNCTIONS ************************************/


module.exports = router;

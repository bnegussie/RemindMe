const router = require("express").Router();
const pool = require("../db");
const bcryptLib = require("bcrypt");
const jwtGenerator = require("../utils/jwtGenerator");
const validInfo = require("../middleware/validInfo");
const authorization = require("../middleware/authorization");
const jwtLib = require("jsonwebtoken");
const atob = require("atob");
require("dotenv").config();


// Creating routers to make the Express library more modular:
// Building the routes: ------------------->

// SignUp route- adding a user into the DB:
router.post("/signup", validInfo, async(req, res) => {
    try {

        // 1) Break down the data the user provided (name, email, phone, pwd):
        const {f_name, l_name, email, cPhoneCarrier, cPhoneCarrierEmailExtn,
            p_num, pwd, generalReminderTime, userTimeZone} = req.body;
        
        const lowerCaseEmail = email.toLowerCase();

        
        // 2) Check if user exists (if user exists, throw error):
        const userWithEmail = await pool.query("SELECT * FROM users WHERE user_email = $1", 
            [lowerCaseEmail]
        );
        if (userWithEmail.rows.length !== 0) {
            /* 401 = unauthenticated (user already exists):
             * It's being returned as a 200 status because in production, unless the server returns
             * a status of 200, the client side would not be able to recover the error message.
             */
            return res.status(200).json("A user with this email address already exists.");
        }

        if (p_num !== "") {
            const userWithPNum = await pool.query("SELECT * FROM users WHERE user_p_num = $1", 
                [p_num]
            );
            if (userWithPNum.rows.length !== 0) {
                /* 401 = unauthenticated (user already exists):
                 * It's being returned as a 200 status because in production, unless the server returns
                 * a status of 200, the client side would not be able to recover the error message.
                 */
                return res.status(200).json("A user with this phone number already exists.");
            }
        }

        // Making sure that the user's first and last name is capitalized:
        const firstNameFinalForm = CapitalizeName( f_name );
        const lastNameFinalForm = CapitalizeName( l_name );

        // Default user values:
        const userResetPwdURL = '';
        const userPwdResetTime = null;
        const incorPwdAttempts = 0;
        const jwtRefreshToken = '';
        const jwtAccessToken = '';

        
        // 3) Bcrypt the user's pwd:
        const saltRound = 10;
        const salt = await bcryptLib.genSalt(saltRound);
        const bcryptPwd = await bcryptLib.hash(pwd, salt);


        // 4) Insert the user into our DB:
        const newUser = await pool.query(
            "INSERT INTO users (user_f_name, user_l_name, user_email, user_cp_carrier, user_cp_carrier_email_extn, user_p_num, user_pwd, user_general_reminder_time, user_time_zone, user_reset_pwd_url, user_reset_pwd_time, user_incor_pwd_count, user_refresh_token, user_access_token) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *", [
                firstNameFinalForm, lastNameFinalForm, lowerCaseEmail, cPhoneCarrier, cPhoneCarrierEmailExtn, 
                p_num, bcryptPwd, generalReminderTime, userTimeZone, userResetPwdURL, userPwdResetTime,
                incorPwdAttempts, jwtRefreshToken, jwtAccessToken
            ]
        );

        
        // 5) Generate the user's JWT tokens:
        await jwtGenerator(res, newUser.rows[0].user_id);
        res.json( {message: "Successful registration!"} );

    } catch (error) {
        res.status(500).json( `Server error: ${error.message}` );
    }
});


// Logging a user in:
router.post("/login", validInfo, async(req, res) => {

    try {

        // 1) Break down the data the user provided (name, email, phone, pwd):
        const {email, pwd, userTimeZone} = req.body;
        const lowerCaseEmail = email.toLowerCase();
        
        // 2) Check if user exists:
        const user = await pool.query("SELECT * FROM users WHERE user_email = $1", 
            [lowerCaseEmail]
        );

        if (user.rows.length === 0) {
            /* 401 = unauthenticated (user does not exists):
             * It's being returned as a 200 status because in production, unless the server returns
             * a status of 200, the client side would not be able to recover the error message.
             */
            return res.status(200).json("A user with this email does not exist.");
        }

        
        // 3) Checking if pwd provided matches pwd in the DB:
        const validPwd = await bcryptLib.compare(pwd, user.rows[0].user_pwd);


        // Safety checks:--------------------------------------------------------------->

        // This person has already requested a Reset Password so we will force them
        // to actually reset their password.
        if ( user.rows[0].user_reset_pwd_url ) {
            return res.status(200).json(
                "Please reset your password by following the instructions which you previously received in your email."
            );
        }

        var incorPwdAttempts = user.rows[0].user_incor_pwd_count;
        if (incorPwdAttempts >= 10) {
            return res.status(200).json("Too many incorrect password attempts.");
        }

        
        if (!validPwd) {
            // Incrementing the number of times the user incorrectly types their password.
            // If they continue to fail to provide the proper password, their account will be locked.
            const updateTimeZone = await pool.query("UPDATE users SET user_incor_pwd_count = $1 WHERE user_email = $2",
                [(incorPwdAttempts + 1), email]
            );

            return res.status(200).json("Incorrect password.");
        }
        // Safety checks end.:----------------------------------------------------------<


        incorPwdAttempts = 0;

        // Updating the user's time zone and incorrect password count:
        const updateUserData = await pool.query("UPDATE users SET user_time_zone = $1, user_incor_pwd_count = $2 WHERE user_email = $3",
            [userTimeZone, incorPwdAttempts, email]
        );

        // 4) Generate the user's JWT tokens:
        await jwtGenerator(res, user.rows[0].user_id);
        // This token will be checked whenever a user tries to make a privilaged action:
        res.status(200).json({ message: "Successful log in!" });

    } catch (error) {
        res.status(500).json( `Server error: ${error.message}` );
    }
});


// Verifying the user's token:
router.get("/is-verified", authorization, async(req, res) => {
    try {
        if (res.message === "The user has not logged in.") {
            return res.status(200).json({ message: error.message });
        }

        res.status(200).json({ message: "This is an authorized user." });
        
    } catch (error) {
        res.status(401).json( error.message );
    }
});

router.get("/log-out", async(req, res) => {
    var successfulLogout = false;
    var errorMessage = "";
    
    try {
        const jwtToken = req.cookies.token;

        if (jwtToken) {
            const payload = jwtLib.verify(jwtToken, process.env.jwtSecret);
            const userId = payload.user;

            // Making sure the access token in the browser is the same as the token in the DB:
            const response = await pool.query(
                "SELECT user_access_token FROM users WHERE user_id = $1", [
                    payload.user
                ]
            );

            const activeAccessTokens = response.rows[0].user_access_token;

            if (activeAccessTokens.length === 0) {
                errorMessage = "Invalid access token.";
                return 
            }

            const accessTokensArray = activeAccessTokens.split(",");

            if ( !accessTokensArray.includes(jwtToken) ) {
                errorMessage = "Invalid access token.";
                return
            }

            const clearTokens = "";

            await pool.query(
                "UPDATE users SET user_access_token = $1, user_refresh_token = $2 WHERE user_id = $3", [
                    clearTokens, clearTokens, userId
                ]
            );
            successfulLogout = true;
        }
        
    } catch (error) {
        errorMessage = error.message;

        if (error.message === "jwt expired") {

            try {
                var userId = "";
                const exiredJWTToken = req.cookies.token;
                const expiredPayload = JSON.parse(atob(exiredJWTToken.split('.')[1]));
                userId = expiredPayload.user;

                const tokensInDB = await pool.query(
                    "SELECT user_access_token FROM users WHERE user_id = $1;", [
                        userId
                    ]
                );

                const accessTokensInDB = tokensInDB.rows[0].user_access_token;

                if (accessTokensInDB.length === 0) {
                    errorMessage = "Invalid access token.";
                    return
                }

                var accessTokensArray = accessTokensInDB.split(",");

                if ( !accessTokensArray.includes( exiredJWTToken ) ) {
                    errorMessage = "Invalid access token.";
                    return
                }

                const clearTokens = "";

                await pool.query(
                    "UPDATE users SET user_access_token = $1, user_refresh_token = $2 WHERE user_id = $3", [
                        clearTokens, clearTokens, userId
                    ]
                );
                successfulLogout = true;

            } catch (error) {
                errorMessage = error.message;
            }
        } else {
            errorMessage = "Invalid access token.";
            return
        }

    } finally {
        res.clearCookie("token");
        if (successfulLogout) {
            return res.status(200).json({ message: "Successfully logged out." });
        } else {
            return res.status(403).json( errorMessage );
        }
    }
});

// Helper function:
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


// Connecting the server to the router:----->
module.exports = router;

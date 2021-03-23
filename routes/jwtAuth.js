const router = require("express").Router();
const pool = require("../db");
const bcryptLib = require("bcrypt");
const jwtGenerator = require("../utils/jtwGenerator");
const validInfo = require("../middleware/validInfo");
const authorization = require("../middleware/authorization");


// Creating routers to make the Extress library more modular:
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

        
        // 3) Bcrypt the user's pwd:
        const saltRound = 10;
        const salt = await bcryptLib.genSalt(saltRound);
        const bcryptPwd = await bcryptLib.hash(pwd, salt);


        // 4) Insert the user into our DB:
        const newUser = await pool.query(
            "INSERT INTO users (user_f_name, user_l_name, user_email, user_cp_carrier, user_cp_carrier_email_extn, user_p_num, user_pwd, user_general_reminder_time, user_time_zone) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *", 
            [firstNameFinalForm, lastNameFinalForm, lowerCaseEmail, cPhoneCarrier, cPhoneCarrierEmailExtn, 
                p_num, bcryptPwd, generalReminderTime, userTimeZone]
        );

        
        // 5) Generate our JWT token:
        const token = jwtGenerator(newUser.rows[0].user_id);
        res.json( {token, message: "Successful registration!"} );

    } catch (error) {
        console.error(error.message);
        res.status(500).json("Server error");
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

        incorPwdAttempts = 0;

        // Updating the user's time zone and incorrect password count:
        const updateUserData = await pool.query("UPDATE users SET user_time_zone = $1, user_incor_pwd_count = $2 WHERE user_email = $3",
            [userTimeZone, incorPwdAttempts, email]
        );

        // 4) Generate our JWT token:
        const token = jwtGenerator(user.rows[0].user_id);
        // This token will be checked whenever a user tries to make a privilaged action:
        res.json( {token, message: "Successful log in!"} );

    } catch (error) {
        console.error(error.message);
        res.status(500).json("Server error");
    }
});


// Verifying the user's token:
router.get("/is-verified", authorization, async(req, res) => {
    try {
        res.json(true);
    } catch (error) {
        console.error(error.message);
        res.status(500).json("Server error");
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

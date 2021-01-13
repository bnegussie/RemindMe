const router = require("express").Router();
const pool = require("../db");
const authorization = require("../middleware/authorization");

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

module.exports = router;

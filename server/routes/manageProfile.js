const router = require("express").Router();
const pool = require("../db");
const authorization = require("../middleware/authorization");

/************************************** START: MY PROFILE ****************************************/
// Getting the general information from the user's profile:
router.get("/general", authorization, async(req, res) => {
    try {
        const generalInfo = await pool.query(
            "SELECT user_f_name, user_l_name, user_email, user_cp_carrier_email_extn, user_p_num FROM users WHERE user_id = $1",
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
        const { fName, lName, email, cPhoneCarrier, pNum } = req.body;
        const lowerCaseEmail = email.toLowerCase();
        const userId = req.user;

        //

        
    } catch (error) {
        console.error(error.message);
    }
});
/************************************** END: MY PROFILE ******************************************/

module.exports = router;

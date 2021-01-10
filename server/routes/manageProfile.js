const router = require("express").Router();
const pool = require("../db");
const authorization = require("../middleware/authorization");

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

module.exports = router;

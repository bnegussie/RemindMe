const router = require("express").Router();
const pool = require("../db");
const authorization = require("../middleware/authorization");

router.get("/", authorization, async(req, res) => {
    try {
        // Now req.user has the payload:
        const user = await pool.query("SELECT user_f_name FROM users WHERE user_id = $1;",
            [req.user]
        );

        res.json(user.rows[0]);

    } catch (error) {
        console.error(error.message);
        res.status(500).json("Server error");
    }
});


module.exports = router;

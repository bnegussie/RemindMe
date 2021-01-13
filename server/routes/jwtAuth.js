const router = require("express").Router();
const pool = require("../db");
const bcryptLib = require("bcrypt");
const jwtGenerator = require("../utils/jtwGenerator");
const validInfo = require("../middleware/validInfo");
const authorization = require("../middleware/authorization");


// Creating routers to make the Extress library more modular:
// Building the routes: ------------------->

// SignUp route- adding a user into the DB:
router.post("/register", validInfo, async(req, res) => {
    try {

        // 1) Break down the data the user provided (name, email, phone, pwd):
        const {f_name, l_name, email, cPhoneCarrier, cPhoneCarrierEmailExtn, p_num, pwd} = req.body;
        const lowerCaseEmail = email.toLowerCase();

        
        // 2) Check if user exists (if user exists, throw error):
        const user = await pool.query("SELECT * FROM users WHERE user_email = $1", 
            [lowerCaseEmail]
        );

        if (user.rows.length !== 0) {
            // 401 = unauthenticated (user already exists):
            return res.status(401).json("A user with this email address already exists.");
        } 

        
        // 3) Bcrypt the user's pwd:
        const saltRound = 10;
        const salt = await bcryptLib.genSalt(saltRound);
        const bcryptPwd = await bcryptLib.hash(pwd, salt);


        // 4) Insert the user into our DB:
        const newUser = await pool.query(
            "INSERT INTO users (user_f_name, user_l_name, user_email, user_cp_carrier, user_cp_carrier_email_extn, user_p_num, user_pwd) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *", 
            [f_name, l_name, lowerCaseEmail, cPhoneCarrier, cPhoneCarrierEmailExtn, p_num, bcryptPwd]
        );

        
        // 5) Generate our JWT token:
        const token = jwtGenerator(newUser.rows[0].user_id);
        res.json( {token} );

    } catch (error) {
        console.error(error.message);
        res.status(500).json("Server error");
    }
});


// Logging a user in:
router.post("/login", validInfo, async(req, res) => {

    try {

        // 1) Break down the data the user provided (name, email, phone, pwd):
        const {email, pwd} = req.body;
        const lowerCaseEmail = email.toLowerCase();
        
        // 2) Check if user exists:
        const user = await pool.query("SELECT * FROM users WHERE user_email = $1", 
            [lowerCaseEmail]
        );

        if (user.rows.length === 0) {
            // 401 = unauthenticated (user does not exists):
            return res.status(401).json("A user with this email does not exist.");
        }

        
        // 3) Checking if pwd provided matches pwd in the DB:
        const validPwd = await bcryptLib.compare(pwd, user.rows[0].user_pwd);

        if (!validPwd) {
            return res.status(401).json("Incorrect password.")
        }

        // 4) Generate our JWT token:
        const token = jwtGenerator(user.rows[0].user_id);
        // This token will be checked whenever a user tries to make a privilaged action:
        res.json( {token} );

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


// Connecting the server to the router:----->
module.exports = router;

const jwtLib = require("jsonwebtoken");
require("dotenv").config();
const pool = require("../db");

// Generating the JWT access and refresh tokens:
async function jwtGenerator(res, user_id) {
    const payload = {
        user: user_id
    }

    try {
        const accessCookieExpTime = parseInt(process.env.accessCookieExpTime, 10);
        const refExpTime = parseInt(process.env.refExpTime, 10);
        const accessExpTime = parseInt(process.env.accessExpTime, 10);
        
        const refreshToken = jwtLib.sign(payload, process.env.jwtRefresh, { expiresIn: refExpTime });
        const token = jwtLib.sign(payload, process.env.jwtSecret, { expiresIn: accessExpTime });

        // Placing the new access and refresh tokens in the DB:
        await pool.query(
            "UPDATE users SET user_refresh_token = $1, user_access_token = $2 WHERE user_id = $3", [
                refreshToken, token, payload.user
            ]
        );

        return res.cookie('token', token, {
            expires: new Date(Date.now() + accessCookieExpTime),
            secure: true,
            httpOnly: true,
            sameSite: 'strict'
        });

    } catch (error) {
        res.status(500).json( `Server error. ${error.message}` );
    }
}

module.exports = jwtGenerator;

const jwtLib = require("jsonwebtoken");
require("dotenv").config();

// Generating the JWT refresh token:
function jwtRefreshTokenGenerator(user_id) {
    const payload = {
        user: user_id
    }

    return jwtLib.sign(payload, process.env.jwtRefresh, {expiresIn: ("1d")});
}

module.exports = jwtRefreshTokenGenerator;

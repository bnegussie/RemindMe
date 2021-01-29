const jwtLib = require("jsonwebtoken");
require("dotenv").config();

// Generating the JWT:

function jwtGenerator(user_id) {
    const payload = {
        user: user_id
    }

    return jwtLib.sign(payload, process.env.jwtSecret, {expiresIn: (60 * 60 * 24 * 7)});
}

module.exports = jwtGenerator;

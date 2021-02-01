const jwtLibrary = require("jsonwebtoken");
require("dotenv").config();

// Checking whether or not the token is valid:

module.exports = async(req, res, next) => {
    try {
        
        // 1) Destructure token:

        // Token exists in the client side header:
        const jwtToken = req.header("token");

        if (!jwtToken) {
            return res.status(403).json("Not authorized.");
        }

        // If the token is valid, the payload var contains the user's data:
        const payload = jwtLibrary.verify(jwtToken, process.env.jwtSecret);
        req.user = payload.user;
        next();

    } catch (error) {
        res.status(401).json("Token is not valid.");
    }
};

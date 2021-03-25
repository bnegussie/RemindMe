const jwtLibrary = require("jsonwebtoken");
require("dotenv").config();

// Checking whether or not the token is valid:

module.exports = async(req, res, next) => {
    try {
        // Destructuring the access token:
        const jwtToken = req.header("token");

        // If the access token is valid, the payload var contains the user's data:
        const payload = jwtLibrary.verify(jwtToken, process.env.jwtSecret);
        req.user = payload.user;
        next();

    } catch (error) {
        // Means the access token has expired or the given access code is empty;
        // either way we need to execute the same actions of seeing if we can use the 
        // refresh token to get a valid access token.
        const jwtRefreshToken = req.header("refreshToken");
        if (jwtRefreshToken && jwtRefreshToken !== 'undefined') {

            try {
                const refreshPayload = jwtLibrary.verify(jwtRefreshToken, process.env.jwtRefresh);

                const newAccessToken = jwtLibrary.sign({user: refreshPayload.user}, process.env.jwtSecret,
                    {expiresIn: (60 * 60)});

                // Successfully created the new JTW access token:
                req.newAccessToken = newAccessToken;
                req.user = refreshPayload.user;
                next();

            } catch (error) {
                res.status(401).json("The refresh token is invalid.");
            }

        } else {
            res.json("The user has not logged in.");
        }
    }
};

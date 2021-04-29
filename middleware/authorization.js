const jwtLib = require("jsonwebtoken");
require("dotenv").config();
const atob = require("atob");
const pool = require("../db");

// Checking whether or not the token is valid:
module.exports = async (req, res, next) => {
    
    try {
        // 1) Destructuring the given access token:
        const jwtToken = req.cookies.token;

        if (!jwtToken) {
            return res.status(200).json( "The user has not logged in." );
        }

        // 2) Checking the validity of the JWT provided:
        const payload = jwtLib.verify(jwtToken, process.env.jwtSecret);


        // Now making sure that this is the access token which our system has granted:
        const response = await pool.query(
            "SELECT user_access_token FROM users WHERE user_id = $1", [
                payload.user
            ]
        );

        const activeAccessTokens = response.rows[0].user_access_token;

        if (activeAccessTokens.length === 0) {
            return res.status(403).json( "Invalid access token." );
        }

        const accessTokensArray = activeAccessTokens.split(",");

        if ( !accessTokensArray.includes(jwtToken) ) {
            return res.status(403).json( "Invalid access token." );
        }

        // The user has provided a valid JWT access token which our system has provided.

        // 3) The user has now been fully verified.
        req.user = payload.user;
        next();

    } catch (error) {
        /* This means either the user's access token has expired or the access 
         * token has been tampered with. Therefore, more assessment will be done on the 
         * access token and if it is a valid token, which has just expired,
         * we will try to get the refresh token to keep the user logged in,
         * if the refresh token has not already expired.
         */
        
        if (error.message === "jwt expired") {
            var userId = "";

            try {
                // 1) Check if this access token is the same one that is in the DB:
                const exiredJWTToken = req.cookies.token;
                const expiredPayload = JSON.parse(atob(exiredJWTToken.split('.')[1]));
                userId = expiredPayload.user;

                const tokensInDB = await pool.query(
                    "SELECT user_refresh_token, user_access_token FROM users WHERE user_id = $1;", [
                        userId
                    ]
                );

                const accessTokensInDB = tokensInDB.rows[0].user_access_token;

                if (accessTokensInDB.length === 0) {
                    return res.status(403).json( "Invalid access token." );
                }

                var accessTokensArray = accessTokensInDB.split(",");

                if ( !accessTokensArray.includes( exiredJWTToken ) ) {
                    return res.status(403).json( "Invalid access token." );
                }


                // 2) Using the refresh token to get the user a new access token:
                const jwtRefreshTokenInDB = tokensInDB.rows[0].user_refresh_token;
                
                // Making sure the refresh token has not expired:
                const refreshPayload = jwtLib.verify(jwtRefreshTokenInDB, process.env.jwtRefresh);

                const accessExpTime = parseInt(process.env.accessExpTime, 10);

                const newAccessToken = jwtLib.sign(
                    { user: userId },
                    process.env.jwtSecret,
                    { expiresIn: accessExpTime }
                );
                

                if ( !accessTokensArray.includes( newAccessToken ) ) {
                    /* This check exists because we want to prevent any duplicate access
                     * tokens from being placed in the user's account. Duplicate access
                     * tokens occur when another thread which just ran, a few 
                     * milliseconds ago, and created this identical access token.
                     */

                    // Placing the new access token with the other active access tokens:
                    accessTokensArray = insert(accessTokensArray, newAccessToken);

                    // Placing the new and old access tokens back in the DB:
                    await pool.query("UPDATE users SET user_access_token = $1 WHERE user_id = $2", [
                        accessTokensArray.toString(), userId
                    ]);

                    const accessCookieExpTime =  parseInt(process.env.accessCookieExpTime, 10);

                    // Placing the new access token in the user's browser, as a cookie:
                    res.cookie('token', newAccessToken, {
                        expires: new Date(Date.now() + accessCookieExpTime),
                        secure: true,
                        httpOnly: true,
                        sameSite: 'strict'
                    });
                }

                req.user = userId;
                next();                

            } catch (error) {
                // Either the refresh token has expired or the access token, in the browser,
                // has been tampered with.

                res.clearCookie("token");
                return res.status(403).json( `Invalid tokens. ${error.message}` );
            }

        } else {
            // The access token has been tampered with.
            res.clearCookie("token");
            return res.status(403).json( "Invalid access token." );
        }

    }
};

// Inserts the new element into array in a linked list fashion:
function insert(list, newElement) {
    const accessLength = parseInt(process.env.accessLength, 10);
    if (list.length >= accessLength) {
        // Removing the first element in the list;
        list.shift();
    }
    list.push(newElement);
    
    return list;
}

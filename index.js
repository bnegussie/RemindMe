const expressLib = require("express");
const app = expressLib();

// Setting up the Middleware (Express):
const corsLib = require("cors");

const path = require("path");

// Utilizing environment variables:
const PORT = process.env.PORT || 5000;

// Allowing client to access data from the client side:
app.use(expressLib.json());

// Connecting the back & front end:
app.use(corsLib());



// API and web URL ROUTES:------------------------------------------------------>


/* UNCOMMENT THE LINE BELLOW WHEN THIS CODE IS RUNNING IN PRODUCTION -*-*-*-*-*-*-*-*-*-*-*-*-*-*-*
 * so the static client side build file can be used. 
*/
// app.use(expressLib.static(path.join(__dirname, "client/build")));



// SignUp and login routes:
// Every time this path is hit in the URL, then it's going to go 
// to that route file and run what is there:
app.use("/api/auth", require("./routes/jwtAuth"));

app.use("/api/dashboard", require("./routes/dashboard"));

app.use("/api/profile", require("./routes/manageProfile"));

// Catching all other requests and sending them back to the index.html file
// so they can get redirected approperiately.
app.get('/*', function(req, res) {
    res.sendFile(path.join(__dirname, 'client/build/index.html'), function(err) {
        if (err) {
            res.status(500).send(err);
        }
    });
});


// Listening to a specific port:
app.listen(PORT, () => {
    console.log(`The server is running on port ${PORT}.`);
})

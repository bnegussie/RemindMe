const expressLib = require("express");
const app = expressLib();

// Setting up the Middleware (Express):
const corsLib = require("cors");

// Allowing client to access data from the client side:
app.use(expressLib.json());

// Connecting the back & front end:
app.use(corsLib());




// ROUTES (defined in jwtAuth.js):---------------------------->

// SignUp and login routes:
// Every time this path is hit in the URL, then it's going to go 
// to that route file and run what is there:
app.use("/auth", require("./routes/jwtAuth"));

app.use("/dashboard", require("./routes/dashboard"));






// Listening to a specific port:
app.listen(5000, () => {
    console.log("The server is running on port 5000.");
})

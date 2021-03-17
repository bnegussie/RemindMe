import React, { Fragment, useState } from "react";
import { toast } from 'react-toastify';

import "./../App.css"

const LogIn = ({ setAuth }) => {

    const [inputs, setInputs] = useState({
        email: "",
        pwd: ""
    });

    const {email, pwd} = inputs;

    const onChange = (e) => {
        setInputs({...inputs, [e.target.name] : e.target.value});
    };

    const onSubmit = async (e) => {
        e.preventDefault();

        try {
            // Quick input validation.
            // eslint-disable-next-line
            if (!email.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)) {
                
                return toast.error("Please provide a valid email.", {autoClose: 3000});
                
            } else if (pwd === "" || (pwd).replace(/\s/g, "") === "") {
                return toast.error("Please provide your password.", {autoClose: 3000});
            }
            // Finsihed input validation.


            const userTimeZone = (-1)*(new Date()).getTimezoneOffset()/60;
            
            const body = { email, pwd, userTimeZone };


            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: {"Content-type": "application/json"},
                body: JSON.stringify(body)
            });
            
            // parseResp now holds the JWT or the error message:
            const parseResp = await response.json();

            if (parseResp === "A user with this email does not exist." || 
                parseResp === "Incorrect password.") {
                
                return toast.error(parseResp, {autoClose: 4000}); 

            } else if (parseResp.message && parseResp.message === "Successful log in!") {
                localStorage.setItem("token", parseResp.token);
                setAuth(true);
                toast.success(parseResp.message, {autoClose: 3000});
            } else {
                return toast.error("Something went wrong.", {autoClose: 3000});
            }

        } catch (error) {
            console.error(error.message);
        }
    };

    return (
        <Fragment>
            <div className="login-container">
                <h1 className="text-center my-5">Log In</h1>

                <form onSubmit={e => onSubmit(e)} className="form">
                    <div className="form-group">
                        <input 
                            type="email"
                            name="email"
                            id="log-in-email"
                            placeholder=" "
                            className="form-control"
                            value={email}
                            onChange ={e => onChange(e)} 
                            autoFocus
                            required
                        />
                        <label htmlFor="log-in-email" className="form-label">Email:</label>
                    </div>

                    <div className="form-group">
                        <input 
                            type="password"
                            name="pwd"
                            id="log-in-pwd"
                            placeholder=" "
                            className="form-control"
                            value={pwd}
                            onChange ={e => onChange(e)}
                            required
                        />
                        <label htmlFor="log-in-pwd" className="form-label">Password:</label>
                    </div>
                    
                    <button className="btn btn-success btn-block">Submit</button>
                </form>
            </div>
        </Fragment>
    );
};

export default LogIn;

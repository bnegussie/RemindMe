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

        var response = "";

        try {
            const body = { email, pwd };

            // eslint-disable-next-line
            if (!email.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)) {
                toast.error("Please provide a valid email.", {autoClose: 3000});
                return false;
            }

            response = await fetch("/api/auth/login", {
                method: "POST",
                headers: {"Content-type": "application/json"},
                body: JSON.stringify(body)
            });
            
            // parseResp now holds the JWT:
            const parseResp = await response.json();

            if (response.status === 401 || response.status === 403) {
                toast.error(parseResp, {autoClose: 4000});
                return false;
            }

            localStorage.setItem("token", parseResp.token);
            setAuth(true);
            toast.success("Successful log in!", {autoClose: 3000});

        } catch (error) {
            console.error(error.message);

            const parseResp = await response.json();
            toast.error(parseResp, {autoClose: 4000});
        }
    };

    return (
        <Fragment>
            <div className="login-container">
                <h1 className="text-center my-5">Log In</h1>

                <form onSubmit={e => onSubmit(e)} className="form">
                    <div className="form-group">
                        <input 
                            type="text"
                            name="email"
                            id="log-in-email"
                            placeholder=" "
                            className="form-control"
                            value={email}
                            onChange ={e => onChange(e)} 
                            autoFocus
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

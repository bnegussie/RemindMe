import React, { Fragment, useState } from "react";
import { toast } from 'react-toastify';

const Login = ({ setAuth }) => {

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
            const body = { email, pwd };

            // eslint-disable-next-line
            if (!email.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)) {
                toast.error("Please provide a valid email.", {autoClose: 3000});
                return false;
            }

            const response = await fetch("http://localhost:5000/auth/login", {
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
            toast.success("Successful login!", {autoClose: 3000});

        } catch (error) {
            console.error(error.message);
        }
    };

    return (
        <Fragment>
            <div className="login-container">
                <h2 className="text-center my-5">Login</h2>

                <form onSubmit={e => onSubmit(e)}>
                    <input 
                        type="text"
                        name="email"
                        placeholder="Email"
                        className="form-control my-3"
                        value={email}
                        onChange ={e => onChange(e)} 
                        autoFocus
                    />
                    <input 
                        type="password"
                        name="pwd"
                        placeholder="Password"
                        className="form-control my-3"
                        value={pwd}
                        onChange ={e => onChange(e)}
                    />
                    <button className="btn btn-success btn-block">Submit</button>
                </form>
            </div>
        </Fragment>
    );
};

export default Login;

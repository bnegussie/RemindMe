import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";

import "./../App.css"

function ResetPwd() {

    // eslint-disable-next-line
    const [userEmail, setUserEmail] = useState("");
    const [newPwd, setNewPwd] = useState("");
    const [confirmNewPwd, setConfirmNewPwd] = useState("");

    const history = useHistory();


    async function submitResetPwd(e) {
        e.preventDefault();

        if (!userEmail) {
            return
        }

        try {
            // Quick input validation:
            if (newPwd === "" || (newPwd).replace(/\s/g, "") === "" ||
                confirmNewPwd === "" || (confirmNewPwd).replace(/\s/g, "") === "") {

                return toast.error("Please fill out all required input fields. (Empty spaces are not valid.)", 
                                    {autoClose: 4000});
                
            } else if (newPwd !== confirmNewPwd) {
                return toast.error("The new password must match the confirmation password.", 
                                    {autoClose: 4000});

            } else if (newPwd.length < 6) {
                return toast.error("Your new password must be at least six characters long.", 
                                    {autoClose: 4000});
            }
            // Finished input validation.


            const body = { userEmail, newPwd };

            const response = await fetch("/api/profile/resetpwd", {
                method: "PUT",
                headers: {"Content-type": "application/json"},
                body: JSON.stringify(body)
            });

            const parseRes = await response.json();

            if (parseRes === "Invalid values.") {
                return toast.error(parseRes);
            } else if (parseRes === "Your password has now been successfully reset!") {
                
                toast.success(parseRes, {autoClose: 3000});
				setTimeout(() => { window.location = "/LogIn"; }, 3000);

            } else {
                return toast.error("Something went wrong.");
            }

        } catch (error) {
            console.error(error.message);
        }
    }

    // Simply checking if the given reset password link is valid:
    useEffect(() => {
        GetUser();

        async function GetUser() {
            try {
                const resetId = (history.location.pathname).split("/ResetPassword/")[1] ;
    
                const checkId = await fetch(`/api/profile/resetpwd/?id=${resetId}`, {
                    method: "GET",
                    headers: {"Content-type": "application/json"}
                });
    
                const parseResp = await checkId.json();
    
                if (parseResp.message === "Invalid Reset Password link.") {
                    toast.error(parseResp.message, {autoClose: 3000});
                    setTimeout(() => { window.location = "/LogIn"; }, 3000);

                } else if (parseResp.message === "The Reset Password link has expired.") {
                    toast.error(parseResp.message, {autoClose: 7500});
                    toast.info("Submit another Forgot Password request on the Log In page.", 
                            {autoClose: 7500});
                    setTimeout(() => { window.location = "/LogIn"; }, 7500);

                } else if (parseResp.message === "Valid Reset Password link.") {
                    setUserEmail(parseResp.userEmail);

                } else {
                    toast.error("Something went wrong.", {autoClose: 3000});
                    setTimeout(() => { window.location = "/LogIn"; }, 3000);
                }
    
            } catch (error) {
                console.error(error.message);
            }
        }

    }, [history.location.pathname]);

    return (
        <div className="reset-pwd container">
            <h1 className="text-center my-5">Reset Password</h1>

            <form onSubmit={e => submitResetPwd(e)} className="form">
                <div className="form-group">
                    <input 
                        type="password"
                        name="new-pwd"
                        id="new-pwd"
                        placeholder=" "
                        className="form-control"
                        value={newPwd}
                        onChange ={e => setNewPwd(e.target.value)}
                        required
                        autoFocus
                    />
                    <label htmlFor="new-pwd" className="form-label">
                        New password:
                    </label>
                </div>

                <div className="form-group">
                    <input 
                        type="password"
                        name="confirm-new-pwd"
                        id="confirm-new-pwd"
                        placeholder=" "
                        className="form-control"
                        value={confirmNewPwd}
                        onChange ={e => setConfirmNewPwd(e.target.value)}
                        required
                    />
                    <label htmlFor="confirm-new-pwd" className="form-label">
                        Confirm new password:
                    </label>
                </div>
                
                <button className="btn btn-success btn-block">Submit</button>
            </form>
        </div>
    );
}

export default ResetPwd;

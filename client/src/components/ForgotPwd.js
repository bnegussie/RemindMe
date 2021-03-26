import React, { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

import "./../App.css";

function ForgotPwd() {

    const [email, setEmail] = useState("");
    var invalidAttemptsCounter = 0;

    async function forgotPwdRequest(e) {
        e.preventDefault();

        try {
            // Quick input validation.
            if (invalidAttemptsCounter >= 10) {
                window.location = "/";
            }

            // eslint-disable-next-line
            if (!email ||  !email.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)) {
                
                return toast.error("Please provide a valid email.", {autoClose: 3000});
            }
            // Finsihed input validation.

            const body = { email };

            const checkingUserExists = await fetch("/api/profile/forgotpwd", {
                method: "POST",
                headers: {"Content-type": "application/json"},
                body: JSON.stringify(body)
            });

            const parseResp = await checkingUserExists.json();

            if (parseResp === "A user with this email does not exist.") {
                invalidAttemptsCounter++;
                return toast.error(parseResp);
            } else if (parseResp === "A Reset Password link has been sent to you via email now." ||
                parseResp === "A Reset Password link has been sent to you via email and text message now.") {

                toast.success(parseResp);
				setTimeout(() => { window.location = "/LogIn"; }, 5000);
                
            } else {
                invalidAttemptsCounter++;
                return toast.error("Something went wrong.");
            }
            
        } catch (error) {
            console.error(error.message());
        }
    }

	return (
		<div className="forgot-pwd container">
            <Link 
                className="forgot-pwd link" 
                to="#" 
                data-toggle="modal" 
                data-target="#forgot-pwd-modal">

                Forgot Password.
            </Link>

			<div id="forgot-pwd-modal" className="modal fade" role="dialog">
				<div className="modal-dialog">
					<div className="modal-content">
                    
						<div className="modal-header">
                            <h4 className="modal-title">Forgot Password</h4>
                            
                            <button 
                                type="button" 
                                className="close" 
                                data-dismiss="modal"
                                onClick={() => setEmail("")}>

								&times;
							</button>
						</div>

                        <form className="form" onSubmit={(e) => forgotPwdRequest(e)}>
                            <div className="modal-body forgot-pwd">
                                <div className="forgot-pwd message">
                                    <p>
                                        Please provide the email which is connected to your account.
                                    </p>
                                </div>

                                <hr />

                                <div className="form-group forgot-pwd">
                                    <input 
                                        type="email"
                                        name="email"
                                        id="forgot-pwd-email"
                                        placeholder=" "
                                        className="form-control"
                                        value={email}
                                        onChange ={(e) => setEmail(e.target.value)} 
                                        autoFocus
                                        required
                                    />
                                    <label htmlFor="forgot-pwd-email" className="form-label">Email:</label>
                                </div>
                            </div>


                            <div className="modal-footer">
                                <input type="submit" value="Submit" className="btn btn-success" />

                                <button 
                                    type="button" 
                                    className="btn btn-danger" 
                                    data-dismiss="modal" 
                                    onClick={() => setEmail("")} >

                                    Close
                                </button>
                            </div>
                        </form>
					</div>
				</div>
			</div>
		</div>
	);
}

export default ForgotPwd;

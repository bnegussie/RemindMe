import React, { Fragment, useState } from "react";
import { toast } from "react-toastify";

import PasswordToggle from "./../PasswordToggle";

import "./../../App.css"

function ChangePassword() {

    const [currentPwd, setCurrentPwd] = useState("");
    const [newPwd, setNewPwd] = useState("");
    const [confirmNewPwd, setConfirmNewPwd] = useState("");

    const [currentPwdInputType, currentPwdToggleIcon] = PasswordToggle();
    const [newPwdInputType, newPwdToggleIcon] = PasswordToggle();
    const [confirmNewPwdInputType, confirmNewPwdToggleIcon] = PasswordToggle();

    function onCancel() {
        setCurrentPwd("");
        setNewPwd("");
        setConfirmNewPwd("");
    }

    async function changePwd(e) {
        e.preventDefault();

        try {
            // Quick input validation:
            // Making sure the input fields are not empty or filled with empty spaces.
            if (currentPwd === "" || (currentPwd).replace(/\s/g, "") === "" ||
                newPwd === "" || (newPwd).replace(/\s/g, "") === "" ||
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


            const body = { currentPwd, newPwd };

            const pwdHeaders = new Headers();
            pwdHeaders.append("Content-type", "application/json");
            pwdHeaders.append("token", localStorage.token);

            const response = await fetch("/api/profile/pwd", {
                method: "PUT",
                headers: pwdHeaders,
                body: JSON.stringify(body)
            });

            const parseResp = await response.json();

            if (parseResp === "Please check your Current Password and try again.") {
                return toast.error(parseResp);
            } else if (parseResp === "Your password has now been successfully updated!") {
                
                toast.success(parseResp, {autoClose: 3000});
                setTimeout(() => { window.location = "/ManageProfile"; }, 3000);

            } else {
                return toast.error("Something went wrong. Please try again later.", [parseResp]);
            }            
            
        } catch (error) {
            console.log(error.message);
        }
    }


	return (
		<Fragment>
			<button
				type="button"
				className="btn btn-info manage-profile change"
				data-toggle="modal"
				data-target="#change-pwd-modal"
			>
				Change
			</button>

			<div id="change-pwd-modal" className="modal change-pwd" role="dialog">
				<div className="modal-dialog">
					<div className="modal-content">
						<div className="modal-header">
                            <h4 className="modal-title">Change Password</h4>
                        
                            <button 
                                type="button" 
                                className="close" 
                                data-dismiss="modal"
                                onClick={() => onCancel()} >
                                
								&times;
							</button>
                        </div>
                        
                        <form onSubmit={(e) => changePwd(e)}>
                            <div className="modal-body">
                                <div className="form-group change-pwd">
                                    <input 
                                        type={ currentPwdInputType }
                                        name="currentPwd"
                                        id="currentPwd"
                                        placeholder=" "
                                        className="form-control"
                                        value={currentPwd}
                                        onChange ={e => setCurrentPwd(e.target.value)}
                                        required
                                    />
                                    <label 
                                        htmlFor="currentPwd" 
                                        className="form-label update-profile">
                                        
                                        Current password:
									</label>
                                    <span className="pwd-toggle-icon"> { currentPwdToggleIcon } </span>
                                </div>
                            
                                <hr />

                                <div className="form-group change-pwd">
                                    <input 
                                        type={ newPwdInputType }
                                        name="newPwd"
                                        id="newPwd"
                                        placeholder=" "
                                        className="form-control"
                                        value={newPwd}
                                        onChange ={e => setNewPwd(e.target.value)}
                                        required
                                    />
                                    <label 
                                        htmlFor="newPwd" 
                                        className="form-label update-profile">
                                        
                                        New password:
									</label>
                                    <span className="pwd-toggle-icon"> { newPwdToggleIcon } </span>
                                </div>

                                <div className="form-group change-pwd">
                                    <input 
                                        type={ confirmNewPwdInputType }
                                        name="confirmNewPwd"
                                        id="confirmNewPwd"
                                        placeholder= " "
                                        className="form-control"
                                        value={confirmNewPwd}
                                        onChange ={e => setConfirmNewPwd(e.target.value)}
                                        required
                                    />
                                    <label 
                                        htmlFor="confirmNewPwd" 
                                        className="form-label update-profile">
                                        
                                        Confirm new password:
									</label>
                                    <span className="pwd-toggle-icon"> { confirmNewPwdToggleIcon } </span>
                                </div>
                            </div>

                            <div className="modal-footer">
                                <input type="submit" value="Save" className="btn btn-success" />

                                <button 
                                    type="button" 
                                    className="btn btn-danger" 
                                    data-dismiss="modal"
                                    onClick={() => onCancel()} >
                                    Close
                                </button>
                            </div>
                        </form>
                        
					</div>
				</div>
			</div>
		</Fragment>
	);
}

export default ChangePassword;

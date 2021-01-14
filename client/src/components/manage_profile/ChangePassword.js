import React, { Fragment, useState } from "react";
import { toast } from "react-toastify";

import "./../../App.css"

function ChangePassword() {

    const [currentPwd, setCurrentPwd] = useState("");
    const [newPwd, setNewPwd] = useState("");
    const [confirmNewPwd, setConfirmNewPwd] = useState("");

    function onCancel() {
        setCurrentPwd("");
        setNewPwd("");
        setConfirmNewPwd("");
    }

    async function changePwd(e) {
        e.preventDefault();

        try {
            const body = { currentPwd, newPwd };

            // Quick validation:
            if (newPwd !== confirmNewPwd) {
                return toast.error("The new password must match the confirmation password.", 
                            {autoClose: 4000});

            } else if (newPwd.length < 6) {
                return toast.error("Your new password must be at least six characters long.", 
                            {autoClose: 4000});
            }

            const pwdHeaders = new Headers();
            pwdHeaders.append("Content-type", "application/json");
            pwdHeaders.append("token", localStorage.token);

            const response = await fetch("http://localhost:5000/profile/pwd", {
                method: "PUT",
                headers: pwdHeaders,
                body: JSON.stringify(body)
            });

            const parseResp = await response.json();

            if (response.status === 401) {
                return toast.error(parseResp);
            } else if (response.status === 200) {
                toast.success("Your password has been successfully changed!", {autoClose: 2500});
                
                setTimeout(() => { window.location = "/ManageProfile"; }, 2500);

            } else {
                return toast.error("Something went wrong. ", [parseResp]);
            }            
            
        } catch (error) {
            console.log(error.message);
        }
    }


	return (
		<Fragment>
			<button
				type="button"
				className="btn btn-info manage-profile"
				data-toggle="modal"
				data-target="#change-pwd-modal"
			>
				Change
			</button>

			<div id="change-pwd-modal" className="modal fade" role="dialog">
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
                                <input 
                                    type="password"
                                    name="currentPwd"
                                    placeholder="Current password"
                                    className="form-control my-3"
                                    value={currentPwd}
                                    onChange ={e => setCurrentPwd(e.target.value)}
                                    required
                                />
                                <hr />
                                <input 
                                    type="password"
                                    name="newPwd"
                                    placeholder="New password"
                                    className="form-control my-3"
                                    value={newPwd}
                                    onChange ={e => setNewPwd(e.target.value)}
                                    required
                                />
                                <input 
                                    type="password"
                                    name="confirmNewPwd"
                                    placeholder="Confirm new password"
                                    className="form-control my-3"
                                    value={confirmNewPwd}
                                    onChange ={e => setConfirmNewPwd(e.target.value)}
                                    required
                                />
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
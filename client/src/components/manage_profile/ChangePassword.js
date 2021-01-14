import React, { Fragment, useState } from "react";

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
                                />
                                <hr />
                                <input 
                                    type="password"
                                    name="newPwd"
                                    placeholder="New password"
                                    className="form-control my-3"
                                    value={newPwd}
                                    onChange ={e => setNewPwd(e.target.value)}
                                />
                                <input 
                                    type="password"
                                    name="confirmNewPwd"
                                    placeholder="Confirm new password"
                                    className="form-control my-3"
                                    value={confirmNewPwd}
                                    onChange ={e => setConfirmNewPwd(e.target.value)}
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

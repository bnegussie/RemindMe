import React from "react";
import InlineConfirmButton from "react-inline-confirm";
import { Fragment } from "react";
import { toast } from "react-toastify";

import ChangePassword from "./ChangePassword";
import UpdateProfile from "./UpdateProfile";
import ChangeGeneralReminderTime from "./ChangeGeneralReminderTime";

import "./../../App.css";

function ManageProfile({ isAuth, setAuth }) {

	// Components for the Delete Account feature:
	const textValues = ["Delete", "Are you sure?", "Deleting..."];
	var isExecuting = false;
	const confirmIconClass = `fa fa-${isExecuting ? "circle-o-notch fa-spin" : "fa fa-trash"}`;


	async function deleteAccount() {
		try {
			const myHeaders = new Headers();
			myHeaders.append("token", localStorage.token);
			myHeaders.append("refreshToken", localStorage.refreshToken);

			const response = await fetch("/api/profile/account", {
				method: "DELETE",
				headers: myHeaders
			});

			const parseResp = await response.json();

			if (response.status === 200) {
				localStorage.removeItem("refreshToken");
				localStorage.removeItem("token");
				toast.success("Successfully deleted your account.", {autoClose: 2500});
				setTimeout(() => { window.location = "/"; }, 2500);

            } else {
                return toast.error("Something went wrong. Please try again later.", [parseResp]);
            }  

		} catch (error) {
			console.log(error.message);
		}
	}

	return (
		<Fragment>
			<div className="manage-profile-container">
				<h1>Manage Profile</h1>

				<table className="table">
					<thead>
						<tr>
							<th 
								width="70%" 
								className="manage-profile-headers">
								Options
							</th>
							<th 
								width="30%" 
								className="manage-profile-headers" 
								id="manage-profile-actions">
								Actions
							</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td className="manage-profile-options">My Profile</td>
                            <td className="manage-profile-btns" onClick={isAuth} >
                                <UpdateProfile />
                            </td>
						</tr>
						<tr>
							<td className="manage-profile-options">My Password</td>
							<td className="manage-profile-btns" onClick={isAuth} >
								<ChangePassword />
							</td>
						</tr>
						<tr>
							<td className="manage-profile-options">My General Reminder Time</td>
							<td className="manage-profile-btns" onClick={isAuth} >
								<ChangeGeneralReminderTime />
							</td>
						</tr>
						<tr>
                            <td className="manage-profile-options" 
                                id="manage-profile-options-delete">
                                My Account
                            </td>
							<td className="manage-profile-btns" onClick={isAuth} >
								<InlineConfirmButton
									className="btn btn-danger manage-profile"
									textValues={textValues}
									showTimer
									isExecuting={isExecuting}
									onClick={() =>
										deleteAccount()
									}
								>
									<i className={confirmIconClass}></i>
								</InlineConfirmButton>
							</td>
						</tr>
					</tbody>
                </table>
                
			</div>
		</Fragment>
	);
}

export default ManageProfile;

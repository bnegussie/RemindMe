import React from "react";
import { Fragment } from "react";

import UpdateProfile from "./UpdateProfile";

function ManageProfile() {
	return (
		<Fragment>
			<div className="manage-profile-container">
				<h1>Manage Profile</h1>

				<table className="table">
					<thead>
						<tr>
							<th width="80%" className="manage-profile-headers">Options</th>
							<th width="20%" className="manage-profile-headers">Actions</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td className="manage-profile-options">My Profile</td>
                            <td>
                                <UpdateProfile />
                            </td>
						</tr>
						<tr>
							<td className="manage-profile-options">My Password</td>
							<td>CHANGE</td>
						</tr>
						<tr>
							<td className="manage-profile-options">My General Reminder Time</td>
							<td>CHANGE</td>
						</tr>
						<tr>
                            <td className="manage-profile-options" 
                                id="manage-profile-options-delete">
                                My Account
                                </td>
							<td>DELETE</td>
						</tr>
					</tbody>
                </table>
                
			</div>
		</Fragment>
	);
}

export default ManageProfile;

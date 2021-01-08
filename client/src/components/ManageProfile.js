import React from "react";
import { Fragment } from "react";

function ManageProfile() {
	return (
		<Fragment>
			<div className="manage-profile-container">
				<h1>Manage Profile</h1>

				<table class="table">
					<thead>
						<tr>
							<th width="80%" className="manage-profile-headers">Options</th>
							<th width="20%" className="manage-profile-headers">Actions</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td className="manage-profile-options">Update general information</td>
							<td>UPDATE</td>
						</tr>
						<tr>
							<td className="manage-profile-options">Change password</td>
							<td>CHANGE</td>
						</tr>
						<tr>
							<td className="manage-profile-options">Delete account</td>
							<td>DELETE</td>
						</tr>
					</tbody>
                </table>
                
			</div>
		</Fragment>
	);
}

export default ManageProfile;

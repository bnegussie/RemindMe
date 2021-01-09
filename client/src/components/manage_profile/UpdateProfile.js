import React from "react";
import { Fragment } from "react";

function UpdateProfile() {
	function update(e) {
        e.preventDefault();

		try {



            window.location = "/ManageProfile";
		} catch (error) {
			console.error(error.message);
		}
	}

	function onCancelUpdate() {
		try {
		} catch (error) {
			console.error(error.message);
		}
	}

	return (
		<Fragment>
			<button
				type="button"
				class="btn btn-warning"
				data-toggle="modal"
				data-target="#update-profile-modal"
			>
				Update
			</button>

			<div class="modal" id="update-profile-modal">
				<div class="modal-dialog">
					<div class="modal-content">
						<div class="modal-header">
							<h4 class="modal-title">Update General Information</h4>
							<button type="button" class="close" data-dismiss="modal">
								&times;
							</button>
						</div>

                        <form onSubmit={(e) => update(e)}>
                            <div class="modal-body">
                                Modal body..
                            </div>

                            <div class="modal-footer">
                                <input type="submit" value="Update" className="btn btn-success" />

                                <button 
                                    type="button" 
                                    class="btn btn-danger" 
                                    data-dismiss="modal"
                                    onClick={() => onCancelUpdate()} >
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

export default UpdateProfile;

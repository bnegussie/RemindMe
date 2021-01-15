import React, { Fragment, useState } from "react";
import TimePicker from "react-time-picker";

import "./../../App.css"

function ChangeGeneralReminderTime() {

    const [generalReminderTime, setGeneralReminderTime] = useState("6:00");


    function onCancel() {
        setGeneralReminderTime("6:00");
    }

    function changeGRT(e) {
		if (e) {
			setGeneralReminderTime(e);
		} else {
			setGeneralReminderTime("");
		}
    }

	return (
		<Fragment>
			<button
				type="button"
				className="btn btn-info manage-profile"
				data-toggle="modal"
				data-target="#change-general-reminder-time-modal"
			>
				Change
			</button>

			<div id="change-general-reminder-time-modal" className="modal fade" role="dialog">
				<div className="modal-dialog">
					<div className="modal-content">
						<div className="modal-header">
							<h4 className="modal-title">Change General Reminder Time</h4>

							<button
								type="button"
								className="close"
								data-dismiss="modal"
								onClick={() => onCancel()}
							>
								&times;
							</button>
						</div>

						<form onSubmit={(e) => changeGRT(e)}>
                            <div className="modal-body">
                            
								<TimePicker
									onChange={changeGRT}
									value={generalReminderTime}
									format="h a"
									hourAriaLabel="Hour"
									required
								/>
								
							</div>

							<div className="modal-footer">
								<input type="submit" value="Save" className="btn btn-success" />

								<button
									type="button"
									className="btn btn-danger"
									data-dismiss="modal"
									onClick={() => onCancel()}
								>
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

export default ChangeGeneralReminderTime;

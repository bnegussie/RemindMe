import React, { Fragment, useState, useEffect } from "react";
import TimePicker from "react-time-picker";
import { toast } from "react-toastify";

import "./../../App.css"

function ChangeGeneralReminderTime() {

	const [reminderHour, setReminderHour] = useState("");
	const [generalReminderTime, setGeneralReminderTime] = useState(null);

	async function getGRT() {
		try {
			const response = await fetch("http://localhost:5000/profile/general/reminder", {
				method: "GET",
				headers: {"token": localStorage.token}
			});
			const parseResp = await response.json();

			if (response.status === 200) {
				const finalTime = new Date(parseResp.user_general_reminder_time);
				setGeneralReminderTime( finalTime );

				// This seperate group of variables are needed in order to display the data
				// to the user in the Manage Profile section of this web application.
				let setHour = finalTime.getHours();
				let time = setHour + ":00";
				setReminderHour( time );

            } else {
                return toast.error("Something went wrong. ", [parseResp]);
			}
			
		} catch (error) {
			console.log(error.message);
		}
	}

    function onCancel() {
		let hour = generalReminderTime.getHours();
		setReminderHour(hour + ":00");
    }

    async function setGRT(e) {
		e.preventDefault();

		// Parsing the data provided.
		var setTime = reminderHour.split(":");
		var hour = parseInt(setTime[0]);

		// Setting the actual data which will be stored in the DB:
		generalReminderTime.setHours(hour);		

		try {
			const body = { generalReminderTime };

			const gRTHeaders = new Headers();
			gRTHeaders.append("Content-type", "application/json");
			gRTHeaders.append("token", localStorage.token);

			const response = await fetch("http://localhost:5000/profile/general/reminder", {
				method: "PUT",
				headers: gRTHeaders,
				body: JSON.stringify(body)
			});

			const parseResp = await response.json();

			if (response.status === 200) {
				toast.success("The General Reminder Time has now been changed.", {autoClose: 2500});

				setTimeout(() => { window.location = "/ManageProfile"; }, 2500);

            } else {
				return toast.error("Something went wrong. ", [parseResp]);
			}
			
		} catch (error) {
			console.log(error.message);
		}
	}
	
	useEffect(() => {
		getGRT();
		
	}, []);

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

						<form onSubmit={(e) => setGRT(e)}>
                            <div className="modal-body">
                            
								<TimePicker
									onChange={(e) => setReminderHour(e)}
									value={reminderHour}
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

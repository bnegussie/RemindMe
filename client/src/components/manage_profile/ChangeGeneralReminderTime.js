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
				setGeneralReminderTime(finalTime)

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
		var newGRT;

		const now = new Date();
		/* Setting the actual data which will be stored in the DB:
		 * Creating a new Date object because if the user has moved into a new Timezone,
		 * the new Date will capture that information so the user gets notified at the right time.
		 */
		if (hour > now.getHours()) {
			newGRT = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, 0, 0, 0);
			
		} else {
			newGRT = new Date(now.getFullYear(), now.getMonth(), (now.getDate() + 1), hour, 0, 0, 0);
		}
		setGeneralReminderTime(newGRT);

		try {
			const body = { newGRT };

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
				toast.success("Your General Reminder Time has now been successfully updated!", {autoClose: 3000});

				setTimeout(() => { window.location = "/ManageProfile"; }, 3000);

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
				View
			</button>

			<div id="change-general-reminder-time-modal" className="modal fade" role="dialog">
				<div className="modal-dialog">
					<div className="modal-content">
						<div className="modal-header">
							<h4 className="modal-title">Edit General Reminder Time</h4>

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
							<div className="modal-body grt">
							
								<div className="info-message-grt">
									<p>
										Everyday at this time, you will receive your Daily General 
										Reminder (if you have any tasks for the upcoming week).
									</p>
									<p>
										The default reminder time is 6:00 AM because seeing an overview of 
										your upcoming tasks right as you wake up or as you head to the office
										makes it easier to remember your upcoming tasks.
									</p>
								</div>

								<hr />

								<div className="general-reminder-time" >
									<TimePicker
										onChange={(e) => setReminderHour(e)}
										value={reminderHour}
										format="h a"
										hourAriaLabel="Hour"
										required
									/>
								</div>
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

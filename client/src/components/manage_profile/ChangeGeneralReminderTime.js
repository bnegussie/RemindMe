import React, { Fragment, useState, useEffect } from "react";
import TimePicker from "react-time-picker";
import { toast } from "react-toastify";

import "./../../App.css"

function ChangeGeneralReminderTime() {

    const [generalReminderTime, setGeneralReminderTime] = useState("0:00");

	async function getGRT() {
		try {
			const response = await fetch("http://localhost:5000/profile/general/reminder", {
				method: "GET",
				headers: {"token": localStorage.token}
			});
			const parseResp = await response.json();

			if (response.status === 200) {
				let setHour = parseResp.user_general_reminder_time;
				let time = setHour + ":00";
				setGeneralReminderTime( time );

            } else {
                return toast.error("Something went wrong. ", [parseResp]);
            }
		} catch (error) {
			console.log(error.message);
		}
	}

    function onCancel() {
        setGeneralReminderTime("6:00");
    }

    async function setGRT(e) {
		e.preventDefault();

		// Parsing the data provided.
		var setTime = generalReminderTime.split(":");
		var hour = parseInt(setTime[0]);

		try {
			const body = { hour };

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
		
	}, [])

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
									onChange={(e) => setGeneralReminderTime(e)}
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

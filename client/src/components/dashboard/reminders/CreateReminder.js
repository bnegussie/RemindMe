import React, { Fragment, useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import { toast } from "react-toastify";

import { ClearDateSecAndMill } from "./ClearDate";
import { PushGeneralReminderTimeAhead } from "./PushGeneralReminderTimeAhead";

import "react-datepicker/dist/react-datepicker.css";
import "bootstrap/dist/css/bootstrap.min.css";

import "./../../../App.css";

function CreateReminder({ activeRemindersEmpty }) {
	const [title, setTitle] = useState("");
	const [desc, setDesc] = useState("");

	const [dueDate, setDueDate] = useState(null);
	const [reminderDate, setReminderDate] = useState(null);


	const onCreateForm = async (e) => {

		e.preventDefault();

		// Quick input validation:
		if (title === "" || (title).replace(/\s/g, "") === "") {
			return toast.error("Please provide a reminder title. (Empty spaces are not valid.)", 
                            	{autoClose: 4000});

		} else if (!dueDate) {
			return toast.error("Please provide a Due Date.", {autoClose: 3000});
		} else if (!reminderDate) {
			return toast.error("Please provide a Reminder Date.", {autoClose: 3000});
		}
		
		// Sanitizing the Dates:
		const now = ClearDateSecAndMill();
		const givenDueDate = ClearDateSecAndMill( dueDate );
		const givenReminderDate = ClearDateSecAndMill( reminderDate );
		
		if (givenDueDate <= now) {
			return toast.error("Please provide a Due Date that is in the future.");

		} else if (givenReminderDate <= now) {
			return toast.error("Please provide a Reminder Date that is in the future.");
		} else if (givenReminderDate > givenDueDate) {
			return toast.error("The Reminder Date cannot be set past the Due Date.");
		}
		// Finished input validation.

		// Reuseable header:
		const myHeaders = new Headers();
		myHeaders.append("Content-type", "application/json");
		myHeaders.append("token", localStorage.token);
		myHeaders.append("refreshToken", localStorage.refreshToken);

		if (activeRemindersEmpty) {
			await PushGeneralReminderTimeAhead(myHeaders);
		}

		const completed = false;
		const reminderSent = false;
		// The Dates stored in the DB are not sanitized.
		const body = {completed, title, desc, dueDate, reminderDate, reminderSent};

		try {
			const respAllReminders = await fetch("/api/dashboard/reminder/all", {
				method: "POST",
				headers: myHeaders,
				body: JSON.stringify(body),
			});

			const parseResp = await respAllReminders.json();
			const id = parseResp.reminder_id;

			// The Dates stored in the DB are not sanitized.
			const bodyPlusId = {id, completed, title, desc, dueDate, reminderDate, reminderSent}
			
			// eslint-disable-next-line
			const respActiveReminders = await fetch("/api/dashboard/reminder/active", {
				method: "POST",
				headers: myHeaders,
				body: JSON.stringify(bodyPlusId),
            });
            
            window.location = "/";
		} catch (error) {
			console.error(error.message);
		}
	};

	function onCancelForm() {
		try {
			setTitle("");
			setDesc("");
			setDueDate(null);
			setReminderDate(null);
		} catch (error) {
			console.error(error.message);
		}
	}

	// Prevents the keyboard popup when used on mobile devices.
	useEffect(() => {
		document.getElementById('create-reminder-due-date').setAttribute('readonly', 'readonly');
		document.getElementById('create-reminder-reminder-date').setAttribute('readonly', 'readonly');
	}, []);


	return (
		<Fragment>
			<div className="createreminder-container">
				<button
					type="button"
                    className="btn btn-success"
                    id="createreminder-new-btn"
                    data-toggle="modal"
                    data-target="#newReminder"
				>
					New Reminder
				</button>

				<div className="modal" id="newReminder">
					<div className="modal-dialog">
						<div className="modal-content">
							<div className="modal-header">
								<h4 className="modal-title">New Reminder</h4>
								<button type="button" className="close" 
									data-dismiss="modal"
									onClick={() => onCancelForm()}>
									&times;
								</button>
							</div>

							<form onSubmit={e => onCreateForm(e)}>
								<div className="modal-body">
									<div className="form-group reminders">
										<input
											type="text"
											required
											id="create-reminder-title"
											maxLength="100"
											placeholder=" "
											className="form-control"
											value={title}
											onChange={(e) => setTitle(e.target.value)}
											autoFocus
											autoCapitalize="on"
										/>
										<label htmlFor="create-reminder-title" className="form-label">
											Reminder title:
										</label>
									</div>

									<div className="form-group reminders">
										<textarea
											maxLength="1000"
											id="create-reminder-details"
											placeholder=" "
											className="form-control reminder-details"
											value={desc}
											onChange={(e) => setDesc(e.target.value)}
										/>
										<label 
											htmlFor="create-reminder-details" 
											className="form-label reminder-details">

											Reminder details: (optional):
										</label>
									</div>
								
									<div className="inputTextBoxDateFormat">
										<div className="form-group reminders">
											<DatePicker
												selected={dueDate}
												required
												id="create-reminder-due-date"
												className="form-control"
												onChange={(date) => setDueDate(date)}
												minDate={new Date()}
												placeholderText=" "
												showTimeSelect
												timeFormat="h:mm a"
												timeIntervals={15}
												dateFormat="MMMM d, yyyy h:mm aa"
												popperModifiers={{ preventOverflow: { enabled: true, }, }}
												isClearable
											/>
											<label 
												htmlFor="create-reminder-due-date" 
												className="form-label">

												Due Date:
											</label>
										</div>

										<div className="form-group reminders">
											<DatePicker
												selected={reminderDate}
												required
												id="create-reminder-reminder-date"
												className="form-control"
												onChange={(date) => setReminderDate(date)}
												minDate={new Date()}
												placeholderText=" "
												showTimeSelect
												timeFormat="h:mm a"
												timeIntervals={15}
												dateFormat="MMMM d, yyyy h:mm aa"
												popperModifiers={{ preventOverflow: { enabled: true, }, }}
												isClearable
											/>
											<label 
												htmlFor="create-reminder-reminder-date" 
												className="form-label">

												Reminder Date:
											</label>
										</div>										
									</div>
								</div>

								<div className="modal-footer">
									<input type="submit" value="Create" className="btn btn-success"/>

									<button
										type="button"
										className="btn btn-danger"
										data-dismiss="modal"
										onClick={() => onCancelForm()}
									>
										Cancel
									</button>
								</div>
							</form>

						</div>
					</div>
				</div>
			</div>
		</Fragment>
	);
}

export default CreateReminder;

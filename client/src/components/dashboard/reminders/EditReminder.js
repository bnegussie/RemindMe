import React, { Fragment, useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import { toast } from "react-toastify";

import "./../../../App.css"

function EditReminder({ currReminder, redirectTo }) {
	const [completed, setCompleted] = useState( currReminder.reminder_completed );
	const [title, setTitle] = useState(currReminder.reminder_title);
	const [desc, setDesc] = useState(currReminder.reminder_desc);
	const [dueDate, setDueDate] = useState( new Date(currReminder.reminder_due_date) );
	const [reminderDate, setReminderDate] = useState( new Date(currReminder.reminder_reminder_date) );
	

	const editText = async (e) => {
		e.preventDefault();

		const now = new Date().getTime();
		const givenDueDate = dueDate.getTime();
		const givenReminderDate = reminderDate.getTime();

		if (givenDueDate <= now && !completed) {
			toast.error("Please provide a Due Date that is in the future.");
			return false;
		} else if (givenReminderDate <= now && !completed) {
			toast.error("Please provide a Reminder Date that is in the future.");
			return false;
		}
		// Finished validating input.------------------------------------------------

		
		var reminderSent = currReminder.reminder_reminder_sent;

		const originalReminderDate = new Date( currReminder.reminder_reminder_date );
		if (originalReminderDate.getTime() !== reminderDate.getTime()) {
			reminderSent = false;
		}

		try {
			const id = currReminder.reminder_id;
			const body = {
				completed: completed,
				title: title,
				desc: desc,
				dueDate: dueDate,
				reminderDate: reminderDate,
				reminderSent: reminderSent
			};
			const bodyPlusId = {id, completed, title, desc, dueDate, reminderDate, reminderSent};

			// The possibility that the Completed check box state being 
			// altered makes this a bit more complicated function. 

			const respAllGetReminder = await fetch(`/api/dashboard/reminder/all/${id}`, {
				method: "GET",
				headers: {token: localStorage.token}
			});
			const respCurrReminder = await respAllGetReminder.json();
			
			const originalCompletedState = respCurrReminder.reminder_completed;

			const myHeaders = new Headers();
			myHeaders.append("Content-type", "application/json");
			myHeaders.append("token", localStorage.token);

			if (originalCompletedState === completed) {
				// The Completed state has not been changed.

				if (completed) {
					// eslint-disable-next-line
					const respUpdatedCompletedReminder = await fetch(
						`/api/dashboard/reminder/completed/${id}`, 
						{
							method: "PUT",
							headers: myHeaders,
							body: JSON.stringify(body)
					});

				} else {
					// eslint-disable-next-line
					const respUpdatedActiveReminder = await fetch(
						`/api/dashboard/reminder/active/${id}`, {
							method: "PUT",
							headers: myHeaders,
							body: JSON.stringify(body)
					});


					// Checking if this reminder is overdue:
					const getCurrentTime = ( new Date() ).getTime();
					const dueTime = ( new Date(dueDate) ).getTime();

					const respAllOverdue = await fetch("/api/dashboard/reminder/overdue", {
						method: "GET",
						headers: {token: localStorage.token}
					});
					const localAllOverdueReminders = await respAllOverdue.json();
					
					var alreadyOnOverdueList = false;
					var i = 0;
					const overdueLength = localAllOverdueReminders.length;

					while (i < overdueLength && !alreadyOnOverdueList) {

						if (localAllOverdueReminders[i].reminder_id === id) {
							// Is on the Overdue list
							
							if (dueTime < getCurrentTime) {
								// and is currently overdue, so updating the Overdue list.
								// eslint-disable-next-line
								const respUpdateOfOverdueReminder = await fetch(
									`/api/dashboard/reminder/overdue/${id}`, 
									{
										method: "PUT",
										headers: myHeaders,
										body: JSON.stringify(body)
								});
							} else {
								/* but now the Due Date has been pushed forward, so
								 * it is not overdue anymore; so it needs to be removed
								 * from the Overdue list.
								 */

								// eslint-disable-next-line
								const respDeleteOfOverdueReminder = await fetch(
									`/api/dashboard/reminder/overdue/${id}`, 
									{
										method: "DELETE",
										headers: {token: localStorage.token}
								});

							}
							alreadyOnOverdueList = true;
						}
						i++;
					}
				}

			} else {
				// The Completed state has been changed.

				if (completed) {
					// eslint-disable-next-line
					const respDeletedActiveReminder = await fetch(
						`/api/dashboard/reminder/active/${id}`, {
							method: "DELETE",
							headers: {token: localStorage.token}
					});

					// eslint-disable-next-line
					const respDeletedOverdueReminder = await fetch(
						`/api/dashboard/reminder/overdue/${id}`, {
							method: "DELETE",
							headers: {token: localStorage.token}
					});

					// eslint-disable-next-line
					const respAddingToCompleted = await fetch(
						"/api/dashboard/reminder/completed", {
							method: "POST",
							headers: myHeaders,
							body: JSON.stringify(bodyPlusId)
					});
				} else {
					// eslint-disable-next-line
					const respDeletedCompletedReminder = await fetch(
						`/api/dashboard/reminder/completed/${id}`, {
							method: "DELETE",
							headers: {token: localStorage.token}
					});

					// eslint-disable-next-line
					const respAddingToCompleted = await fetch(
						"/api/dashboard/reminder/active", {
							method: "POST",
							headers: myHeaders,
							body: JSON.stringify(bodyPlusId)
					});
				}
			}

			// eslint-disable-next-line
			const respUpdatedAllReminder = await fetch(
				`/api/dashboard/reminder/all/${id}`, {
					method: "PUT",
					headers: myHeaders,
					body: JSON.stringify(body)
			});

			const finalDest = redirectTo ? redirectTo : "/";
			window.location = finalDest;

		} catch (error) {
			console.error(error.message);
		}
	};

	function onCancelForm() {
		try {
			setCompleted( currReminder.reminder_completed );
			setTitle( currReminder.reminder_title );
			setDesc( currReminder.reminder_desc );
			setDueDate( new Date(currReminder.reminder_due_date) );
			setReminderDate( new Date(currReminder.reminder_reminder_date) );
		} catch (error) {
			console.error(error.message);
		}
	}

	// Prevents the keyboard popup when used on mobile devices.
	useEffect(() => {
		// Can't use Id to get the elements here because the ids are dynamically generated 
		// because this Edit class is looking at multiple tasks and an id has to be unique.
		var elements = document.getElementsByClassName('form-control date-picker');
		for (var i = 0; i < elements.length; i++) {
			elements[i].setAttribute('readonly', 'readonly');
		}
	}, []);


	return (
		<Fragment>
			<div className="edit-reminder-container">
				<div className="edit-reminder-btn">
					<button
						type="button"
						className="btn btn-info"
						data-toggle="modal"
						data-target={`#id${currReminder.reminder_id}`}
					>
						View
					</button>
				</div>

				<div className="modal" id={`id${currReminder.reminder_id}`}>
					<div className="modal-dialog">
						<div className="modal-content">
							<div className="modal-header">
								<h4 className="modal-title">Edit Reminder</h4>
								<button type="button" className="close" 
									data-dismiss="modal" 
									onClick={() => onCancelForm()}>
									&times;
								</button>
							</div>

							<form onSubmit={e => editText(e)}>
								<div className="modal-body">
									<div className="editreminder-completed">
										<label>Completed:</label>
										<input type="checkbox" 
											className="completed-checkboxes"
											defaultValue={completed}
											onChange={() => setCompleted( !completed )}
											checked={completed}
											/>
										<br/>
									</div>

									<div className="form-group reminders">
										<input
											type="text"
											required
											id={ currReminder.reminder_id + "edit-reminder-title" }
											maxLength="100"
											placeholder=" "
											className="form-control"
											value={title}
											onChange={(e) => setTitle(e.target.value)}
											autoCapitalize="on"
										/>
										<label 
											htmlFor={ currReminder.reminder_id + "edit-reminder-title" } 
											className="form-label">
											Reminder title:
										</label>
									</div>

									<div className="form-group reminders">
										<textarea
											maxLength="1000"
											id={ currReminder.reminder_id + "edit-reminder-details" }
											placeholder=" "
											className="form-control reminder-details"
											value={desc}
											onChange={(e) => setDesc(e.target.value)}
										/>
										<label 
											htmlFor={ currReminder.reminder_id + "edit-reminder-details" } 
											className="form-label reminder-details">

											Reminder details: (optional):
										</label>
									</div>
									
									<div className="inputTextBoxDateFormat">
										<div className="form-group reminders">
											<DatePicker
												selected={dueDate}
												required
												id={ currReminder.reminder_id + "edit-reminder-due-date" }
												className="form-control date-picker"
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
												htmlFor={ currReminder.reminder_id + "edit-reminder-due-date" }
												className="form-label">

												Due Date:
											</label>
										</div>
										
										<div className="form-group reminders">
											<DatePicker
												selected={reminderDate}
												required
												id={ currReminder.reminder_id + "edit-reminder-reminder-date" }
												className="form-control date-picker"
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
												htmlFor={ currReminder.reminder_id + "edit-reminder-reminder-date" }
												className="form-label">

												Reminder Date:
											</label>
										</div>
									</div>
								</div>

								<div className="modal-footer">
									<input type="submit" value="Save" className="btn btn-success" />

									<button type="button" 
										className="btn btn-danger" 
										data-dismiss="modal"
										onClick={() => onCancelForm()} >

										Close
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

export default EditReminder;

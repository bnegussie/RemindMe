import React, { Fragment, useState, useEffect } from "react";
import InlineConfirmButton from "react-inline-confirm";
import EditToDo from "./EditToDo";
import InputToDo from "./InputToDo";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";

import "./../App.css";
import "react-tabs/style/react-tabs.css";

function Reminders() {
	const [allActiveReminders, setAllActiveReminders] = useState([]);
	const [allCompletedReminders, setAllCompletedReminders] = useState([]);
	const [allOverdueReminders, setAllOverdueReminders] = useState([]);
	const [allReminders, setAllReminders] = useState([]);

	const textValues = ["Delete", "Are you sure?", "Deleting..."];
	var isExecuting = false;
	const confirmIconClass = `fa fa-${isExecuting ? "circle-o-notch fa-spin" : "fa fa-trash"}`;

	async function getAllActiveReminders() {
		const response = await fetch("http://localhost:5000/reminder/active");
		const parseResp = await response.json();
		setAllActiveReminders(parseResp);
	}

	async function getAllCompletedReminders() {
		const response = await fetch("http://localhost:5000/reminder/completed");
		const parseResp = await response.json();
		setAllCompletedReminders(parseResp);
	}

	async function getAllOverdueReminders() {
		const response = await fetch("http://localhost:5000/reminder/overdue");
		const parseResp = await response.json();
		setAllOverdueReminders(parseResp);
	}

	async function getAllReminders() {
		const response = await fetch("http://localhost:5000/reminder/all");
		const parseResp = await response.json();
		setAllReminders(parseResp);
	}

	async function deleteReminderTask(reminder_id) {
		try {
			// eslint-disable-next-line
			const respAllReminders = await fetch(
				`http://localhost:5000/reminder/all/${reminder_id}`,
				{
					method: "DELETE",
				}
			);

			// eslint-disable-next-line
			const respActiveReminders = await fetch(
				`http://localhost:5000/reminder/active/${reminder_id}`,
				{
					method: "DELETE",
				}
			);

			// eslint-disable-next-line
			const respCompletedReminders = await fetch(
				`http://localhost:5000/reminder/completed/${reminder_id}`,
				{
					method: "DELETE",
				}
			);

			// eslint-disable-next-line
			const respOverdueReminders = await fetch(
				`http://localhost:5000/reminder/overdue/${reminder_id}`,
				{
					method: "DELETE",
				}
			);

			// Updating the active and the all reminder lists:
			setAllActiveReminders(
				allActiveReminders.filter((reminder) => reminder.reminder_id !== reminder_id)
			);
			setAllCompletedReminders(
				allCompletedReminders.filter((reminder) => reminder.reminder_id !== reminder_id)
			);
			setAllOverdueReminders(
				allOverdueReminders.filter((reminder) => reminder.reminder_id !== reminder_id)
			);
			setAllReminders( allReminders.filter((reminder) => reminder.reminder_id !== reminder_id) );
		} catch (error) {
			console.error(error.message);
		}
	}

	async function reminderCompletedState(reminder_id, reminder_completed) {
		reminder_completed = !reminder_completed;

		if (reminder_completed) {
			// The Completed checkbox just got the check marked.

			const respActiveReminders = await fetch( `http://localhost:5000/reminder/active/${reminder_id}`, {
					method: "DELETE",
				}
			);

			// eslint-disable-next-line
			const respOverdueReminders = await fetch( `http://localhost:5000/reminder/overdue/${reminder_id}`, {
					method: "DELETE",
				}
			);

			const parseResp = await respActiveReminders.json();

			const id = reminder_id;
			const completed = reminder_completed,
				title = parseResp.reminder_title,
				desc = parseResp.reminder_desc,
				dueDate = parseResp.reminder_due_date,
				reminderDate = parseResp.reminder_reminder_date;

			const body = { completed, title, desc, dueDate, reminderDate };
			const bodyPlusId = { id, completed, title, desc, dueDate, reminderDate };

			// eslint-disable-next-line
			const respAllReminders = await fetch(
				`http://localhost:5000/reminder/all/${reminder_id}`,
				{
					method: "PUT",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(body),
				}
			);

			// eslint-disable-next-line
			const respCompletedReminders = await fetch("http://localhost:5000/reminder/completed", {
				method: "POST",
				headers: { "Content-type": "application/json" },
				body: JSON.stringify(bodyPlusId),
			});
		} else {
			// The Completed checkbox has now been unchecked.

			// eslint-disable-next-line
			const respCompletedReminders = await fetch(
				`http://localhost:5000/reminder/completed/${reminder_id}`,
				{
					method: "DELETE",
				}
			);

			const parseResp = await respCompletedReminders.json();

			const id = reminder_id;
			const completed = reminder_completed,
				title = parseResp.reminder_title,
				desc = parseResp.reminder_desc,
				dueDate = parseResp.reminder_due_date,
				reminderDate = parseResp.reminder_reminder_date;

			const body = { completed, title, desc, dueDate, reminderDate };
			const bodyPlusId = { id, completed, title, desc, dueDate, reminderDate };

			// eslint-disable-next-line
			const respAllReminders = await fetch(
				`http://localhost:5000/reminder/all/${reminder_id}`,
				{
					method: "PUT",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(body),
				}
			);

			// eslint-disable-next-line
			const respActiveReminders = await fetch("http://localhost:5000/reminder/active", {
				method: "POST",
				headers: { "Content-type": "application/json" },
				body: JSON.stringify(bodyPlusId),
			});
		}

		window.location = "/";
	}

	useEffect(() => {
		getAllActiveReminders();
		getAllCompletedReminders();
		getAllReminders();
		getAllOverdueReminders();
	}, []);

	// For the Overdue navigation tab:
	useEffect(() => {
		async function getLatestOverdueReminders() {
			try {
				/* These API requests are very important because we want to make sure we wait and
				 * have the proper decision, before deciding to place a reminder as overdue,
				 * as to prevent any duplications.
				 */
				const respGetAllActiveReminders = await fetch("http://localhost:5000/reminder/active");
				const allActive = await respGetAllActiveReminders.json();

				const respGetAllOverdueReminders = await fetch("http://localhost:5000/reminder/overdue");
				const allOverdue = await respGetAllOverdueReminders.json();
				
				var activeLength = allActive.length;
				var overdueLength = allOverdue.length;

				var checkedAllOverdueReminders = false;
				var activeIndex = 0;

				while (activeIndex < activeLength && !checkedAllOverdueReminders) {

					var activeReminder = allActive[activeIndex];

					var alreadyOnOverdueList = false;
					var overdueIndex = 0;

					// Making sure the tasks, which we will be assessing, is not already on the Overdue list.
					while (overdueIndex < overdueLength && !alreadyOnOverdueList) {
						
						if (allOverdue[overdueIndex].reminder_id === activeReminder.reminder_id) {
							alreadyOnOverdueList = true;
						}
						overdueIndex++;
					}

					if ( !alreadyOnOverdueList ) {

						const getCurrentTime = ( new Date() ).getTime();
						const activeReminderTime = ( new Date(activeReminder.reminder_due_date) ).getTime();
					
						if (activeReminderTime < getCurrentTime) {
							// If a reminder's due date has passed, then that reminder gets added to the
							// Overdue list.

							var id = activeReminder.reminder_id,
								completed = activeReminder.reminder_completed,
								title = activeReminder.reminder_title,
								desc = activeReminder.reminder_desc,
								dueDate = activeReminder.reminder_due_date,
								reminderDate = activeReminder.reminder_reminder_date;

							var bodyPlusId = { id, completed, title, desc, dueDate, reminderDate };

							// eslint-disable-next-line
							const addingToOverdueReminders = await fetch(
								`http://localhost:5000/reminder/overdue`,
								{
									method: "POST",
									headers: { "Content-type": "application/json" },
									body: JSON.stringify(bodyPlusId),
								}
							);

						} else {
							/* Since the GET  DB query returns the list of Active reminders, filtered
							* by due date in ascending order, once we hit the first non-overdue
							* reminder, we can safely stop looking at the active reminders.
							*/
							checkedAllOverdueReminders = true;
						}
					}

					activeIndex++;
				}
				getAllOverdueReminders();
	
			} catch (error) {
				console.error(error.message);
			}
		}
		
		getLatestOverdueReminders();		
	}, []);




	return (
		<Fragment>
			<div id="new-reminder-btn-on-dashboard">
				<InputToDo />
			</div>

			<Tabs>
				<TabList className="reminder-tabs">
					<Tab style={{ minWidth: "20%" }}>Active</Tab>
					<Tab style={{ minWidth: "20%" }}>All</Tab>
					<Tab style={{ minWidth: "20%" }}>Completed</Tab>
					{allOverdueReminders.length > 0 ? 
						(<Tab style={{ backgroundColor: 'red', color: 'black', borderRadius: '10px', minWidth: "20%" }}>
							Overdue ({allOverdueReminders.length})
						</Tab>) 
						: 
						(<Tab style={{ minWidth: "20%" }}>Overdue</Tab>)
					}
				</TabList>

				<TabPanel>
					<div className="reminders-container">
						<table className="table">
							<thead>
								<tr id="reminders-table-row">
									<th width="10%">Completed</th>
									<th width="70%">Title</th>
									<th width="10%">View</th>
									<th width="10%">Delete</th>
								</tr>
							</thead>
							<tbody>
								{allActiveReminders.map((currReminder) => (
									<tr key={currReminder.reminder_id}>
										<td>
											<input
												type="checkbox"
												id="completed-checkboxes"
												onChange={() =>
													reminderCompletedState(
														currReminder.reminder_id,
														currReminder.reminder_completed
													)
												}
												checked={currReminder.reminder_completed}
											/>
										</td>
										<td className="reminder-titles">
											{currReminder.reminder_title}
										</td>
										<td>
											<EditToDo currReminder={currReminder} />
										</td>
										<td>
											<InlineConfirmButton
												className="btn btn-danger"
												textValues={textValues}
												showTimer
												isExecuting={isExecuting}
												onClick={() =>
													deleteReminderTask(currReminder.reminder_id)
												}
											>
												<i className={confirmIconClass}></i>
											</InlineConfirmButton>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</TabPanel>

				<TabPanel>
					<div className="reminders-container">
						<table className="table">
							<thead>
								<tr id="reminders-table-row">
									<th width="10%">Completed</th>
									<th width="70%">Title</th>
									<th width="10%">View</th>
									<th width="10%">Delete</th>
								</tr>
							</thead>
							<tbody>
								{allReminders.map((currReminder) => (
									<tr key={currReminder.reminder_id}>
										<td>
											<input
												type="checkbox"
												id="completed-checkboxes"
												onChange={() =>
													reminderCompletedState(
														currReminder.reminder_id,
														currReminder.reminder_completed
													)
												}
												checked={currReminder.reminder_completed}
											/>
										</td>
										<td className="reminder-titles">
											{currReminder.reminder_title}
										</td>
										<td>
											<EditToDo currReminder={currReminder} />
										</td>
										<td>
											<InlineConfirmButton
												className="btn btn-danger"
												textValues={textValues}
												showTimer
												isExecuting={isExecuting}
												onClick={() =>
													deleteReminderTask(currReminder.reminder_id)
												}
											>
												<i className={confirmIconClass}></i>
											</InlineConfirmButton>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</TabPanel>

				<TabPanel>
					<div className="reminders-container">
						<table className="table">
							<thead>
								<tr id="reminders-table-row">
									<th width="10%">Completed</th>
									<th width="70%">Title</th>
									<th width="10%">View</th>
									<th width="10%">Delete</th>
								</tr>
							</thead>
							<tbody>
								{allCompletedReminders.map((currReminder) => (
									<tr key={currReminder.reminder_id}>
										<td>
											<input
												type="checkbox"
												id="completed-checkboxes"
												onChange={() =>
													reminderCompletedState(
														currReminder.reminder_id,
														currReminder.reminder_completed
													)
												}
												value={currReminder.reminder_completed}
												checked={currReminder.reminder_completed}
											/>
										</td>
										<td className="reminder-titles">
											{currReminder.reminder_title}
										</td>
										<td>
											<EditToDo currReminder={currReminder} />
										</td>
										<td>
											<InlineConfirmButton
												className="btn btn-danger"
												textValues={textValues}
												showTimer
												isExecuting={isExecuting}
												onClick={() =>
													deleteReminderTask(currReminder.reminder_id)
												}
											>
												<i className={confirmIconClass}></i>
											</InlineConfirmButton>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</TabPanel>

				<TabPanel>
					<div className="reminders-container">
						<table className="table">
							<thead>
								<tr id="reminders-table-row">
									<th width="10%">Completed</th>
									<th width="70%">Title</th>
									<th width="10%">View</th>
									<th width="10%">Delete</th>
								</tr>
							</thead>
							<tbody>
								{allOverdueReminders.map((currReminder) => (
									<tr key={currReminder.reminder_id}>
										<td>
											<input
												type="checkbox"
												id="completed-checkboxes"
												onChange={() =>
													reminderCompletedState(
														currReminder.reminder_id,
														currReminder.reminder_completed
													)
												}
												value={currReminder.reminder_completed}
												checked={currReminder.reminder_completed}
											/>
										</td>
										<td id="overdue-title">{currReminder.reminder_title}</td>
										<td>
											<EditToDo currReminder={currReminder} />
										</td>
										<td>
											<InlineConfirmButton
												className="btn btn-danger"
												textValues={textValues}
												showTimer
												isExecuting={isExecuting}
												onClick={() =>
													deleteReminderTask(currReminder.reminder_id)
												}
											>
												<i className={confirmIconClass}></i>
											</InlineConfirmButton>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</TabPanel>
			</Tabs>
		</Fragment>
	);
}

export default Reminders;

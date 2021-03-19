import React, { Fragment, useState, useEffect } from "react";
import InlineConfirmButton from "react-inline-confirm";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import { Link } from "react-router-dom";

// Components:
import CreateReminder from "./CreateReminder";
import EditReminder from "./EditReminder";
import { ClearDateSecAndMill } from "./ClearDate";
import { ReminderCompletedState } from "./ReminderCompletedState";

import "./../../../App.css";
import "react-tabs/style/react-tabs.css";


function Reminders({ isAuth }) {
	const [allActiveReminders, setAllActiveReminders] = useState([]);
	const [allCompletedReminders, setAllCompletedReminders] = useState([]);
	const [allOverdueReminders, setAllOverdueReminders] = useState([]);
	const [allReminders, setAllReminders] = useState([]);

	var completedComputationInProgress = false;

	const textValues = ["Delete", "Are you sure?", "Deleting..."];
	var isExecuting = false;
	const confirmIconClass = `fa fa-${isExecuting ? "circle-o-notch fa-spin" : "fa fa-trash"}`;

	async function getAllActiveReminders() {
		try {
			const response = await fetch("/api/dashboard/reminder/active", {
				method: "GET",
				headers: {token: localStorage.token}
			});
			const parseResp = await response.json();
			setAllActiveReminders(parseResp);
		} catch (error) {
			console.error(error.message);
		}
	}

	async function getAllCompletedReminders() {
		try {
			const response = await fetch("/api/dashboard/reminder/completed", {
				method: "GET",
				headers: {token: localStorage.token}
			});
			const parseResp = await response.json();
			setAllCompletedReminders(parseResp);
		} catch (error) {
			console.error(error.message);
		}
	}

	async function getAllOverdueReminders() {
		try {
			const response = await fetch("/api/dashboard/reminder/overdue", {
				method: "GET",
				headers: {token: localStorage.token}
			});
			const parseResp = await response.json();
			setAllOverdueReminders(parseResp);
		} catch (error) {
			console.error(error.message);
		}
	}

	async function getAllReminders() {
		try {
			const response = await fetch("/api/dashboard/reminder/all", {
				method: "GET",
				headers: {token: localStorage.token}
			});
			const parseResp = await response.json();
			setAllReminders(parseResp);
		} catch (error) {
			console.error(error.message);
		}
	}

	async function deleteReminderTask(reminder_id) {
		try {
			// eslint-disable-next-line
			const respActiveReminders = await fetch(
				`/api/dashboard/reminder/active/${reminder_id}`,
				{
					method: "DELETE",
					headers: {token: localStorage.token}
				}
			);

			// eslint-disable-next-line
			const respCompletedReminders = await fetch(
				`/api/dashboard/reminder/completed/${reminder_id}`,
				{
					method: "DELETE",
					headers: {token: localStorage.token}
				}
			);

			// eslint-disable-next-line
			const respOverdueReminders = await fetch(
				`/api/dashboard/reminder/overdue/${reminder_id}`,
				{
					method: "DELETE",
					headers: {token: localStorage.token}
				}
			);

			// eslint-disable-next-line
			const respAllReminders = await fetch(
				`/api/dashboard/reminder/all/${reminder_id}`,
				{
					method: "DELETE",
					headers: {token: localStorage.token}
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

	async function reminderCompletedStateHelper(reminder_id, reminder_completed) {

		/* Preventative flag so if a user quickly clicks on the completed box, before the 
		 * computation finishes, the requests reach the database and the second request
		 * fails because it doesn't have the proper data anymore.
		 */
		if (!completedComputationInProgress) {
			completedComputationInProgress = true;
			let activeRemindersEmpty = allActiveReminders.length === 0;
		
			await ReminderCompletedState(reminder_id, reminder_completed, activeRemindersEmpty);

			// Reloading is necessary because the Edit component will not have the
			// same state without a rerender.
			window.location = "/";
		}
	}

	useEffect(() => {
		getAllActiveReminders();
		getAllCompletedReminders();
		getAllReminders();
		getAllOverdueReminders();

		return () => {
			setAllActiveReminders([]);
			setAllCompletedReminders([]);
			setAllOverdueReminders([]);
			setAllReminders([]);
		}
	}, []);

	// For the Overdue navigation tab:
	useEffect(() => {
		async function getLatestOverdueReminders() {
			try {
				/* These API requests are very important because we want to make sure we wait and
				 * have the proper decision, before deciding to place a reminder as overdue,
				 * as to prevent any duplications.
				 */
				const respGetAllActiveReminders = await fetch("/api/dashboard/reminder/active", {
					method: "GET",
					headers: {token: localStorage.token}
				});
				const allActive = await respGetAllActiveReminders.json();

				const respGetAllOverdueReminders = await fetch(
					"/api/dashboard/reminder/overdue", {
						method: "GET",
						headers: {token: localStorage.token}
					});
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

						const getCurrentTime = ClearDateSecAndMill();
						const activeReminderTime = ClearDateSecAndMill( activeReminder.reminder_due_date );
					
						if (activeReminderTime < getCurrentTime) {
							// If a reminder's due date has passed, then that reminder gets added to the
							// Overdue list.

							var id = activeReminder.reminder_id,
								completed = activeReminder.reminder_completed,
								title = activeReminder.reminder_title,
								desc = activeReminder.reminder_desc,
								dueDate = activeReminder.reminder_due_date,
								reminderDate = activeReminder.reminder_reminder_date,
								reminderSent = activeReminder.reminder_reminder_sent;

							var bodyPlusId = { id, completed, title, desc, dueDate, 
												reminderDate, reminderSent };

							const myHeaders = new Headers();
							myHeaders.append("Content-type", "application/json");
							myHeaders.append("token", localStorage.token);

							// eslint-disable-next-line
							const addingToOverdueReminders = await fetch(
								`/api/dashboard/reminder/overdue`,
								{
									method: "POST",
									headers: myHeaders,
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

		return () => {
			setAllOverdueReminders([]);
		}	
	}, []);




	return (
		<Fragment>
			<div className="main-dashboard-btns">
				<div className="dashboard-btns" onClick={isAuth} onMouseEnter={isAuth}>
					<CreateReminder activeRemindersEmpty={ allActiveReminders.length === 0 } />

					<Link className='search-btn-on-dashboard' to="/Dashboard/Search">
						<i className="fas fa-search"  />
					</Link>
				</div>
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
									<th width="10%" className="reminders-headers">Completed</th>
									<th width="50%" className="reminders-headers">Title</th>
									<th width="20%" className="reminders-headers">View</th>
									<th width="20%" className="reminders-headers">Delete</th>
								</tr>
							</thead>
							<tbody>
								{allActiveReminders.map((currReminder) => (
									<tr key={currReminder.reminder_id}>
										<td onClick={isAuth} onMouseEnter={isAuth} >
											<input
												type="checkbox"
												className="completed-checkboxes"
												onChange={() =>
													reminderCompletedStateHelper(
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
										<td onClick={isAuth} >
											<EditReminder 
												currReminder={currReminder} 
												activeRemindersEmpty={ allActiveReminders.length === 0 } 
											/>
										</td>
										<td onClick={isAuth} >
											<InlineConfirmButton
												className="btn btn-danger delete-reminder"
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
						{allActiveReminders.length === 0 && 
							<p className="no-data-available-msg">You do not have any active reminders.</p>
						}
					</div>
				</TabPanel>

				<TabPanel>
					<div className="reminders-container">
						<table className="table">
							<thead>
								<tr id="reminders-table-row">
									<th width="10%" className="reminders-headers">Completed</th>
									<th width="50%" className="reminders-headers">Title</th>
									<th width="20%" className="reminders-headers">View</th>
									<th width="20%" className="reminders-headers">Delete</th>
								</tr>
							</thead>
							<tbody>
								{allReminders.map((currReminder) => (
									<tr key={currReminder.reminder_id}>
										<td onClick={isAuth} onMouseEnter={isAuth} >
											<input
												type="checkbox"
												className="completed-checkboxes"
												onChange={() =>
													reminderCompletedStateHelper(
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
										<td onClick={isAuth} >
											<EditReminder 
												currReminder={currReminder} 
												activeRemindersEmpty={ allActiveReminders.length === 0 } 
											/>
										</td>
										<td onClick={isAuth} >
											<InlineConfirmButton
												className="btn btn-danger delete-reminder"
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
						{allReminders.length === 0 && 
							<p className="no-data-available-msg">You do not have any reminders.</p>
						}
					</div>
				</TabPanel>

				<TabPanel>
					<div className="reminders-container">
						<table className="table">
							<thead>
								<tr id="reminders-table-row">
									<th width="10%" className="reminders-headers">Completed</th>
									<th width="50%" className="reminders-headers">Title</th>
									<th width="20%" className="reminders-headers">View</th>
									<th width="20%" className="reminders-headers">Delete</th>
								</tr>
							</thead>
							<tbody>
								{allCompletedReminders.map((currReminder) => (
									<tr key={currReminder.reminder_id}>
										<td onClick={isAuth} onMouseEnter={isAuth} >
											<input
												type="checkbox"
												className="completed-checkboxes"
												onChange={() =>
													reminderCompletedStateHelper(
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
										<td onClick={isAuth} >
											<EditReminder 
												currReminder={currReminder} 
												activeRemindersEmpty={ allActiveReminders.length === 0 } 
											/>
										</td>
										<td onClick={isAuth} >
											<InlineConfirmButton
												className="btn btn-danger delete-reminder"
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
						{allCompletedReminders.length === 0 && 
							<p className="no-data-available-msg">You do not have any completed reminders.</p>
						}
					</div>
				</TabPanel>

				<TabPanel>
					<div className="reminders-container">
						<table className="table">
							<thead>
								<tr id="reminders-table-row">
									<th width="10%" className="reminders-headers">Completed</th>
									<th width="50%" className="reminders-headers">Title</th>
									<th width="20%" className="reminders-headers">View</th>
									<th width="20%" className="reminders-headers">Delete</th>
								</tr>
							</thead>
							<tbody>
								{allOverdueReminders.map((currReminder) => (
									<tr key={currReminder.reminder_id}>
										<td onClick={isAuth} onMouseEnter={isAuth} >
											<input
												type="checkbox"
												className="completed-checkboxes"
												onChange={() =>
													reminderCompletedStateHelper(
														currReminder.reminder_id,
														currReminder.reminder_completed
													)
												}
												value={currReminder.reminder_completed}
												checked={currReminder.reminder_completed}
											/>
										</td>
										<td id="overdue-title">{currReminder.reminder_title}</td>
										<td onClick={isAuth} >
											<EditReminder 
												currReminder={currReminder} 
												activeRemindersEmpty={ allActiveReminders.length === 0 } 
											/>
										</td>
										<td onClick={isAuth} >
											<InlineConfirmButton
												className="btn btn-danger delete-reminder"
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
						{allOverdueReminders.length === 0 && 
							<p className="no-data-available-msg">You do not have any overdue reminders.</p>
						}
					</div>
				</TabPanel>
			</Tabs>
		</Fragment>
	);
}

export default Reminders;

import React, { Fragment, useState, useEffect } from "react";
import InlineConfirmButton from "react-inline-confirm";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import {Link} from "react-router-dom";

import "./../../../App.css";
import "react-tabs/style/react-tabs.css";

// Components:
import EditReminder from "./EditReminder";
import CreateReminder from "./CreateReminder";

function Reminders({ isAuth }) {
	const [allActiveReminders, setAllActiveReminders] = useState([]);
	const [allCompletedReminders, setAllCompletedReminders] = useState([]);
	const [allOverdueReminders, setAllOverdueReminders] = useState([]);
	const [allReminders, setAllReminders] = useState([]);

	const textValues = ["Delete", "Are you sure?", "Deleting..."];
	var isExecuting = false;
	const confirmIconClass = `fa fa-${isExecuting ? "circle-o-notch fa-spin" : "fa fa-trash"}`;

	async function getAllActiveReminders() {
		try {
			const response = await fetch("http://localhost:5000/dashboard/reminder/active", {
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
			const response = await fetch("http://localhost:5000/dashboard/reminder/completed", {
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
			const response = await fetch("http://localhost:5000/dashboard/reminder/overdue", {
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
			const response = await fetch("http://localhost:5000/dashboard/reminder/all", {
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
				`http://localhost:5000/dashboard/reminder/active/${reminder_id}`,
				{
					method: "DELETE",
					headers: {token: localStorage.token}
				}
			);

			// eslint-disable-next-line
			const respCompletedReminders = await fetch(
				`http://localhost:5000/dashboard/reminder/completed/${reminder_id}`,
				{
					method: "DELETE",
					headers: {token: localStorage.token}
				}
			);

			// eslint-disable-next-line
			const respOverdueReminders = await fetch(
				`http://localhost:5000/dashboard/reminder/overdue/${reminder_id}`,
				{
					method: "DELETE",
					headers: {token: localStorage.token}
				}
			);

			// eslint-disable-next-line
			const respAllReminders = await fetch(
				`http://localhost:5000/dashboard/reminder/all/${reminder_id}`,
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

	async function reminderCompletedState(reminder_id, reminder_completed) {
		reminder_completed = !reminder_completed;

		const myHeaders = new Headers();
		myHeaders.append("Content-type", "application/json");
		myHeaders.append("token", localStorage.token);

		try {
			if (reminder_completed) {
				// The Completed checkbox just got the check marked.
	
				const respActiveReminders = await fetch(
					`http://localhost:5000/dashboard/reminder/active/${reminder_id}`, {
						method: "DELETE",
						headers: {token: localStorage.token}
					}
				);
	
				// eslint-disable-next-line
				const respOverdueReminders = await fetch(
					`http://localhost:5000/dashboard/reminder/overdue/${reminder_id}`, {
						method: "DELETE",
						headers: {token: localStorage.token}
					}
				);

				const parseResp = await respActiveReminders.json();
				
				const id = reminder_id;
				const completed = reminder_completed,
					title = parseResp.reminder_title,
					desc = parseResp.reminder_desc,
					dueDate = parseResp.reminder_due_date,
					reminderDate = parseResp.reminder_reminder_date,
					reminderSent = parseResp.reminder_reminder_sent;
	
				const body = { completed, title, desc, dueDate, reminderDate, reminderSent };
				const bodyPlusId = { id, completed, title, desc, dueDate, reminderDate, reminderSent };
	
				// eslint-disable-next-line
				const respAllReminders = await fetch(
					`http://localhost:5000/dashboard/reminder/all/${reminder_id}`,
					{
						method: "PUT",
						headers: myHeaders,
						body: JSON.stringify(body)
					}
				);
	
				// eslint-disable-next-line
				const respCompletedReminders = await fetch(
					"http://localhost:5000/dashboard/reminder/completed", {
						method: "POST",
						headers: myHeaders,
						body: JSON.stringify(bodyPlusId)
				});
	
			} else {
				// The Completed checkbox has now been unchecked.
	
				// eslint-disable-next-line
				const respCompletedReminders = await fetch(
					`http://localhost:5000/dashboard/reminder/completed/${reminder_id}`,
					{
						method: "DELETE",
						headers: {token: localStorage.token}
					}
				);
	
				const parseResp = await respCompletedReminders.json();
	
				const id = reminder_id;
				const completed = reminder_completed,
					title = parseResp.reminder_title,
					desc = parseResp.reminder_desc,
					dueDate = parseResp.reminder_due_date,
					reminderDate = parseResp.reminder_reminder_date,
					reminderSent = parseResp.reminder_reminder_sent;
	
				const body = { completed, title, desc, dueDate, reminderDate, reminderSent };
				const bodyPlusId = { id, completed, title, desc, dueDate, reminderDate, reminderSent };
	
				// eslint-disable-next-line
				const respAllReminders = await fetch(
					`http://localhost:5000/dashboard/reminder/all/${reminder_id}`,
					{
						method: "PUT",
						headers: myHeaders,
						body: JSON.stringify(body)
					}
				);
	
				// eslint-disable-next-line
				const respActiveReminders = await fetch(
					"http://localhost:5000/dashboard/reminder/active", {
						method: "POST",
						headers: myHeaders,
						body: JSON.stringify(bodyPlusId)
				});
			}
	
			window.location = "/";

		} catch (error) {
			console.error(error.message);
		}
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
				const respGetAllActiveReminders = await fetch("http://localhost:5000/dashboard/reminder/active", {
					method: "GET",
					headers: {token: localStorage.token}
				});
				const allActive = await respGetAllActiveReminders.json();

				const respGetAllOverdueReminders = await fetch(
					"http://localhost:5000/dashboard/reminder/overdue", {
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
								reminderDate = activeReminder.reminder_reminder_date,
								reminderSent = activeReminder.reminder_reminder_sent;

							var bodyPlusId = { id, completed, title, desc, dueDate, 
												reminderDate, reminderSent };

							const myHeaders = new Headers();
							myHeaders.append("Content-type", "application/json");
							myHeaders.append("token", localStorage.token);

							// eslint-disable-next-line
							const addingToOverdueReminders = await fetch(
								`http://localhost:5000/dashboard/reminder/overdue`,
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
	}, []);




	return (
		<Fragment>
			<div className="main-dashboard-btns">
				<div className="dashboard-btns" onClick={isAuth} onMouseEnter={isAuth}>
					<CreateReminder />

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
									<th width="60%" className="reminders-headers">Title</th>
									<th width="10%" className="reminders-headers">View</th>
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
										<td onClick={isAuth} >
											<EditReminder currReminder={currReminder} />
										</td>
										<td onClick={isAuth} >
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
									<th width="60%" className="reminders-headers">Title</th>
									<th width="10%" className="reminders-headers">View</th>
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
										<td onClick={isAuth} >
											<EditReminder currReminder={currReminder} />
										</td>
										<td onClick={isAuth} >
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
									<th width="60%" className="reminders-headers">Title</th>
									<th width="10%" className="reminders-headers">View</th>
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
										<td onClick={isAuth} >
											<EditReminder currReminder={currReminder} />
										</td>
										<td onClick={isAuth} >
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
									<th width="60%" className="reminders-headers">Title</th>
									<th width="10%" className="reminders-headers">View</th>
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
										<td onClick={isAuth} >
											<EditReminder currReminder={currReminder} />
										</td>
										<td onClick={isAuth} >
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

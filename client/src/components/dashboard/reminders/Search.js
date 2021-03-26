import React, { Fragment, useState, useEffect } from 'react';
import InlineConfirmButton from "react-inline-confirm";

import EditReminder from "./EditReminder";
import { ReminderCompletedState } from "./ReminderCompletedState";

import "./../../../App.css";

function Search({ isAuth }) {

    const [allReminders, setAllReminders] = useState([]);
    const [filteredReminders, setFilteredReminders] = useState([]);
    const [titleSearched, setTitleSearched] = useState("");
	const [activeRemindersEmpty, setActiveRemindersEmpty] = useState(true);

	var completedComputationInProgress = false;

    const textValues = ["Delete", "Are you sure?", "Deleting..."];
	var isExecuting = false;
	const confirmIconClass = `fa fa-${isExecuting ? "circle-o-notch fa-spin" : "fa fa-trash"}`;

    async function getAllReminders() {
		try {
            const myHeaders = new Headers();
            myHeaders.append("token", localStorage.token);
            myHeaders.append("refreshToken", localStorage.refreshToken);

			const response = await fetch("/api/dashboard/reminder/all", {
				method: "GET",
				headers: myHeaders
			});
			const parseResp = await response.json();

			// Determining if there is at least one active reminder:
			const reminderLength = parseResp.length;
			let i = 0;
			while (i < reminderLength) {
				if (!parseResp[i].reminder_completed) {
					setActiveRemindersEmpty(false);
					break
				}
				i++;
			}
			// Finished checking to see if there is at least one active reminder.
            
            setAllReminders(parseResp);
            setFilteredReminders(parseResp);
            
		} catch (error) {
			console.error(error.message);
		}
	}

    async function searchForReminders(e) {
        e.preventDefault();
        try {
            if (e.target.value === '') {
                setFilteredReminders(allReminders);
            } else {
                const myHeaders = new Headers();
                myHeaders.append("token", localStorage.token);
                myHeaders.append("refreshToken", localStorage.refreshToken);
                
                const response = await fetch(`/api/dashboard/search/?title=${titleSearched}`, {
                    method: "GET",
                    headers: myHeaders
                });
                const parseResp = await response.json();

                if (response.status === 200) {
                    setFilteredReminders(parseResp);
                }
            }

        } catch (error) {
            console.error(error.message);
        }
    }

	// Action when reminder Delete button is clicked.
    async function deleteReminderTask(reminder_id) {
		try {
            const myHeaders = new Headers();
            myHeaders.append("token", localStorage.token);
            myHeaders.append("refreshToken", localStorage.refreshToken);
            
			// eslint-disable-next-line
			const respActiveReminders = await fetch(
				`/api/dashboard/reminder/active/${reminder_id}`,
				{
					method: "DELETE",
					headers: myHeaders
				}
			);

			// eslint-disable-next-line
			const respCompletedReminders = await fetch(
				`/api/dashboard/reminder/completed/${reminder_id}`,
				{
					method: "DELETE",
					headers: myHeaders
				}
			);

			// eslint-disable-next-line
			const respOverdueReminders = await fetch(
				`/api/dashboard/reminder/overdue/${reminder_id}`,
				{
					method: "DELETE",
					headers: myHeaders
				}
			);

			// eslint-disable-next-line
			const respAllReminders = await fetch(
				`/api/dashboard/reminder/all/${reminder_id}`,
				{
					method: "DELETE",
					headers: myHeaders
				}
            );
            
            // Updating the filtered search result:
            setFilteredReminders(
                filteredReminders.filter((reminder) => reminder.reminder_id !== reminder_id)
            );

		} catch (error) {
			console.error(error.message);
		}
    }
    
	// Action when Completed checkbox is clicked.
    async function reminderCompletedStateHelper(reminder_id, reminder_completed) {
		
		/* Preventative flag so if a user quickly clicks on the completed box, before the 
		 * computation finishes, the requests reach the database and the second request
		 * fails because it doesn't have the proper data anymore.
		 */
		if (!completedComputationInProgress) {
			completedComputationInProgress = true;

			await ReminderCompletedState(reminder_id, reminder_completed, activeRemindersEmpty);

			// Reloading is necessary because the Edit component will not have the
			// same state without a rerender.
			window.location = "/Dashboard/Search";
		}
	}

    async function activeInput(e) {
        try {
            setTitleSearched(e.target.value);
            searchForReminders(e);

        } catch (error) {
            console.error(error.message);
        }
    }

    useEffect(() => {
		getAllReminders();
		
		return () => {
			setAllReminders([]);
			setFilteredReminders([]);
		}
    }, []);


    return (
        <Fragment>
            <div className="search-container">
                <div className="search-top-component" onClick={isAuth} onMouseEnter={isAuth}>
                    <form className="d-flex" onSubmit={searchForReminders}>
                        <input 
                            type="search" 
                            name="title" 
                            placeholder="Enter a reminder title" 
                            className="form-control search"
                            value={titleSearched}
                            onChange={e => activeInput(e)}
							autoFocus
                        />

                        <div className="search-btn-on-search" onClick={searchForReminders}>
                            <i className="fas fa-search" type="submit" />
                        </div>        
                    </form>
                </div>

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
                            {filteredReminders.map((currReminder) => (
                                <tr key={currReminder.reminder_id}>
                                    <td onClick={isAuth} >
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
											redirectTo="/Dashboard/Search" 
											activeRemindersEmpty={activeRemindersEmpty}
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
					{filteredReminders.length === 0 && 
						<p className="no-data-available-msg">No results found.</p>
					}
                </div>

            </div>
        </Fragment>
    )
}

export default Search

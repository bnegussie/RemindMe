import React from 'react'
import { Fragment } from 'react'

function HowItWorks() {
    return (
        <Fragment>
            <div className="info-container">
                <h1>How It Works</h1>
                <div className="info-message">
                    <p>
                        This web application is utilizing the scientific discovery that through 
                        timely iterations, individuals are able to move ideas from their short
                        term memory to their long term memory, to ensure that you never forget
                        your tasks.
                    </p>
                    <p>
                        This web application consists of two reminder features. The first reminder feature is 
                        the one you specify when you create a new reminder task and the second reminder
                        feature is a daily general reminder, where it lists all of your tasks for the
                        upcoming week. Both of these reminders will be sent via email and text message
                        (if you provided a phone number).
                    </p>
                    <p>
                        This web application also tracks the state of your reminder tasks in three 
                        categories (Active, Overdue, and Completed) to hold you accountable and to
                        give you that extra push to finish what you started.
                    </p>
                    <p>
                        With that being said, sign up for a free account and let us worry about your
                        upcoming tasks, so you can keep moving forward and keep making the most out
                        of this day!
                    </p>
                    <br/><br/>
                    <p id="info-subtitle">Terms and Conditions:</p>
                    <p>
                        The RemindMe text message feature is free of charge, but this application does
                        not take any financial responsibility for any additional charges you may receive
                        from your wireless provider.
                    </p>
                    <p>
                        If you are traveling abroad and text messages are not free, with your wireless
                        provider, please go to your Manage Profile page and remove your cell phone number.
                        Once you have returned from your trip, feel free to add your cell phone number
                        back so you can receive the full benefit of this reminder application.
                    </p>
                </div>
            </div>
        </Fragment>
    )
}

export default HowItWorks

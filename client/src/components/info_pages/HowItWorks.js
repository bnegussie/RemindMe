import React from 'react'
import { Fragment } from 'react'

function HowItWorks() {
    return (
        <Fragment>
            <div className="info-container">
                <h1>How It Works</h1>
                <div className="info-message">
                    <p>
                        As we all know, the more times we see something, the easier it is to remember. 
                        So we have built in two reminder features to not only remind you about specific
                        tasks, but to frequently send you reminders about your upcoming tasks so you always 
                        stay ahead.
                    </p>
                    <p>
                        Our first reminder feature is the built in reminder, when you create or edit 
                        a reminder task; at the time, which you have specified, our system will send
                        you an email and a text message (if you provided a phone number) with all of
                        the reminder details.
                    </p>
                    <p>
                        Our second reminder feature is a daily general reminder, where it lists 
                        all of your tasks for the upcoming week. This reminder will be sent via
                        email and text message (if you provided a phone number).
                    </p>
                    <br/>
                    <p>
                        We hope you enjoy our service!
                    </p>
                </div>
            </div>
        </Fragment>
    )
}

export default HowItWorks

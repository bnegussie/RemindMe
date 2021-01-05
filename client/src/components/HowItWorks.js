import React from 'react'
import { Fragment } from 'react'

function HowItWorks() {
    return (
        <Fragment>
            <div className="info-container">
                <h1>How It Works</h1>
                <div className="info-message">
                    <p>
                        As we all know, the more you see something, the easier it is to remember. 
                        So we have built in two reminder features so you never forget the big or small 
                        tasks in your day.
                    </p>
                    <p>
                        The first reminder feature is the one which you specify, when creating a reminder task.
                        When that time arrives, our system will send you an email and a text message
                        (if you provided a phone number) with all of the reminder details.
                    </p>
                    <p>
                        Our second reminder feature is a daily general reminder, where it lists 
                        all of your tasks for the upcoming week. This again will
                        be send via email and text message (if you provided a phone number).
                    </p>
                    <br/>
                    <p>
                        We hope you enjoy our service and feel free to reach out to us if you
                        have any questions or concerns.
                    </p>
                </div>
            </div>
        </Fragment>
    )
}

export default HowItWorks

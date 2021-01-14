import React, { Fragment } from 'react'
import "./../../App.css"

function AboutUs() {
    return (
        <Fragment>
            <div className="info-container">
                <h1>About Us</h1>
                <div className="info-message">
                    <p>
                        We understand the domino effect is real. This is why we created this web application
                        to make the domino effect work in your favor. From the small tasks in the 
                        day, like remembering to follow up with a specific client, to the big things, like
                        submitting the monthly expense report. Whatever the task is, we have your back.
                    </p>
                    <p>
                        Our reminder application will send you email and text message reminders, based on 
                        your upcomming tasks, so you always stay ahead.
                    </p>
                    <br/><br/>
                    <p id="info-subtitle">Image credit:</p>
                    <p>
                            The landing page photo was taken by Mr.Mockup. To check out more works
                        from him, simply checkout his Dribbble page: (https://dribbble.com/mrmockup).
                    </p>
                </div>
            </div>
        </Fragment>
    )
}

export default AboutUs

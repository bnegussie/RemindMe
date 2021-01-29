import React, { Fragment } from 'react'
import "./../../App.css"

function AboutUs() {
    return (
        <Fragment>
            <div className="info-container">
                <h1>About Us</h1>
                <div className="info-message">
                    <p>
                        The domino effect is real, but with the help of this web application you can make
                        the domino effect work in your favor. RemindMe is a simple, but powerful reminder 
                        web application. It will not only remind you about your specific tasks, but it will
                        keep you prepared for the days ahead.
                    </p>
                    <p>
                        From the small tasks in your day, like remembering to follow up with a specific
                        client, to the big tasks, like submitting the monthly expense report. Whatever
                        the task is, this application will help you stay ahead of your every task.
                    </p>
                    <p>
                        So let us worry about your upcoming tasks. Simply sign up for a free account                        
                        so you can keep moving forward and keep making the most out of this day!
                    </p>
                    <br/><br/>
                    <p id="info-subtitle">Image credit:</p>
                    <p>
                        The landing page photo was taken by Mr.Mockup. To check out more works
                        from him, simply checkout his

                        <a href="https://dribbble.com/mrmockup" id="img-credit"> Dribbble page.</a>
                    </p>
                </div>
            </div>
        </Fragment>
    )
}

export default AboutUs

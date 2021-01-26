import React from 'react'
import { Fragment } from 'react'

function FAQ() {
    return (
        <Fragment>
            <div className="info-container">
                <h1>Frequently Asked Questions</h1>
                <div className="faq-message">
                    <ul>
                        <li className="info-bulletin">
                            How come I am not receiving the text message reminders, even though
                            I have provided my cell phone carrier as well as my cell phone number?
                        </li>
                    </ul>
                    <p>
                        First go to your Manage Profile page and checking that you have selected the
                        correct cell phone carrier. There are several providers who use an almost
                        identical name and this may have caused you to select another provider.
                    </p>
                    <p>
                        If that is not the issue, then please also double check the cell phone 
                        number, which you have provided.
                    </p>
                    <p>
                        If none of these are the issue, and your cell phone carrier is listed on the 
                        Sign Up page, then please reach out to me and I will see what we can do for you.
                        Thank you.
                    </p>

                    <br/> <br/>

                    <ul>
                        <li className="info-bulletin">
                            What should I do if my cell phone carrier is not listed on the website,
                            but I really want to have this app send me text message reminders?
                        </li>
                    </ul>
                    <p>
                        Sorry for the inconvenience, but at this moment this application is working with
                        all of the wireless providers who have an email extension publically available
                        to be able to send text messages through an email account. 
                    </p>
                </div>
            </div>
        </Fragment>
    )
}

export default FAQ

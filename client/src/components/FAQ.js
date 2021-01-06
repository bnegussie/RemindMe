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
                        We would first suggest going to your Manage Profile page and checking that you 
                        have selected the correct cell phone carrier. We have several providers who use an
                        almost identical name and this usually trips people up.
                    </p>
                    <p>
                        If that is not the issue, then please also double check the cell phone 
                        number, which you have provided, to make sure it is correct.
                    </p>
                    <p>
                        If none of these are the issue, and your cell phone carrier is listed on our page,
                        then please reach out to us and we will see what we can do for you. Thank you.
                    </p>

                    <br/> <br/>

                    <ul>
                        <li className="info-bulletin">
                            What should I do if my cell phone carrier is not listed on the website,
                            but I really want to have this app send me text message reminders?
                        </li>
                    </ul>
                    <p>
                        In this case, we will not be able to do anything at this moment. Our current
                        text message feature is using all of the available cell phone carrier extensions,
                        to be able to send text messages through an email. We will work to keep our 
                        cell phone carrier list up to date. Sorry for the inconvenience.
                    </p>
                </div>
            </div>
        </Fragment>
    )
}

export default FAQ

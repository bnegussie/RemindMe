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
                            I have signed up for an account and created my first reminder,
                            but I still have not received the reminder email. Why is this happening?
                        </li>
                    </ul>
                    <p>
                        First please check your Spam folder and make sure the reminder has 
                        not been placed over there. It would be under the name: RemindMe.
                    </p>
                    <p>
                        If you find it in your Spam folder, please mark it as not-spam, for 
                        future cases. If you don't see it there, please log into your RemindMe
                        account and on the Manage Profile page, under the My Profile section, 
                        make sure you have correctly provided your email.
                    </p>
                    <p>
                        If none of these seem to help resolve the issue, please reach out to me 
                        so I can take a look into the issue. Thank you.
                    </p>

                    <br/> <br/>

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

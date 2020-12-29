import React, { Fragment } from 'react'
import "./../App.css"

function LandingPage() {
    return (
        <Fragment>
            <div className="landing-container">
                <div className="landing-page-message">
                    <h1 id="call-to-action">Never again</h1>
                    <p className="call-to-action-msg">
                        will you forget the big or small tasks in your day.
                    </p>
                    <p className="call-to-action-msg">
                        Get started with our free and elegant reminder application.
                    </p>
                </div>
            </div>
        </Fragment>
    )
}

export default LandingPage;

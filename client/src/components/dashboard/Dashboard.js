import React, { Fragment, useEffect } from "react";

import Reminders from "./reminders/Reminders"
import ScrollToTop from "./../ScrollToTop"

const Dashboard = ({ isAuth, isAuthenticated }) => {    

    useEffect(() => {
        isAuth()
    }, [isAuth]);

    if (!isAuthenticated) {
        window.location = "/";
    }

    return (
        <Fragment>
            <ScrollToTop />
            <Reminders isAuth={isAuth} isAuthenticated={isAuthenticated} />
        </Fragment>
    );
};

export default Dashboard;

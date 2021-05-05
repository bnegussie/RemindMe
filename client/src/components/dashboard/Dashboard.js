import React, { Fragment } from "react";

import Reminders from "./reminders/Reminders"
import ScrollToTop from "./../ScrollToTop"

const Dashboard = ({ isAuth, isAuthenticated }) => {    
    return (
        <Fragment>
            <ScrollToTop />
            <Reminders isAuth={isAuth} isAuthenticated={isAuthenticated} />
        </Fragment>
    );
};

export default Dashboard;

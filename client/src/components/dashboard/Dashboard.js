import React, { Fragment } from "react";

import Reminders from "./reminders/Reminders"
import ScrollToTop from "./../ScrollToTop"

const Dashboard = ({ isAuth }) => {    
    return (
        <Fragment>
            <ScrollToTop />
            <Reminders isAuth={isAuth} />
        </Fragment>
    );
};

export default Dashboard;

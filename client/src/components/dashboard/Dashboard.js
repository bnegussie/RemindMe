import React, { Fragment } from "react";

import Reminders from "./reminders/Reminders"
import ScrollToTop from "./../ScrollToTop"

const Dashboard = ({ setAuth }) => {    
    return (
        <Fragment>
            <ScrollToTop />
            <Reminders setAuth={setAuth} />
        </Fragment>
    );
};

export default Dashboard;

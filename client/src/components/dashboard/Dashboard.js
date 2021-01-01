import React, { Fragment } from "react";

import Reminders from "./reminders/Reminders"
import ScrollToTop from "./../ScrollToTop"

const Dashboard = () => {    
    return (
        <Fragment>
            <ScrollToTop />
            <Reminders />
        </Fragment>
    );
};

export default Dashboard;

import React, { Fragment, useState, useEffect } from "react";
import { toast } from 'react-toastify';

import Reminders from "./reminders/Reminders"

const Dashboard = ({ setAuth }) => {
    
    // eslint-disable-next-line
    const [f_name, setName] = useState("");

    async function getName() {
        try {
            const response = await fetch("http://localhost:5000/dashboard", {
                method: "GET",
                headers: {token: localStorage.token}
            });

            const parseResp = await response.json();

            console.log("***TESTING: Dashboard.js");
            console.log("parseResp = ", [parseResp]);

            if (response.status === 403) {
                toast.error(parseResp, {autoClose: 3000});
                return false;
            }
            
            setName(parseResp[0].user_f_name);

        } catch (error) {
            console.error(error.message);
        }
    }

    useEffect(() => {
        getName();
    }, []);
    
    return (
        <Fragment>
            <Reminders setAuth={setAuth} />
        </Fragment>
    );
};

export default Dashboard;

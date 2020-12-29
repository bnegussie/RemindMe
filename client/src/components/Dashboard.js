import React, { Fragment, useState, useEffect } from "react";
import { toast } from 'react-toastify';

const Dashboard = ({ setAuth }) => {
    
    const [f_name, setName] = useState("");

    async function getName() {
        try {
            const response = await fetch("http://localhost:5000/dashboard", {
                method: "GET",
                headers: {token: localStorage.token}
            });

            const parseResp = await response.json();

            if (response.status === 403) {
                toast.error(parseResp, {autoClose: 3000});
                return false;
            }
            
            setName(parseResp.user_f_name);

        } catch (error) {
            console.error(error.message);
        }
    }

    useEffect(() => {
        getName();
    }, []);
    
    return (
        <Fragment>
            <h2 className="text-center my-5">Welcome {f_name}!</h2>
        </Fragment>
    );
};

export default Dashboard;

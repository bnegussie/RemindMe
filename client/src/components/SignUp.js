import React, { Fragment, useState, useEffect } from "react";
import { toast } from 'react-toastify';
import Select from "react-select";

import "./../App.css"

const SignUp = ({ setAuth }) => {
    
    const [inputs, setInputs] = useState ({
        f_name: "",
        l_name: "",
        email: "",
        p_num: "",
        pwd: "",
        pwd_confirm: ""
    });
    const [cPhoneCarrier, setCPhoneCarrier] = useState("");
    const [cPhoneCarrierEmailExtn, setCPhoneCarrierEmailExtn] = useState("");
    // eslint-disable-next-line
    const [allCellphoneCarriers, setAllCellphoneCarriers] = useState([]);

    const { f_name, l_name, email, p_num, pwd, pwd_confirm } = inputs;

    const onChange = (e) => {
        setInputs({...inputs, [e.target.name] : e.target.value});
    };

    function setCellPhoneOption(e) {
        if (e) {
            setCPhoneCarrier(e.label);
            setCPhoneCarrierEmailExtn(e.value);
        } else {
            setCPhoneCarrier("");
            setCPhoneCarrierEmailExtn("");
        }
    }

    const onSubmit = async (e) => {
        e.preventDefault();

        try {
            /* As the user has upcoming reminders, within the following seven days, that user
             * will get daily reminders sent out at 6:00 am (default);
             *
             * The generalReminderTime is stored as a date so that the timezone, which the user is in,
             * can be properly stored so they can get alerted at their 6:00 am and not the UTC 6:00 am.
             */
            var generalReminderTime = new Date();
            generalReminderTime.setHours(6);
            generalReminderTime.setMinutes(0);
            generalReminderTime.setSeconds(0);
            generalReminderTime.setMilliseconds(0);

            
            const body = { f_name, l_name, email, cPhoneCarrier, cPhoneCarrierEmailExtn, 
                            p_num, pwd, generalReminderTime };

            // Quick input validation:
            // eslint-disable-next-line
            if (!email.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)) {
                toast.error("Please provide a valid email.", {autoClose: 3000});
                return false;
            } else if (pwd !== pwd_confirm) {
                toast.error("Passwords must match.", {autoClose: 3000});
                return false;
            } else if (pwd.length < 6) {
                return toast.error("Your password must be at least six characters long.", 
                            {autoClose: 4000});
            } else if ( (p_num && !p_num.match(/^\d{10}$/)) || (p_num === "" && cPhoneCarrier !== "") ) {

                toast.error("Please provide a valid phone number: 2065551234", {autoClose: 4000});
                return false;
            } else if (p_num !== "" && cPhoneCarrier === "") {
                toast.error("Please specify your Cell Phone Carrier.", {autoClose: 7500});
                toast.info("This information allows us to send users free reminder text messages.", 
                            {autoClose: 7500});
                return false;
            }
            
            const response = await fetch("/auth/register", {
                method: "POST",
                headers: {"Content-type": "application/json"},
                body: JSON.stringify(body)
            });
            
            // parseResp now holds the JWT unless the server threw an error:
            const parseResp = await response.json();

            if (response.status === 401 || response.status === 403) {
                toast.error(parseResp, {autoClose: 4000});
                return false;
            }

            localStorage.setItem("token", parseResp.token);
            setAuth(true);
            toast.success("Successful registration!", {
                autoClose: 3000
            });

        } catch (error) {
            console.error(error.message);
        }
    };

    // Getting all of the cell phone carriers and their email extension, so the app 
    // can send text messages to the users.
	useEffect(() => {
        getAllCellphoneCarriers();

        async function getAllCellphoneCarriers() {
            try {
                const response = await fetch("/dashboard/reminder/cellphone-carriers");
                const allCarriers = await response.json();
    
                allCarriers.forEach(function(currCarrier, index) {
                    allCellphoneCarriers.push({
                        "label": `${currCarrier.carrier_name}`,
                        "value": `${currCarrier.carrier_email_extension}`
                    })
                });
    
            } catch (error) {
                console.error(error.message);
            }
        }
    }, [allCellphoneCarriers]);
    
    
    return (
        <Fragment>
            <h1 className="text-center my-5">Sign Up</h1>

            <form onSubmit={e => onSubmit(e)}>
                <div className="form-group">
                    <input
                        type="text"
                        name="f_name"
                        id="f_name"
                        placeholder=" "
                        className="form-control"
                        value={f_name}
                        onChange={e => onChange(e)}
                        required
                        autoFocus
                    />
                    <label htmlFor="f_name" className="form-label">First name:</label>
                </div>

                <div className="form-group">
                    <input
                        type="text"
                        name="l_name"
                        id="l_name"
                        placeholder=" "
                        className="form-control"
                        value={l_name}
                        onChange={e => onChange(e)}
                        required
                    />
                    <label htmlFor="l_name" className="form-label">Last name:</label>
                </div>

                <div className="form-group">
                    <input
                        type="email"
                        name="email"
                        id="sign-up-email"
                        placeholder=" "
                        className="form-control"
                        value={email}
                        onChange={e => onChange(e)}
                        required
                    />
                    <label htmlFor="sign-up-email" className="form-label">Email:</label>
                </div>
            
                <div id="cellphone-container">
                    <div className="form-group">
                        <Select options={allCellphoneCarriers}
                            onChange={e => setCellPhoneOption(e)}
                            value={cPhoneCarrier.label}
                            placeholder=" "
                            id="sign-up-cell-phone-carrier"
                            className="cellphone-child-left"
                            isClearable
                        />

                        <label htmlFor="sign-up-cell-phone-carrier" 
                            className="form-label" 
                            id="cell-phone-carrier-label">
                            Cell phone carrier:
                        </label>
                    </div>

                    <div className="form-group">
                        <input 
                            type="tel"
                            name="p_num"
                            id="sign-up-p_num"
                            placeholder=" "
                            className="form-control cellphone-child"
                            value={p_num}
                            onChange={e => onChange(e)}
                        /> 
                        <label htmlFor="sign-up-p_num" className="form-label" id="sign-up-p_num-label">
                            Phone number (recommended):
                        </label>
                    </div>            
                </div>

                <div className="form-group">
                    <input
                        type="password"
                        name="pwd"
                        id="sign-up-pwd"
                        placeholder=" "
                        className="form-control"
                        value={pwd}
                        onChange={e => onChange(e)}
                        required
                    />
                    <label htmlFor="sign-up-pwd" className="form-label">Password:</label>
                </div>

                <div className="form-group">
                    <input
                        type="password"
                        name="pwd_confirm"
                        id="sign-up-pwd_confirm"
                        placeholder=" "
                        className="form-control"
                        value={pwd_confirm}
                        onChange={e => onChange(e)}
                        required
                    />
                    <label htmlFor="sign-up-pwd_confirm" className="form-label">Confirm password:</label>
                </div>         
                
                <button className="btn btn-success btn-block">Submit</button>
                <hr />
            </form>

        </Fragment>
    );
};

export default SignUp;

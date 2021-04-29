import React, { Fragment, useState, useEffect } from "react";
import { toast } from 'react-toastify';
import Select from "react-select";

import { ClearDateMinAndSecAndMill } from "./dashboard/reminders/ClearDate";
import PasswordToggle from "./PasswordToggle";

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
    const [allCellphoneCarriers, setAllCellphoneCarriers] = useState([]);

    var invalidAttemptsCounter = 0;

    const { f_name, l_name, email, p_num, pwd, pwd_confirm } = inputs;

    const [pwdInputType, pwdToggleIcon] = PasswordToggle();
    const [confirmPwdInputType, confirmPwdToggleIcon] = PasswordToggle();

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
            // Quick input validation:
            if (invalidAttemptsCounter >= 10) {
                // If this is a bot or a malicious user, refreshing the page
                // will slow them dowm from taking down the server.
                window.location = "/";
            }
            
            // Making sure the input fields are not empty or filled with empty spaces.
            if (f_name === "" || (f_name).replace(/\s/g, "") === "" || 
                l_name === "" || (l_name).replace(/\s/g, "") === "" ||
                pwd === "" || (pwd).replace(/\s/g, "") === "" ||
                pwd_confirm === "" || (pwd_confirm).replace(/\s/g, "") === "") {

                return toast.error("Please fill out all required input fields. (Empty spaces are not valid.)", 
                                    {autoClose: 4000});

                // eslint-disable-next-line
            } else if (!email.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)) {
                return toast.error("Please provide a valid email.", {autoClose: 3000});
                
            } else if (pwd !== pwd_confirm) {
                return toast.error("Passwords must match.", {autoClose: 3000});
                
            } else if (pwd.length < 6) {
                return toast.error("Your password must be at least six characters long.", 
                                    {autoClose: 4000});

            } else if ( (p_num && !p_num.match(/^\d{10}$/)) || (p_num === "" && cPhoneCarrier !== "") ) {

                return toast.error("Please provide a valid phone number: 2065551234", {autoClose: 4000});
                
            } else if (p_num !== "" && cPhoneCarrier === "") {
                toast.error("Please specify your Cell Phone Carrier.", {autoClose: 7500});
                toast.info("This information allows us to send users free reminder text messages.", 
                            {autoClose: 7500});
                return false;
            }
            // Finished input validation.



            /* As the user has upcoming reminders, within the following seven days, that user
             * will get daily reminders sent out at 6:00 am (default);
             *
             * The generalReminderTime is stored as a date so that the timezone, which the user is in,
             * can be properly stored so they can get alerted at their 6:00 am and not the UTC 6:00 am.
             */
            var generalReminderTime = new Date( ClearDateMinAndSecAndMill() );
            generalReminderTime.setHours(6);

            /* Making sure that the first General Daily Reminder, our new user gets, will be sent
             * out the day after they have signed up because the Ensure-GeneralReminder feature 
             * will immediately kick off a General Reminder at the next full hour.
             */
            generalReminderTime.setDate( generalReminderTime.getDate() + 1 );


            /* Capturing and saving the user's time zone because when their Specific Reminder
             * it sent out, if this information is not available, the user's Due Date and
             * Reminder Date will contain the database time zone.
             * 
             * Need to multiply by -1 because getTimezoneOffset() is calculating GMT's offset from
             * the user's time zone and not the user's time zone from GMT.
             * https://stackoverflow.com/a/1809974
             */
            const userTimeZone = (-1)*(new Date()).getTimezoneOffset()/60;


            
            const body = { f_name, l_name, email, cPhoneCarrier, cPhoneCarrierEmailExtn, 
                            p_num, pwd, generalReminderTime, userTimeZone };


            
            const response = await fetch("/api/auth/signup", {
                method: "POST",
                headers: {"Content-type": "application/json"},
                body: JSON.stringify(body)
            });
            
            // parseResp now holds the JWT unless the server threw an error:
            const parseResp = await response.json();

            if (parseResp === "A user with this email address already exists." || 
                parseResp === "A user with this phone number already exists.") {
                
                invalidAttemptsCounter++;
                return toast.error(parseResp, {autoClose: 4000});

            } else if (parseResp.message && parseResp.message === "Successful registration!") {

                // Sending welcome message:
                await fetch("/api/dashboard/welcome", {
                    method: "POST",
                    headers: {"Content-type": "application/json"},
                    body: JSON.stringify(body),
                    credentials: 'include'
                });

                setAuth(true);
                toast.success(parseResp.message, {autoClose: 3000});
            } else {
                invalidAttemptsCounter++;
                return toast.error(`Something went wrong: ${parseResp.message}`, {autoClose: 3000});
            }

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
                const response = await fetch("/api/dashboard/reminder/cellphone-carriers");
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

        return () => {
            setAllCellphoneCarriers([]);
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
                        autoCapitalize="on"
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
                        autoCapitalize="on"
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

                <fieldset className="cell-phone-fieldset">
                    <legend className="cell-phone-legend">
                        Optional, but recommended:
                    </legend>

                    <div id="cellphone-container">
                        <div className="form-group signup cell-phone-carrier">
                            <Select options={allCellphoneCarriers}
                                onChange={e => setCellPhoneOption(e)}
                                value={cPhoneCarrier.label}
                                placeholder=" "
                                id="sign-up-cell-phone-carrier"
                                className="cellphone-child-left"
                                isClearable
                            />

                            <label htmlFor="sign-up-cell-phone-carrier" 
                                className="form-label signup cell-phone-carrier" 
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
                            <label 
                                htmlFor="sign-up-p_num" 
                                className="form-label signup pNum" 
                                id="sign-up-p_num-label">

                                Phone number:
                            </label>
                        </div> 
                    </div>
                </fieldset>

                <div className="form-group">
                    <input
                        type={ pwdInputType }
                        name="pwd"
                        id="sign-up-pwd"
                        placeholder=" "
                        className="form-control"
                        value={pwd}
                        onChange={e => onChange(e)}
                        required
                    />
                    <label htmlFor="sign-up-pwd" className="form-label">Password:</label>
                    <span className="pwd-toggle-icon"> { pwdToggleIcon } </span>
                </div>

                <div className="form-group">
                    <input
                        type={ confirmPwdInputType }
                        name="pwd_confirm"
                        id="sign-up-pwd_confirm"
                        placeholder=" "
                        className="form-control"
                        value={pwd_confirm}
                        onChange={e => onChange(e)}
                        required
                    />
                    <label htmlFor="sign-up-pwd_confirm" className="form-label">Confirm password:</label>
                    <span className="pwd-toggle-icon"> { confirmPwdToggleIcon } </span>
                </div>         
                
                <button className="btn btn-success btn-block mb-4">Submit</button>
            </form>

        </Fragment>
    );
};

export default SignUp;

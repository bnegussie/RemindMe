import React, { Fragment, useState, useEffect } from "react";
import { toast } from 'react-toastify';
import Select from "react-select";

const Register = ({ setAuth }) => {
    
    const [inputs, setInputs] = useState ({
        f_name: "",
        l_name: "",
        email: "",
        p_num: "",
        pwd: "",
        pwd_confirm: ""
    });
    const [cellphoneCarrier, setCellphoneCarrier] = useState("");
    // eslint-disable-next-line
    const [allCellphoneCarriers, setAllCellphoneCarriers] = useState([]);

    const { f_name, l_name, email, p_num, pwd, pwd_confirm } = inputs;

    const onChange = (e) => {
        setInputs({...inputs, [e.target.name] : e.target.value});
    };

    const onSubmit = async (e) => {
        e.preventDefault();

        try {
            const body = { f_name, l_name, email, cellphoneCarrier, p_num, pwd, pwd_confirm };

            // Quick input validation:
            // eslint-disable-next-line
            if (!email.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)) {
                toast.error("Please provide a valid email.", {autoClose: 3000});
                return false;
            } else if (pwd !== pwd_confirm) {
                toast.error("Passwords must match.", {autoClose: 3000});
                return false;
            } else if ( (p_num && !p_num.match(/^\d{10}$/)) || (p_num === "" && cellphoneCarrier !== "") ) {

                toast.error("Please provide a valid phone number: 2065551234", {autoClose: 4000});
                return false;
            } else if (p_num !== "" && cellphoneCarrier === "") {
                toast.error("Please specify your Cellphone Carrier.", {autoClose: 7500});
                toast.info("This information allows us to send users free reminder text messages.", 
                            {autoClose: 7500});
                return false;
            }
            
            const response = await fetch("http://localhost:5000/auth/register", {
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

    // Getting all of the cellphone carriers and their email extension, so the app 
    // can send text messages to the users.
	useEffect(() => {
        getAllCellphoneCarriers();

        async function getAllCellphoneCarriers() {
            try {
                const response = await fetch("http://localhost:5000/dashboard/reminder/cellphone-carriers");
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
            <h2 className="text-center my-5">Sign Up</h2>

            <form onSubmit={e => onSubmit(e)}>
                <input
                    type="text"
                    name="f_name"
                    placeholder="First name"
                    className="form-control my-3"
                    value={f_name}
                    onChange={e => onChange(e)}
                    required
                />
                <input
                    type="text"
                    name="l_name"
                    placeholder="Last name"
                    className="form-control my-3"
                    value={l_name}
                    onChange={e => onChange(e)}
                    required
                />
                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    className="form-control my-3"
                    value={email}
                    onChange={e => onChange(e)}
                    required
                />
                <div id="cellphone-container">
                    <Select options={allCellphoneCarriers}
                            onChange={e => setCellphoneCarrier(e.value)}
                            value={cellphoneCarrier.label}
                            placeholder="Cellphone carrier"
                            className="my-3 cellphone-child"
                    />
                
                    <input 
                        type="tel"
                        name="p_num"
                        placeholder="Phone number (optional, but highly recommended)"
                        className="form-control my-3 cellphone-child"
                        value={p_num}
                        onChange={e => onChange(e)}
                    />                
                </div>
                
                <input
                    type="password"
                    name="pwd"
                    placeholder="Password"
                    className="form-control my-3"
                    value={pwd}
                    onChange={e => onChange(e)}
                    required
                />
                <input
                    type="password"
                    name="pwd_confirm"
                    placeholder="Confirm password"
                    className="form-control my-3"
                    value={pwd_confirm}
                    onChange={e => onChange(e)}
                    required
                />
                <button className="btn btn-success btn-block">Submit</button>
                <hr />
            </form>

        </Fragment>
    );
};

export default Register;

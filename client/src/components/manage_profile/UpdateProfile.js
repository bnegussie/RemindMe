import React, { Fragment, useEffect, useState } from "react";
import { toast } from "react-toastify";
import Select from "react-select"

import "./../../App.css"

function UpdateProfile() {
	const [fName, setFName] = useState("");
	const [lName, setLName] = useState("");
	const [email, setEmail] = useState("");
	const [cPhoneCarrier, setCPhoneCarrier] = useState("");
	const [cPhoneCarrierEmailExtn, setCPhoneCarrierEmailExtn] = useState("");
	const [pNum, setPNum] = useState("");

	// eslint-disable-next-line
    const [allCellphoneCarriers, setAllCellphoneCarriers] = useState([]);

	async function update(e) {
        e.preventDefault();

		try {
			const body = { fName, lName, email, cPhoneCarrier, cPhoneCarrierEmailExtn, pNum };

			// Quick input validation:
            // eslint-disable-next-line
            if (!email.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)) {
                toast.error("Please provide a valid email.", {autoClose: 3000});
                return false;
            } else if ( (pNum && !pNum.match(/^\d{10}$/)) || (pNum === "" && cPhoneCarrier !== "") ) {

                toast.error("Please provide a valid phone number: 2065551234", {autoClose: 4000});
                return false;
            } else if (pNum !== "" && cPhoneCarrier === "") {
                toast.error("Please specify your Cell Phone Carrier.", {autoClose: 7500});
                toast.info("This information allows us to send users free reminder text messages.", 
                            {autoClose: 7500});
                return false;
			}
			
			const putHeaders = new Headers();
			putHeaders.append("Content-type", "application/json");
			putHeaders.append("token", localStorage.token);

			const response = await fetch("http://localhost:5000/profile/general", {
                method: "PUT",
                headers: putHeaders,
                body: JSON.stringify(body)
            });
            
            // parseResp now holds the JWT unless the server threw an error:
			const parseResp = await response.json();

            if (response.status === 400) {
                toast.error(parseResp, {autoClose: 4000});
                return false;
            }

			toast.success("Successful profile update!", { autoClose: 3000 });

            window.location = "/ManageProfile";
		} catch (error) {
			console.error(error.message);
		}
	}

	async function getProfile() {
		try {
			const response = await fetch("http://localhost:5000/profile/general", {
				method: "GET",
				headers: {token: localStorage.token}
			});
			const profile = await response.json();
			
			setFName(profile.user_f_name);
			setLName(profile.user_l_name);
			setEmail(profile.user_email);
			setCPhoneCarrier(profile.user_cp_carrier);
			setCPhoneCarrierEmailExtn(profile.user_cp_carrier_email_extn)
			setPNum(profile.user_p_num);

		} catch (error) {
			console.error(error.message);
		}
	}

	function setCellPhoneOption(e) {
		setCPhoneCarrier(e.label);
		setCPhoneCarrierEmailExtn(e.value);
	}

	// Getting all of the cell phone carriers and their email extension, so the app 
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
	

	useEffect(() => {
		getProfile();
	}, []);

	

	return (
		<Fragment>
			<button
				type="button"
				className="btn btn-info manage-profile"
				data-toggle="modal"
				data-target="#update-profile-modal"
			>
				View
			</button>

			<div className="modal" id="update-profile-modal">
				<div className="modal-dialog">
					<div className="modal-content">
						<div className="modal-header">
							<h4 className="modal-title">Edit Profile</h4>
							<button 
								type="button" 
								className="close" 
								data-dismiss="modal"
								onClick={() => getProfile()} >
								&times;
							</button>
						</div>

                        <form onSubmit={(e) => update(e)}>
                            <div className="modal-body">
							
								<input
									type="text"
									name="fName"
									placeholder="First name"
									className="form-control my-3"
									value={fName}
									onChange={e => setFName(e.target.value)}
									required
								/>

								<input
									type="text"
									name="lName"
									placeholder="Last name"
									className="form-control my-3"
									value={lName}
									onChange={e => setLName(e.target.value)}
									required
								/>

								<input
									type="email"
									name="email"
									placeholder="Email"
									className="form-control my-3"
									value={email}
									onChange={e => setEmail(e.target.value)}
									required
								/>

								<div id="cellphone-container">
									<Select
										value={{label: cPhoneCarrier}}
										onChange={e => setCellPhoneOption(e)}
										options={allCellphoneCarriers}
										className="my-3 cellphone-child"
										placeholder="Cell phone carrier"
									/>
							
									<input 
										type="tel"
										name="pNum"
										placeholder="Phone number (optional, but highly recommended)"
										className="form-control my-3 cellphone-child"
										value={pNum}
										onChange={e => setPNum(e.target.value)}
									/>                
								</div>

                            </div>

                            <div className="modal-footer">
                                <input type="submit" value="Save" className="btn btn-success" />

                                <button 
                                    type="button" 
                                    className="btn btn-danger" 
                                    data-dismiss="modal"
                                    onClick={() => getProfile()} >
                                    Close
                                </button>
                            </div>
                        </form>
					</div>
				</div>
			</div>
		</Fragment>
	);
}

export default UpdateProfile;

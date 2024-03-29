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

    const [allCellphoneCarriers, setAllCellphoneCarriers] = useState([]);

	async function update(e) {
        e.preventDefault();

		try {
			// Quick input validation:
			if (fName === "" || (fName).replace(/\s/g, "") === "" || 
				lName === "" || (lName).replace(/\s/g, "") === "") {

				return toast.error("Please fill out all required input fields. (Empty spaces are not valid.)", 
									{autoClose: 4000});

				// eslint-disable-next-line
			} else if (!email.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)) {
                
				return toast.error("Please provide a valid email.", {autoClose: 3000});

            } else if ( (pNum && !pNum.match(/^\d{10}$/)) || (pNum === "" && cPhoneCarrier !== "") ) {

                return toast.error("Please provide a valid phone number: 2065551234", {autoClose: 4000});
                
            } else if (pNum !== "" && cPhoneCarrier === "") {
                toast.error("Please specify your Cell Phone Carrier.", {autoClose: 7500});
                toast.info("This information allows us to send users free reminder text messages.", 
                            {autoClose: 7500});
                return false;
			}
			// Finished input validation.


			const body = { fName, lName, email, cPhoneCarrier, cPhoneCarrierEmailExtn, pNum };

			const response = await fetch("/api/profile/general", {
                method: "PUT",
                headers: {"Content-type": "application/json"},
                body: JSON.stringify(body),
				credentials: 'include'
            });
            
            // parseResp now holds the JWT unless the server threw an error:
			const parseResp = await response.json();

			if (parseResp === "A user with this email address already exists." ||
				parseResp === "A user with this phone number already exists.") {
				
				return toast.error(parseResp, {autoClose: 4000});

			} else if (parseResp === "Your Profile has now been successfully update!") {
				
				toast.success(parseResp, {autoClose: 2000});
				setTimeout(() => { window.location = "/ManageProfile"; }, 2000);
				
			} else {
                return toast.error(`Something went wrong. Please try again later. ${parseResp}`);
			}
			
		} catch (error) {
			console.error(error.message);
		}
	}

	async function getProfile() {
		
		try {
			const response = await fetch("/api/profile/general", {
				method: "GET",
				credentials: 'include'
			});
			const profile = await response.json();
			
			setFName(profile.user_f_name);
			setLName(profile.user_l_name);
			setEmail(profile.user_email);
			setCPhoneCarrier(profile.user_cp_carrier);
			setCPhoneCarrierEmailExtn(profile.user_cp_carrier_email_extn);

			/* An odd behavior occurs if this check is not implemented here; what happens is 
			 * that if the user has not provided a phone number the DB ends up storing the value
			 * of the phone number as an empty string with ten spaces and this causes a UI issue.
			 */
			if (profile.user_cp_carrier === "") {
				setPNum("");
			} else {
				setPNum(profile.user_p_num);
			}

		} catch (error) {
			console.error(error.message);
		}
	}

	function setCellPhoneOption(e) {
		if (e) {
            setCPhoneCarrier(e.label);
            setCPhoneCarrierEmailExtn(e.value);
        } else {
            setCPhoneCarrier("");
            setCPhoneCarrierEmailExtn("");
        }
	}

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
	

	useEffect(() => {
		getProfile();

		return () => {
			setFName("");
			setLName("");
			setEmail("");
			setCPhoneCarrier("");
			setCPhoneCarrierEmailExtn("");
			setPNum("");
		}
	}, []);

	

	return (
		<Fragment>
			<button
				type="button"
				className="btn btn-info manage-profile view"
				data-toggle="modal"
				data-target="#update-profile-modal"
			>
				View
			</button>

			<div className="modal update-profile" id="update-profile-modal">
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
								<div className="form-group profile">
									<input
										type="text"
										name="fName"
										id="fName"
										placeholder=" "
										className="form-control"
										value={fName}
										onChange={e => setFName(e.target.value)}
										required
										autoCapitalize="on"
									/>
									<label htmlFor="fName" className="form-label update-profile">
										First name:
									</label>
								</div>
							
								<div className="form-group profile">
									<input
										type="text"
										name="lName"
										id="lName"
										placeholder=" "
										className="form-control"
										value={lName}
										onChange={e => setLName(e.target.value)}
										required
										autoCapitalize="on"
									/>
									<label htmlFor="lName" className="form-label update-profile">
										Last name:
									</label>
								</div>

								<div className="form-group profile">
									<input
										type="email"
										name="email"
										id="email"
										placeholder=" "
										className="form-control"
										value={email}
										onChange={e => setEmail(e.target.value)}
										required
									/>
									<label htmlFor="email" className="form-label update-profile">
										Email:
									</label>
								</div>
								
								<fieldset className="cell-phone-fieldset">
									<legend className="cell-phone-legend">
										Optional, but recommended:
									</legend>

									<div className="form-group profile">
										<Select
											value={cPhoneCarrier && {label: cPhoneCarrier}}
											onChange={e => setCellPhoneOption(e)}
											options={allCellphoneCarriers}
											className="cellphone-child-left"
											placeholder=" "
											id="update-profile-cell-phone-carrier"
											isClearable
										/>
										<label 
											htmlFor="update-profile-cell-phone-carrier" 
											className="form-label update-profile">

											Cell phone carrier:
										</label>
									</div>

									<div className="form-group profile">
										<input 
											type="tel"
											name="pNum"
											id="pNum"
											placeholder=" "
											className="form-control cellphone-child"
											value={pNum}
											onChange={e => setPNum(e.target.value)}
										/>
										<label 
											htmlFor="pNum" 
											className="form-label update-profile pNum">
											
											Phone number:
										</label>
									</div>
								</fieldset>
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

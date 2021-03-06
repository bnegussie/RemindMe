import React from "react";
import { Link } from "react-router-dom";

import "./../App.css";

function Footer({ isAuthenticated }) {
	if (isAuthenticated) {
		return null;
	}

	return (
		<div className="footer-container">
            <div className="footer-links">
                <Link to="/HowItWorks">How It Works</Link>
            </div>
        
            <div className="footer-links">
				<Link to="/AboutUs">About Us</Link>
			</div>
			
			<div className="footer-links">
				<Link to="/FAQ">FAQ</Link>
            </div>
            

			<Link to="#" className="footer-links" data-toggle="modal" data-target="#contact-us-modal" >
				Contact Us
			</Link>

			<div id="contact-us-modal" className="modal fade" role="dialog">
				<div className="modal-dialog">
					<div className="modal-content">
						<div className="modal-header">
                            <h4 className="modal-title">Contact Us</h4>
                            <button type="button" className="close" data-dismiss="modal">
								&times;
							</button>
							
						</div>
                        <div className="modal-body footer">
                            <p>Email: </p>
                            <p id="footer-email"> contactus.remindmeee@gmail.com</p>
						</div>
						<div className="modal-footer">
							<button type="button" className="btn btn-danger" data-dismiss="modal">
								Close
							</button>
						</div>
					</div>
				</div>
            </div>
            
		</div>
	);
}

export default Footer;

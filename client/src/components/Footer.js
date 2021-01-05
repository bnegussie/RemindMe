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
            

			<Link to="#" className="footer-links" data-toggle="modal" data-target="#myModal" >
				Contact Us
			</Link>

			<div id="myModal" className="modal fade" role="dialog">
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
                            <p id="footer-email"> brookninfo@gmail.com</p>
						</div>
						<div className="modal-footer">
							<button type="button" className="btn btn-default" data-dismiss="modal">
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

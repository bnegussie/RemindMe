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
				<Link to="/AboutUs">About Us</Link>
			</div>
			<Link to="#" className="footer-links" data-toggle="modal" data-target="#myModal" >
				Contact Us
			</Link>

			<div id="myModal" class="modal fade" role="dialog">
				<div class="modal-dialog">
					<div class="modal-content">
						<div class="modal-header">
                            <h4 class="modal-title footer">Contact Us</h4>
                            <button type="button" class="close" data-dismiss="modal">
								&times;
							</button>
							
						</div>
                        <div class="modal-body footer">
                            <p>Email: </p>
                            <p id="footer-email"> brookninfo@gmail.com</p>
						</div>
						<div class="modal-footer">
							<button type="button" class="btn btn-default" data-dismiss="modal">
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

import React from 'react'
import { Link } from "react-router-dom";

import "./../App.css"


function Footer({ isAuthenticated }) {

    if (isAuthenticated) {
        return null;
    }

    return (
        <div className="footer-container">
            <div className="footer-links">
                <Link to="/AboutUs">About Us</Link>
            </div>
            <div className="footer-links">
                <Link to="#">Contact Us</Link>
            </div>
        </div>
    )
}

export default Footer

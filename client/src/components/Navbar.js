import React, {Fragment, useState, useEffect} from 'react'
import {Link} from 'react-router-dom';

import {Button} from "./Button.js";
import DropDown from "./DropDown"

import "./../App.css";

const Navbar = ({ setAuth, isAuthenticated }) => {
    const [mobileMode, setMobileMode] = useState(false);
    const [button, setButton] = useState(true);
    const [dropDown, setDropDown] = useState(false);
    const [userName, setUserName] = useState("");
    
    const mModeToggle = () => { setMobileMode(!mobileMode) };
    const closeMobileMenu = () => { setMobileMode(false) };

    const showButton = () => {
        if (window.innerWidth <= 960) {
            setButton(false);
        } else {
            setButton(true);
            setMobileMode(false);
        }
    };

    const onMouseEnter = () => { setDropDown(true); };
    const onMouseLeave = () => { setDropDown(false); };

    useEffect(() => {
        showButton();
    }, []);

    // Getting the username to display on the navbar button:
    useEffect(() => {
        getUsername();

        async function getUsername() {
            if (isAuthenticated) {
                try {
                    const response = await fetch(
                        "http://localhost:5000/dashboard/user/username", {
                            method: "GET",
                            headers: {token: localStorage.token}
                    });
                    const parseResp = await response.json();
                    
                    // Making sure to display the user's name starting with an uppercase, just in
                    // case the user did not provide it in that fasion when they signed up.
                    const starterUsername = parseResp.user_f_name;
                    var finalUsername;
                    if (starterUsername.length > 1) {
                        finalUsername = starterUsername.charAt(0).toUpperCase() + starterUsername.slice(1);
                    } else {
                        finalUsername = starterUsername.charAt(0).toUpperCase();
                    }

                    setUserName(finalUsername);

                } catch (error) {
                    console.error(error.message);
                }
            } else {
                setUserName("");
            }
        }
    }, [isAuthenticated]);

    window.addEventListener("resize", showButton);

    if (isAuthenticated) {
        return (
            <Fragment>
                <nav className="navbar">
                    <div className="navbar-container">
                        <Link to="/dashboard" className="navbar-logo" onClick={closeMobileMenu}>
                            RemindMe <i className="fas fa-angle-double-right" />
                        </Link>
                        <div className="menu-icon" onClick={mModeToggle}>
                            <i className={mobileMode ? "fas fa-times" : "fas fa-bars"} />
                        </div>
                        <ul className={mobileMode ? "nav-menu active" : "nav-menu-logged-in"}>
                            <li className="nav-item">
                                <Link to="/dashboard" className="nav-links" onClick={closeMobileMenu}>Home</Link>
                            </li>
                            <li 
                                className="nav-item"
                                onMouseEnter={onMouseEnter}
                                onMouseLeave={onMouseLeave}
                            >
                                <Link to="#" className="nav-user-links">
                                    {userName} <i className="fas fa-caret-down" />
                                </Link>
                                {dropDown &&
                                    <DropDown 
                                        setAuth={setAuth} 
                                        onMouseLeave={onMouseLeave}
                                        closeMobileMenu={closeMobileMenu}    
                                    />
                                }
                            </li>
                        </ul>
                    </div>
                </nav>
            </Fragment>
        );
    }
    
    return (
        <Fragment>
            <nav className="navbar">
                <div className="navbar-container">
                    <Link to="/" className="navbar-logo" onClick={closeMobileMenu}>
                        RemindMe <i className="fas fa-angle-double-right" />
                    </Link>
                    <div className="menu-icon" onClick={mModeToggle}>
                        <i className={mobileMode ? "fas fa-times" : "fas fa-bars"} />
                    </div>
                    <ul className={mobileMode ? "nav-menu active" : "nav-menu"}>
                        <li className="nav-item">
                            <Link to="/AboutUs" className="nav-links" onClick={closeMobileMenu}>About Us</Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/register" className="nav-links" onClick={closeMobileMenu}>Sign Up</Link>
                        </li>
                        <li>
                            <Link to="/login" className="nav-links-mobile" onClick={closeMobileMenu}>LOG IN</Link>
                        </li>
                    </ul>
                    {button && <Button to="/login" buttonStyle="btn--outline">
                        LOG IN
                    </Button>
                    }
                </div>
            </nav>
        </Fragment>
    )
}

export default Navbar;

import React, {Fragment, useState, useEffect} from 'react'
import {Link} from 'react-router-dom';

import {Button} from "../Button.js";
import DropDown from "./DropDown"

import "./../../App.css";

const Navbar = ({ setAuth, isAuthenticated, isAuth }) => {
    const [mobileMode, setMobileMode] = useState(false);
    const [button, setButton] = useState(true);
    const [dropDown, setDropDown] = useState(false);
    const [userName, setUserName] = useState("");
    
    const mModeToggle = () => { 
        setMobileMode(!mobileMode) 
        isAuth();
    };
    const closeMobileMenu = () => { 
        setMobileMode(false);
        isAuth();
    };

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
        window.addEventListener("resize", showButton);
        
        return () => {
            window.removeEventListener("resize", showButton);
        }
    }, []);

    // Getting the username to display on the navbar button:
    useEffect(() => {
        async function getUsername() {
            if (isAuthenticated) {
                
                try {
                    const response = await fetch( "/api/dashboard/user/username", {
                            method: "GET",
                            credentials: 'include'
                    });
                    const parseResp = await response.json();

                    setUserName(parseResp.user_f_name);

                } catch (error) {
                    console.error(error.message);
                }
            } else {
                setUserName("");
            }
        }

        getUsername();

        return () => {
            setUserName("");
        }
    }, [isAuthenticated]);

    function checkIsAuth() {
        isAuth();
        closeMobileMenu();
    }

    if (isAuthenticated) {
        return (
            <Fragment>
                <nav className="navbar" onMouseEnter={isAuth}>
                    <div className="navbar-container">
                        <Link to="/Dashboard" className="navbar-logo" onClick={checkIsAuth}>
                            RemindMe <i className="fas fa-angle-double-right" />
                        </Link>
                        <div className="menu-icon" onClick={mModeToggle}>
                            <i className={mobileMode ? "fas fa-times" : "fas fa-bars"} />
                        </div>
                        <ul className={mobileMode ? "nav-menu active" : "nav-menu-logged-in"}>
                            <li className="nav-item">
                                <Link to="/Dashboard" className="nav-links" onClick={checkIsAuth}>Home</Link>
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
                            <Link to="/SignUp" className="nav-links" onClick={closeMobileMenu}>Sign Up</Link>
                        </li>
                        <li>
                            <Link to="/LogIn" className="nav-links-mobile" onClick={closeMobileMenu}>LOG IN</Link>
                        </li>
                    </ul>
                    {button && <Button to="/LogIn" buttonStyle="btn--outline">
                        LOG IN
                    </Button>
                    }
                </div>
            </nav>
        </Fragment>
    )
}

export default Navbar;

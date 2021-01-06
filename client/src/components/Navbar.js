import React, {Fragment, useState, useEffect} from 'react'
import {Link} from 'react-router-dom';
import {toast} from "react-toastify";

import {Button} from "./Button.js";
import DropDown from "./DropDown"

import "./../App.css";

const Navbar = ({ setAuth, isAuthenticated }) => {
    const [click, setClick] = useState(false);
    const [button, setButton] = useState(true);
    const [dropDown, setDropDown] = useState(false);
    
    const handleClick = () => { setClick(!click) };
    const closeMenu = () => { setClick(false) };

    const showButton = () => {
        if (window.innerWidth <= 960) {
            setButton(false);
        } else {
            setButton(true);
            setClick(false);
        }
    };

    const onMouseEnter = () => {
        if (window.innerWidth <= 960) {
            setDropDown(false);
        } else {
            setDropDown(true);
        }
    };

    const onMouseLeave = () => { setDropDown(false) };

    useEffect(() => {
        showButton();
    }, []);

    window.addEventListener("resize", showButton);

    // eslint-disable-next-line
    const logout = ((e) => {
        e.preventDefault();
        localStorage.removeItem("token");
        setAuth(false);
        closeMenu(false);
        toast.success("Successful logout.", {autoClose: 3000});
    });

    if (isAuthenticated) {
        return (
            <Fragment>
                <nav className="navbar">
                    <div className="navbar-container">
                        <Link to="/dashboard" className="navbar-logo" onClick={closeMenu}>
                            RemindMe <i className="fas fa-angle-double-right" />
                        </Link>
                        <div className="menu-icon" onClick={handleClick}>
                            <i className={click ? "fas fa-times" : "fas fa-bars"} />
                        </div>
                        <ul className={click ? "nav-menu active" : "nav-menu-logged-in"}>
                            <li className="nav-item">
                                <Link to="/dashboard" className="nav-links" onClick={closeMenu}>Home</Link>
                            </li>
                            <li 
                                className="nav-item"
                                onMouseEnter={onMouseEnter}
                                onMouseLeave={onMouseLeave}
                            >
                                <Link to="#" className="nav-user-links">
                                    Logout <i className="fas fa-caret-down" />
                                </Link>
                                {dropDown &&
                                    <DropDown setAuth={setAuth} />
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
                    <Link to="/" className="navbar-logo" onClick={closeMenu}>
                        RemindMe <i className="fas fa-angle-double-right" />
                    </Link>
                    <div className="menu-icon" onClick={handleClick}>
                        <i className={click ? "fas fa-times" : "fas fa-bars"} />
                    </div>
                    <ul className={click ? "nav-menu active" : "nav-menu"}>
                        <li className="nav-item">
                            <Link to="/AboutUs" className="nav-links" onClick={closeMenu}>About Us</Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/register" className="nav-links" onClick={closeMenu}>Sign Up</Link>
                        </li>
                        <li>
                            <Link to="/login" className="nav-links-mobile" onClick={closeMenu}>LOG IN</Link>
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

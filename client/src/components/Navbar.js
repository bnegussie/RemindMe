import React, {Fragment, useState, useEffect} from 'react'
import {Link} from 'react-router-dom';
import { useHistory } from "react-router-dom";
import {toast} from "react-toastify";

import {Button} from "./Button.js";
import "./../App.css";

const Navbar = ({ setAuth, isAuthenticated }) => {
    const [click, setClick] = useState(false);
    const [button, setButton] = useState(true);
    
    const handleClick = () => { setClick(!click) };
    const closeMenu = () => { setClick(false) };

    const showButton = () => {
        if (window.innerWidth <= 960) {
            setButton(false);
        } else {
            setButton(true);
        }
    };

    useEffect(() => {
        showButton();
    }, []);

    window.addEventListener("resize", showButton);

    const history = useHistory();

    const logout = ((e) => {
        e.preventDefault();
        localStorage.removeItem("token");
        setAuth(false);
        closeMenu(false);
        toast.success("Successful logout.", {autoClose: 3000});
    });
    
    return (
        <Fragment>
            <nav className="navbar">
                <div className="navbar-container">
                    {isAuthenticated ? 
                        (<Link to="/dashboard" className="navbar-logo" onClick={closeMenu}>
                            RemindMe <i className="fas fa-angle-double-right" />
                        </Link>
                        ) : (
                        <Link to="/" className="navbar-logo" onClick={closeMenu}>
                            RemindMe <i className="fas fa-angle-double-right" />
                        </Link>)
                    }
                    <div className="menu-icon" onClick={handleClick}>
                        <i className={click ? "fas fa-times" : "fas fa-bars"} />
                    </div>
                    <ul className={click ? "nav-menu active" : "nav-menu"}>
                        {isAuthenticated ?  (
                            <li className="nav-item">
                                <Link to="/dashboard" className="nav-links" onClick={closeMenu}>Home</Link>
                            </li>
                            ) : (null)
                        }
                        {isAuthenticated ? (null) : (
                            <li className="nav-item">
								<Link to="/AboutUs" className="nav-links" onClick={closeMenu}>About Us</Link>
                            </li>)
                        }
                        {isAuthenticated ? (null) : (
                            <li className="nav-item">
								<Link to="/register" className="nav-links" onClick={closeMenu}>Sign Up</Link>
                            </li>)
                        }
                        {isAuthenticated ? (
                            <li className="nav-item">
                                <Link className="nav-links" onClick={(e) => logout(e)}>Logout</Link>
                            </li>) : (null)
                        }

                        {isAuthenticated ? (null) : (
                            <li>
								<Link to="/login" className="nav-links-mobile" onClick={closeMenu}>LOG IN</Link>
                            </li>)
                        }
                    </ul>
                    {isAuthenticated ? (null) :
                        (button && <Button buttonStyle="btn--outline" onClick={() => history.push("/login")}>
                            LOG IN
                        </Button>)
                    }
                </div>
            </nav>
        </Fragment>
    )
}

export default Navbar;

import React, {useState} from 'react'
import { Fragment } from 'react'
import {Link} from "react-router-dom"
import {toast} from "react-toastify"
import { useHistory } from "react-router-dom"

import {MenuItems} from "./MenuItems.js"

import "./../../App.css"

function DropDown({setAuth, onMouseLeave, closeMobileMenu}) {

    const [dDownClicked, setDDownClicked] = useState(false);
    const dDownClickToggle = () => setDDownClicked(!dDownClicked);

    let history = useHistory();

    const logOut = ((e) => {
        e.preventDefault();
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("token");
        setAuth(false);
        history.push("/");
        setDDownClicked(false);
        onMouseLeave();
        closeMobileMenu();
        toast.success("You have successfully logged out.", {autoClose: 3000});
    });

    function dDownClickHandler() {
        setDDownClicked(false);
        closeMobileMenu();
    }

    return (
        <Fragment>
            <ul onClick={dDownClickToggle} className={dDownClicked ? 'drop-down-menu clicked' : 'drop-down-menu'}>
                {
                    MenuItems.map(function(item, index) {
                        return (
                            <li key={index}>
                                <Link 
                                    className={item.className} 
                                    to={item.path}
                                    onClick={item.path === '' ? (e) => logOut(e) : (e) => dDownClickHandler()}
                                >
                                    {item.title}
                                </Link>
                            </li>
                        )
                    })
                }
            </ul>
        </Fragment>
    )
}

export default DropDown

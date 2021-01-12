import React, {useState} from 'react'
import { Fragment } from 'react'
import {Link} from "react-router-dom"
import {toast} from "react-toastify"

import {MenuItems} from "./MenuItems.js"

import "./../../App.css"

function DropDown({setAuth, isAuth, onMouseLeave, closeMobileMenu}) {

    const [dDownClicked, setDDownClicked] = useState(false);
    const dDownClickToggle = () => setDDownClicked(!dDownClicked);

    const logout = ((e) => {
        e.preventDefault();
        localStorage.removeItem("token");
        setAuth(false);
        setDDownClicked(false);
        onMouseLeave();
        closeMobileMenu();
        toast.success("Successful logout.", {autoClose: 3000});
    });

    function dDownClickHandler() {
        setDDownClicked(false);
        closeMobileMenu();
        isAuth();
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
                                    onClick={item.path === '' ? (e) => logout(e) : (e) => dDownClickHandler()}
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

import React, {useState} from 'react'
import { Fragment } from 'react'
import {Link} from "react-router-dom"
import {toast} from "react-toastify"

import {MenuItems} from "./MenuItems.js"

import "./../App.css"

function DropDown({setAuth, onMouseLeave}) {

    const [click, setClick] = useState(false);
    const handleClick = () => setClick(!click);

    const logout = ((e) => {
        e.preventDefault();
        localStorage.removeItem("token");
        setAuth(false);
        setClick(false);
        onMouseLeave();
        toast.success("Successful logout.", {autoClose: 3000});
    });

    return (
        <Fragment>
            <ul onClick={handleClick} className={click ? 'drop-down-menu clicked' : 'drop-down-menu'}>
                {
                    MenuItems.map(function(item, index) {
                        return (
                            <li key={index}>
                                <Link 
                                    className={item.className} 
                                    to={item.path}
                                    onClick={item.path === '' ? (e) => logout(e) : (e) => setClick(false)}
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

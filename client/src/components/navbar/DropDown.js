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

    async function logOut(e) {
        e.preventDefault();

        try {
            setDDownClicked(false);
            onMouseLeave();
            closeMobileMenu();

            const response = await fetch("/api/auth/log-out", {
                method: "GET",
                credentials: 'include'
            });

            if (response.status !== 200) {
                const parseResp = await response.json();
                console.error("ERROR: parseResp = ", [parseResp]);
            }

        } catch (error) {
            console.error("error.message = ", [error.message]);

        } finally {
            setAuth(false);
            history.push("/"); 
            toast.success("You have successfully logged out.", {autoClose: 3000});
        }
    }

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

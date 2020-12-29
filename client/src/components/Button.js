import React from "react";
import {Link} from "react-router-dom";
import "./../App.css";


const STYLES = ["btn--primary", "btn--outline"];
const SIZES = ["btn--medium", "btn--large"];

export const Button = ({ children, type, onClick, buttonStyle, buttonSize }) => {
    const checkBtnStyle = STYLES.includes(buttonStyle) ? buttonStyle : STYLES[0];
    const checkBtnSize = SIZES.includes(buttonSize) ? buttonSize : SIZES[0];

    return (
        <Link className='btn-mobile'>
            <button className={`btn ${checkBtnStyle} ${checkBtnSize}`} onClick={onClick} type={type} >
                {children}
            </button>
        </Link>
    );
};

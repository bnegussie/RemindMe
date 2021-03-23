import React, { useState } from 'react';

function PasswordToggle() {
    
    const [visible, setVisible] = useState(false);
    const inputType = ( visible ? "text" : "password" );
    const toggleIcon = (  visible ? 
        <i className="fas fa-eye" onClick={ () => setVisible( !visible ) } /> 
        :  
        <i className="fas fa-eye-slash" onClick={ () => setVisible( !visible ) } /> 
    );
    

    return [inputType, toggleIcon];
}

export default PasswordToggle;

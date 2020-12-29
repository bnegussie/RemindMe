// Making sure the required textboxes are not empty and 
// that they provided a valid email address.

module.exports = (req, res, next) => {
    
    function validEmail(userEmail) {
        return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(userEmail);
    }
  
    if (req.path === "/register") {
        const {f_name, l_name, email, p_num, pwd} = req.body;

        if (![f_name, l_name, email, pwd].every(Boolean)) {
            return res.status(401).json("Missing required information.");
        } else if (!validEmail(email)) {
            return res.status(401).json("Invalid Email.");
        }
    } else if (req.path === "/login") {
        const {email, pwd} = req.body;

        if (![email, pwd].every(Boolean)) {
            return res.status(401).json("Missing required information.");
        } else if (!validEmail(email)) {
            return res.status(401).json("Invalid Email.");
        }
    }
  
    next();
  };

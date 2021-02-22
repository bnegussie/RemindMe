import React, { Fragment, useState, useEffect } from "react";
import './App.css';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect
} from "react-router-dom";

// Importing the components:
import Dashboard from "./components/dashboard/Dashboard";
import LogIn from "./components/LogIn";
import SignUp from "./components/SignUp";
import Navbar from "./components/navbar/Navbar";
import LandingPage from "./components/LandingPage";
import AboutUs from "./components/info_pages/AboutUs";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import HowItWorks from "./components/info_pages/HowItWorks"
import FAQ from "./components/info_pages/FAQ"
import ManageProfile from "./components/manage_profile/ManageProfile";
import Search from "./components/dashboard/reminders/Search";


toast.configure();

function App() {

  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const setAuth = boolean => {
    setIsAuthenticated(boolean);
  };

  const isAuth = async () => {
    try {
      const response = await fetch("/api/auth/is-Verified", {
        method: "GET",
        headers: {token: localStorage.token}
      });

      const parseResp = await response.json();

      if (response.status === 401 && parseResp === "Token is not valid.") {
        // The user is not logged in.
        setIsAuthenticated(false);
      } else {
        parseResp ? setIsAuthenticated(true) : setIsAuthenticated(false);
      }

      // Removing the JWT token; this is needed when the user's session has timed out.
      if (parseResp === "Token is not valid." && localStorage.token) {
        localStorage.removeItem("token");
        toast.info("Your session has expired. Please log back in.", {autoClose: 4000});
      }

    } catch (error) {
      console.error(error.message);
    }
  }

  useEffect(() => {
    isAuth();
  }, []);

  return (
    <Fragment>
      <Router>
        <ScrollToTop />
        <Navbar setAuth={setAuth} isAuthenticated={isAuthenticated} isAuth={isAuth} />
        <Switch>
          <Route exact path='/' />
        </Switch>
      
        <div className="container">
          <Switch>

            <Route 
              exact path="/" 
              render={props => 
                isAuthenticated ? (
                  <Redirect to="/Dashboard"/>
                ) : (
                  <LandingPage />
                )  
              }
            />

            <Route 
              exact path="/aboutus" 
              render={props => 
                isAuthenticated ? (
                  <Redirect to="/Dashboard"/>
                ) : (
                  <AboutUs />
                )  
              }
            />

            <Route 
              exact path="/howitworks" 
              render={props => 
                isAuthenticated ? (
                  <Redirect to="/Dashboard"/>
                ) : (
                  <HowItWorks />
                )  
              }
            />

            <Route 
              exact path="/faq" 
              render={props => 
                isAuthenticated ? (
                  <Redirect to="/Dashboard"/>
                ) : (
                  <FAQ />
                )  
              }
            />

            <Route
              exact path="/LogIn"
              render={props =>
                isAuthenticated ? (
                  <Redirect to="/Dashboard" />
                ) : (
                  <LogIn {...props} setAuth={setAuth} />
                )
              }
            />

            <Route 
              exact path="/SignUp" 
              render={props => 
                isAuthenticated ? (
                  <Redirect to="/Dashboard"/> 
                ) : (
                  <SignUp {...props} setAuth={setAuth} />
                )  
              }
            />

            <Route 
              exact path="/Dashboard/Search" 
              render={props => 
                isAuthenticated ? (
                  <Search {...props} isAuth={isAuth} isAuthenticated={isAuthenticated} />
                ) : (
                  <LandingPage />
                )  
              }
            />

            <Route 
              exact path="/Dashboard" 
              render={props => 
                isAuthenticated ? (
                  <Dashboard {...props} isAuth={isAuth} isAuthenticated={isAuthenticated} />
                ) : (
                  <LandingPage />
                )  
              }
            />

            <Route 
              exact path="/manageprofile" 
              render={props => 
                isAuthenticated ? (
                  <ManageProfile isAuth={isAuth} setAuth={setAuth} isAuthenticated={isAuthenticated} />
                ) : (
                  <LandingPage />
                )  
              }
            />

          </Switch>
        </div>

        <Footer isAuthenticated={isAuthenticated} />
      </Router>
    </Fragment>
  );
}

export default App;

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
import Login from "./components/Login";
import Register from "./components/Register";
import Navbar from "./components/Navbar";
import LandingPage from "./components/LandingPage";
import AboutUs from "./components/AboutUs";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import HowItWorks from "./components/HowItWorks"
import FAQ from "./components/FAQ"
import ManageProfile from "./components/ManageProfile";


toast.configure();

function App() {

  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const setAuth = boolean => {
    setIsAuthenticated(boolean);
  };

  const isAuth = async () => {
    try {
      const response = await fetch("http://localhost:5000/auth/is-Verified", {
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
        <Navbar setAuth={setAuth} isAuthenticated={isAuthenticated} />
        <Switch>
          <Route exact path='/' />
        </Switch>
      
        <div className="container">
          <Switch>

            <Route 
              exact path="/" 
              render={props => 
                isAuthenticated ? (
                  <Redirect to="/dashboard"/>
                ) : (
                  <LandingPage />
                )  
              }
            />

            <Route 
              exact path="/aboutus" 
              render={props => 
                isAuthenticated ? (
                  <Redirect to="/dashboard"/>
                ) : (
                  <AboutUs />
                )  
              }
            />

            <Route 
              exact path="/howitworks" 
              render={props => 
                isAuthenticated ? (
                  <Redirect to="/dashboard"/>
                ) : (
                  <HowItWorks />
                )  
              }
            />

            <Route 
              exact path="/faq" 
              render={props => 
                isAuthenticated ? (
                  <Redirect to="/dashboard"/>
                ) : (
                  <FAQ />
                )  
              }
            />

            <Route
              exact path="/login"
              render={props =>
                isAuthenticated ? (
                  <Redirect to="/dashboard" />
                ) : (
                  <Login {...props} setAuth={setAuth} />
                )
              }
            />

            <Route 
              exact path="/register" 
              render={props => 
                isAuthenticated ? (
                  <Redirect to="/dashboard"/> 
                ) : (
                  <Register {...props} setAuth={setAuth} />
                )  
              }
            />

            <Route 
              exact path="/dashboard" 
              render={props => 
                isAuthenticated ? (
                  <Dashboard {...props} />
                ) : (
                  <LandingPage />
                )  
              }
            />

            <Route 
              exact path="/manageprofile" 
              render={props => 
                isAuthenticated ? (
                  <ManageProfile />
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

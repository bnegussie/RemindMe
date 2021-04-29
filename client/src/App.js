import React, { Fragment, useState, useEffect } from "react";
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
import LogIn from "./components/Login";
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
import ResetPwd from "./components/ResetPwd";

import './App.css';


toast.configure();

function App() {

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // A lock to prevent a race condition:
  var checkAuthThreadLock = false;

  const setAuth = boolean => {
    setIsAuthenticated(boolean);
  };

  async function isAuth() {
    try {
      if (!checkAuthThreadLock) {
        checkAuthThreadLock = true;

        const response = await fetch("/api/auth/is-Verified", {
          method: "GET",
          credentials: 'include'
        });

        checkAuthThreadLock = false;

        const parseResp = await response.json();

        if (parseResp.message === "This is an authorized user.") {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      }

    } catch (error) {
      checkAuthThreadLock = false;
      setIsAuthenticated(false);

      console.error(error.message);
    }
  }

  useEffect(() => {
    isAuth();

    // eslint-disable-next-line
  }, []);


  if (isAuthenticated) {
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
              <Route exact path="/" render={props => <Redirect to="/Dashboard"/> } />

              <Route exact path="/aboutus" render={props => <Redirect to="/Dashboard"/> } />

              <Route exact path="/howitworks" render={props => <Redirect to="/Dashboard"/> } />

              <Route exact path="/faq" render={props => <Redirect to="/Dashboard"/> } />

              <Route exact path="/LogIn" render={props => <Redirect to="/Dashboard"/> } />

              <Route exact path="/SignUp" render={props => <Redirect to="/Dashboard"/> } />

              <Route exact path="/Dashboard/Search" render={props => <Search {...props} isAuth={isAuth} isAuthenticated={isAuthenticated} /> } />

              <Route exact path="/Dashboard" render={props => <Dashboard {...props} isAuth={isAuth} isAuthenticated={isAuthenticated} /> } />

              <Route exact path="/manageprofile" render={props => <ManageProfile isAuth={isAuth} isAuthenticated={isAuthenticated} /> } />

              <Route path="/ResetPassword/:id" render={props => <Redirect to="/Dashboard"/> } />

            </Switch>
          </div>
        </Router>
      </Fragment>
    )
  }

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
            <Route exact path="/" render={props => <LandingPage isAuth={isAuth} /> } />

            <Route exact path="/aboutus" render={props => <AboutUs /> } />

            <Route exact path="/howitworks" render={props => <HowItWorks /> } />

            <Route exact path="/faq" render={props => <FAQ /> } />

            <Route exact path="/LogIn" render={props => <LogIn {...props} setAuth={setAuth} isAuth={isAuth} /> } />

            <Route exact path="/SignUp" render={props => <SignUp {...props} setAuth={setAuth} /> } />

            <Route exact path="/Dashboard/Search" render={props => <LandingPage isAuth={isAuth} /> } />

            <Route exact path="/Dashboard" render={props => <LandingPage isAuth={isAuth} /> } />

            <Route exact path="/manageprofile" render={props => <LandingPage isAuth={isAuth} /> } />

            <Route path="/ResetPassword/:id" render={props => <ResetPwd /> } />

          </Switch>
        </div>

        <Footer isAuthenticated={isAuthenticated} />
      </Router>
    </Fragment>
  );
}

export default App;

import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Overview from "./components/Overview";
import Features from "./components/Features";
import Download from "./components/Download";
import Team from "./components/Team";
import Footer from "./components/Footer";
import ReportIssue from "./components/ReportIssue";

function App() {

  
  return (
    <Router>
      <div className="App">
        <Navbar />
        <main>
          <Routes>
            {/* Home route (show everything like before) */}
            <Route
              path="/"
              element={
                <>
                  <Hero />
                  <Overview />
                  {/* <Features />
                  <Download />
                  <ReportIssue /> */}
                  {/* <Team /> */}
                  
                </>
              }
            />

            {/* Individual routes for each section */}
            <Route path="/hero" element={<Hero />} />
            <Route path="/overview" element={<Overview />} />
            <Route path="/features" element={<Features />} />
            <Route path="/download" element={<Download />} />
            <Route path="/team" element={<Team />} />
            <Route path="/report-issue" element={<ReportIssue />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;

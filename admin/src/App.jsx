import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import "./styles/global.css";
import './App.css';
export default function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState({ name: 'Admin' });

    const handleLogin = (username) => {
        setUser({ name: username });
        setIsLoggedIn(true);
    };

    const handleLogout = () => {
        setIsLoggedIn(false);
        setUser({ name: '' });
    };

    return (
        <>
        
            <div className={`app-container ${isLoggedIn ? 'logged-in' : ''}`}>
                {isLoggedIn ? (
                    <Dashboard user={user} onLogout={handleLogout} />
                ) : (
                    <LoginPage onLogin={handleLogin} />
                )}
            </div>
        </>
    );
}
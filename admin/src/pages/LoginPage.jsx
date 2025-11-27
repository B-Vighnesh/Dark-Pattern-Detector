import { useState } from "react";
import "../styles/login.css";

export default function LoginPage({ onLogin }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!username || !password) return;

        try {
            const response = await fetch("http://localhost:8080/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username, password }),
            });

            if (response.ok) {
                const data = await response.json();
                const token = data.token;

                // Save token (you can also use sessionStorage if preferred)
                localStorage.setItem("token", token);

                // Notify parent component that login succeeded
                onLogin(username);

                setError(''); // Clear any previous errors
            } else {
                const errText = await response.text();
                setError(errText || "Login failed");
            }
        } catch (err) {
            console.error(err);
            setError("Network error. Please try again.");
        }
    };

    return (
        <div className="login-container">
            <div className="login-card glass-effect">
                <h1 className="login-title">Admin Access</h1>
                <p className="login-subtitle">Enter your credentials to manage the dashboard.</p>
                <form onSubmit={handleSubmit} className="login-form">
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button type="submit" className="login-button">Login</button>
                </form>
                {error && <p className="login-error">{error}</p>}
            </div>
        </div>
    );
}

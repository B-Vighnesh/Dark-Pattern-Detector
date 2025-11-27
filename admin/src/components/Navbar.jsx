import "../styles/dashboard.css";

export default function Navbar({ user, onLogout }) {
  return (
    <div className="navbar">
      <h2>⚡ Admin Dashboard</h2>
      <div className="navbar-user">
        <span>👤 {user.name}</span>
        <button className="danger" onClick={onLogout}>Logout</button>
      </div>
    </div>
  );
}

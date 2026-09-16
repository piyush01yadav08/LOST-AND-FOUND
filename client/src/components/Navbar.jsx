import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <Link to="/" className="logo">
        🔎 Smart Lost & Found
      </Link>

      <div className="nav-links">
        <Link to="/">Home</Link>

        {isAuthenticated && (
          <>
            <Link to="/items">Browse Items</Link>
            <Link to="/report">Report Item</Link>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/my-reports">My Reports</Link>
          </>
        )}

        {isAuthenticated ? (
          <>
            <span className="user-name">
              {user?.name}
            </span>

            <button onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
import { BrowserRouter, Routes, Route, Navigate, Link, } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ReportItem from "./pages/ReportItem";
import Items from "./pages/Items";
import ItemDetails from "./pages/ItemDetails";
import MyReports from "./pages/MyReports";
import EditItem from "./pages/EditItem";

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();

  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function Home() {
  return (
    <div className="home-page">
      <section className="hero-section">
        <div className="hero-content">
          <span className="hero-badge">
            🔎 Smart Lost & Found System
          </span>

          <h1>
            Lost Something?
            <br />
            <span>Let's Help You Find It.</span>
          </h1>

          <p>
            Report lost items, share found items, and connect
            with the right person through one simple platform.
          </p>

          <div className="hero-actions">
            <Link to="/report" className="hero-primary">
              Report an Item
            </Link>

            <Link to="/items" className="hero-secondary">
              Browse Items
            </Link>
          </div>
        </div>

        <div className="hero-visual">
          <div className="floating-card card-one">
            🔑
            <span>Lost Keys</span>
          </div>

          <div className="floating-card card-two">
            🎒
            <span>Found Bag</span>
          </div>

          <div className="hero-icon">
            🔍
          </div>
        </div>
      </section>

      <section className="features-section">
        <h2>How It Works</h2>

        <p className="section-subtitle">
          A simple process to report, search and recover items.
        </p>

        <div className="feature-grid">
          <div className="feature-card">
            <div className="feature-icon">📝</div>
            <h3>Report</h3>
            <p>
              Report a lost or found item with important
              details like location, category and date.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🔎</div>
            <h3>Search</h3>
            <p>
              Search and filter reported items to quickly
              find a possible match.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🤝</div>
            <h3>Claim</h3>
            <p>
              Submit a claim request and track its status
              through the reporting user.
            </p>
          </div>
        </div>
      </section>

      <section className="home-cta">
        <h2>Ready to find your item?</h2>

        <p>
          Start by browsing the latest lost and found reports.
        </p>

        <Link to="/items" className="hero-primary">
          Explore Items
        </Link>
      </section>
    </div>
  );
}

function AppRoutes() {
  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/report"
          element={
            <ProtectedRoute>
              <ReportItem />
            </ProtectedRoute>
          }
        />

        <Route
          path="/items"
          element={
            <ProtectedRoute>
              <Items />
            </ProtectedRoute>
          }
        />

        <Route
          path="/items/:id"
          element={
            <ProtectedRoute>
              <ItemDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-reports"
          element={
            <ProtectedRoute>
              <MyReports />
            </ProtectedRoute>
          }
        />

        <Route
          path="/edit-item/:id"
          element={
            <ProtectedRoute>
              <EditItem />
            </ProtectedRoute>
          }
        />

        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
      </Routes>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
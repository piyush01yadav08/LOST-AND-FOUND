import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Link,
} from "react-router-dom";

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


// HOME PAGE


function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="home-page">

      {/* ================= HERO ================= */}
      <section className="hero-section">

        <div className="hero-content">

          <span className="hero-badge">
            🔎 SMART LOST & FOUND PLATFORM
          </span>

          <h1>
            Lost Something?
            <br />
            <span>Let's Help You Find It.</span>
          </h1>

          <p>
            Search lost and found reports, discover possible matches,
            and reconnect people with their belongings through one
            simple platform.
          </p>

          <div className="hero-actions">

            <Link to="/items" className="primary-button">
              🔎 Browse Items
            </Link>

            {isAuthenticated ? (
              <Link to="/report" className="secondary-button">
                + Report an Item
              </Link>
            ) : (
              <Link to="/register" className="secondary-button">
                Create an Account
              </Link>
            )}

          </div>

          {!isAuthenticated && (
            <p className="hero-note">
              You can browse items without an account.
              Login is required to report or claim an item.
            </p>
          )}

        </div>


        {/* HERO VISUAL */}
        <div className="hero-visual">

          <div className="hero-orb">

            <div className="orb-icon">
              🔎
            </div>

            <div className="orb-ring ring-one"></div>
            <div className="orb-ring ring-two"></div>

          </div>


          <div className="floating-card card-one">
            <span>📱</span>
            <div>
              <strong>Lost Phone</strong>
              <small>Possible match found</small>
            </div>
          </div>


          <div className="floating-card card-two">
            <span>🎒</span>
            <div>
              <strong>Found Backpack</strong>
              <small>Reported nearby</small>
            </div>
          </div>


          <div className="floating-card card-three">
            <span>✓</span>
            <div>
              <strong>Item Recovered</strong>
              <small>Successfully returned</small>
            </div>
          </div>

        </div>

      </section>


      {/* ================= QUICK ACTIONS ================= */}
      <section className="quick-actions-section">

        <div className="quick-action-card">

          <div className="quick-action-icon">
            🔎
          </div>

          <div>
            <h3>Looking for an item?</h3>
            <p>
              Search through reported lost and found items.
            </p>
          </div>

          <Link to="/items" className="quick-action-link">
            Browse →
          </Link>

        </div>


        <div className="quick-action-card">

          <div className="quick-action-icon">
            📝
          </div>

          <div>
            <h3>Lost or found something?</h3>
            <p>
              Create a report and help reconnect it.
            </p>
          </div>

          <Link
            to={isAuthenticated ? "/report" : "/login"}
            className="quick-action-link"
          >
            {isAuthenticated ? "Report →" : "Login →"}
          </Link>

        </div>

      </section>


      {/* ================= HOW IT WORKS ================= */}
      <section className="home-section">

        <div className="section-heading">

          <span>HOW IT WORKS</span>

          <h2>
            From Lost to Found in Simple Steps
          </h2>

          <p>
            Everything you need to report, discover and recover
            lost belongings.
          </p>

        </div>


        <div className="feature-grid">

          <div className="feature-card">

            <div className="feature-number">
              01
            </div>

            <div className="feature-icon">
              📝
            </div>

            <h3>
              Report
            </h3>

            <p>
              Submit details about a lost or found item,
              including its location, category and description.
            </p>

          </div>


          <div className="feature-card">

            <div className="feature-number">
              02
            </div>

            <div className="feature-icon">
              🔎
            </div>

            <h3>
              Discover
            </h3>

            <p>
              Browse and search through reports using
              keywords, categories, locations and status.
            </p>

          </div>


          <div className="feature-card">

            <div className="feature-number">
              03
            </div>

            <div className="feature-icon">
              🤝
            </div>

            <h3>
              Claim
            </h3>

            <p>
              Found your belongings? Submit a claim request
              to the person who reported the found item.
            </p>

          </div>


          <div className="feature-card">

            <div className="feature-number">
              04
            </div>

            <div className="feature-icon">
              🔔
            </div>

            <h3>
              Reconnect
            </h3>

            <p>
              Receive smart notifications about possible
              matches and claim decisions.
            </p>

          </div>

        </div>

      </section>


      {/* ================= SMART MATCHING ================= */}
      <section className="matching-section">

        <div className="matching-visual">

          <div className="matching-circle">

            <div className="match-item match-lost">
              🔍
              <span>LOST</span>
            </div>

            <div className="match-line">
              ✦
            </div>

            <div className="match-item match-found">
              📦
              <span>FOUND</span>
            </div>

          </div>

        </div>


        <div className="matching-content">

          <span className="hero-badge">
            ✨ SMART MATCHING
          </span>

          <h2>
            Lost and Found Reports Can Find Each Other
          </h2>

          <p>
            Our matching system compares important item details
            such as category, location, title, description and
            date to identify possible Lost ↔ Found matches.
          </p>

          <div className="matching-points">

            <span>✓ Category matching</span>
            <span>✓ Location matching</span>
            <span>✓ Description matching</span>
            <span>✓ Date proximity</span>

          </div>

          <Link to="/items" className="primary-button">
            Explore Reports →
          </Link>

        </div>

      </section>


      {/* ================= FINAL CTA ================= */}
      <section className="cta-section">

        <div className="cta-content">

          <span className="hero-badge">
            GET STARTED
          </span>

          <h2>
            Help an Item Find Its Way Home.
          </h2>

          <p>
            Browse existing reports or create an account to
            report a lost or found item.
          </p>

          <div className="hero-actions">

            <Link to="/items" className="primary-button">
              🔎 Browse Items
            </Link>

            {isAuthenticated ? (
              <Link to="/report" className="secondary-button">
                + Report Item
              </Link>
            ) : (
              <Link to="/register" className="secondary-button">
                Create Account
              </Link>
            )}

          </div>

        </div>

      </section>

    </div>
  );
}


// ======================================================
// ROUTES
// ======================================================

function AppRoutes() {
  return (
    <>
      <Navbar />

      <Routes>

        {/* PUBLIC */}
        <Route path="/" element={<Home />} />

        <Route path="/items" element={<Items />} />

        <Route
          path="/items/:id"
          element={<ItemDetails />}
        />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />


        {/* PROTECTED */}
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

        {/* FALLBACK */}
        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />

      </Routes>
    </>
  );
}


// ======================================================
// APP
// ======================================================

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
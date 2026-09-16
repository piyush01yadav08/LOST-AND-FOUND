import { useEffect, useState } from "react";
import API from "../services/api";

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await API.get("/dashboard/stats");
        setStats(response.data);
      } catch (error) {
        console.error("Failed to load dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div className="page">Loading dashboard...</div>;
  }

  return (
    <div className="page">
      <div className="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p>Overview of the Lost & Found system.</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <span>Lost Items</span>
          <strong>{stats?.totalLostItems || 0}</strong>
        </div>

        <div className="stat-card">
          <span>Found Items</span>
          <strong>{stats?.totalFoundItems || 0}</strong>
        </div>

        <div className="stat-card">
          <span>Claimed Items</span>
          <strong>{stats?.claimedItems || 0}</strong>
        </div>

        <div className="stat-card">
          <span>Resolved Items</span>
          <strong>{stats?.resolvedItems || 0}</strong>
        </div>

        <div className="stat-card">
          <span>Active Reports</span>
          <strong>{stats?.activeReports || 0}</strong>
        </div>

        <div className="stat-card">
          <span>Pending Claims</span>
          <strong>{stats?.pendingClaims || 0}</strong>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

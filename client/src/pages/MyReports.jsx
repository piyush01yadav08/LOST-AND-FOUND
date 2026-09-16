import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";

function MyReports() {
  const [items, setItems] = useState([]);
  const [claims, setClaims] = useState({});
  const [claimsLoading, setClaimsLoading] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchReports = async () => {
    try {
      setLoading(true);

      const response = await API.get("/items/my-reports");

      setItems(response.data.items || response.data);
      setError("");
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to load your reports"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // Get claims for a particular item
  const fetchClaims = async (itemId) => {
    try {
      setClaimsLoading((prev) => ({
        ...prev,
        [itemId]: true,
      }));

      const response = await API.get(
        `/claims/item/${itemId}`
      );

      setClaims((prev) => ({
        ...prev,
        [itemId]: response.data.claims || response.data,
      }));

      setError("");
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to load claim requests"
      );
    } finally {
      setClaimsLoading((prev) => ({
        ...prev,
        [itemId]: false,
      }));
    }
  };

  // Delete report
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this report?"
    );

    if (!confirmed) return;

    try {
      await API.delete(`/items/${id}`);

      setItems((prevItems) =>
        prevItems.filter((item) => item._id !== id)
      );

      setSuccess("Report deleted successfully!");
      setError("");

      setTimeout(() => {
        setSuccess("");
      }, 2500);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to delete report"
      );
    }
  };

  // Update item status
  const handleStatusChange = async (id, status) => {
    try {
      const response = await API.put(`/items/${id}`, {
        status,
      });

      const updatedItem = response.data.item || response.data;

      setItems((prevItems) =>
        prevItems.map((item) =>
          item._id === id ? updatedItem : item
        )
      );

      setSuccess("Status updated successfully!");
      setError("");

      setTimeout(() => {
        setSuccess("");
      }, 2500);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to update status"
      );
    }
  };

  // Approve or reject claim
  const handleClaimAction = async (
    claimId,
    itemId,
    status
  ) => {
    try {
      await API.put(`/claims/${claimId}`, {
        status,
      });

      setSuccess(
        status === "Approved"
          ? "Claim approved successfully!"
          : "Claim rejected successfully!"
      );

      setError("");

      // Refresh claims for this item
      await fetchClaims(itemId);

      // Refresh reports because approved claim
      // changes the item status
      await fetchReports();

      setTimeout(() => {
        setSuccess("");
      }, 2500);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          `Failed to ${status.toLowerCase()} claim`
      );
    }
  };

  if (loading) {
    return (
      <div className="page">
        <h2>Loading your reports...</h2>
      </div>
    );
  }

  return (
    <div className="page">

      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1>My Reports</h1>
          <p>
            Manage the lost and found items you have
            reported.
          </p>
        </div>

        <Link
          to="/report"
          className="primary-button"
        >
          + Report Item
        </Link>
      </div>

      {/* Success Message */}
      {success && (
        <div className="success-message">
          {success}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* No Reports */}
      {items.length === 0 ? (
        <div className="empty-state">
          <h2>No reports yet</h2>

          <p>
            You haven't reported any lost or found
            items.
          </p>

          <Link
            to="/report"
            className="primary-button"
          >
            Report Your First Item
          </Link>
        </div>
      ) : (

        /* Reports */
        <div className="reports-list">

          {items.map((item) => (

            <div
              className="report-card"
              key={item._id}
            >

              {/* Image */}
              <div className="report-image">

                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.title}
                  />
                ) : (
                  <div className="report-placeholder">
                    {item.type === "Lost"
                      ? "🔍"
                      : "📦"}
                  </div>
                )}

              </div>

              {/* Content */}
              <div className="report-content">

                {/* Badges */}
                <div className="item-badges">

                  <span
                    className={
                      item.type === "Lost"
                        ? "badge lost"
                        : "badge found"
                    }
                  >
                    {item.type}
                  </span>

                  <span className="badge status">
                    {item.status}
                  </span>

                </div>

                {/* Title */}
                <h2>{item.title}</h2>

                {/* Description */}
                <p>{item.description}</p>

                {/* Information */}
                <div className="report-info">

                  <span>
                    <strong>Category:</strong>{" "}
                    {item.category}
                  </span>

                  <span>
                    <strong>Location:</strong>{" "}
                    {item.location}
                  </span>

                  <span>
                    <strong>Date:</strong>{" "}
                    {new Date(
                      item.date
                    ).toLocaleDateString()}
                  </span>

                </div>

                {/* Actions */}
                <div className="report-actions">

                  <Link
                    to={`/items/${item._id}`}
                    className="secondary-button"
                  >
                    View
                  </Link>

                  <Link
                    to={`/edit-item/${item._id}`}
                    className="secondary-button"
                  >
                    Edit
                  </Link>

                  <select
                    value={item.status}
                    onChange={(e) =>
                      handleStatusChange(
                        item._id,
                        e.target.value
                      )
                    }
                  >
                    <option value="Active">
                      Active
                    </option>

                    <option value="Claimed">
                      Claimed
                    </option>

                    <option value="Resolved">
                      Resolved
                    </option>
                  </select>

                  <button
                    className="danger-button"
                    onClick={() =>
                      handleDelete(item._id)
                    }
                  >
                    Delete
                  </button>

                </div>

                {/* Claim Section */}
                {item.type === "Found" && (
                  <div className="claims-section">

                    <div className="claims-header">

                      <h3>
                        Claim Requests
                      </h3>

                      <button
                        className="secondary-button"
                        onClick={() =>
                          fetchClaims(item._id)
                        }
                        disabled={
                          claimsLoading[item._id]
                        }
                      >
                        {claimsLoading[item._id]
                          ? "Loading..."
                          : claims[item._id]
                          ? "Refresh Claims"
                          : "View Claims"}
                      </button>

                    </div>

                    {/* Claims */}
                    {claims[item._id] && (
                      <div className="claims-list">

                        {claims[item._id].length ===
                        0 ? (
                          <p className="no-claims">
                            No claim requests yet.
                          </p>
                        ) : (
                          claims[item._id].map(
                            (claim) => (

                              <div
                                className="claim-card"
                                key={claim._id}
                              >

                                <div className="claim-header">

                                  <strong>
                                    {claim.claimant
                                      ?.name ||
                                      "Unknown User"}
                                  </strong>

                                  <span
                                    className={`claim-status ${claim.status.toLowerCase()}`}
                                  >
                                    {claim.status}
                                  </span>

                                </div>

                                <p>
                                  <strong>
                                    Email:
                                  </strong>{" "}
                                  {claim.claimant
                                    ?.email ||
                                    "Not available"}
                                </p>

                                <p>
                                  <strong>
                                    Message:
                                  </strong>{" "}
                                  {claim.message}
                                </p>

                                <p className="claim-date">
                                  Submitted:{" "}
                                  {new Date(
                                    claim.createdAt
                                  ).toLocaleString()}
                                </p>

                                {/* Approve / Reject */}
                                {claim.status ===
                                  "Pending" && (
                                  <div className="claim-actions">

                                    <button
                                      className="approve-button"
                                      onClick={() =>
                                        handleClaimAction(
                                          claim._id,
                                          item._id,
                                          "Approved"
                                        )
                                      }
                                    >
                                      ✓ Approve
                                    </button>

                                    <button
                                      className="reject-button"
                                      onClick={() =>
                                        handleClaimAction(
                                          claim._id,
                                          item._id,
                                          "Rejected"
                                        )
                                      }
                                    >
                                      ✕ Reject
                                    </button>

                                  </div>
                                )}

                              </div>

                            )
                          )
                        )}

                      </div>
                    )}

                  </div>
                )}

              </div>

            </div>

          ))}

        </div>
      )}

    </div>
  );
}

export default MyReports;
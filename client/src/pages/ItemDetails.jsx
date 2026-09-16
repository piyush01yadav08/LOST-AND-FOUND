import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";

function ItemDetails() {
  const { id } = useParams();
  const { user } = useAuth();

  const [item, setItem] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);

  const fetchItem = async () => {
    try {
      const response = await API.get(`/items/${id}`);
      setItem(response.data);
    } catch (error) {
      setError("Failed to load item");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItem();
  }, [id]);

  const handleClaim = async (e) => {
    e.preventDefault();

    if (!message.trim()) {
      setError("Please enter a claim message");
      return;
    }

    try {
      setClaiming(true);
      setError("");
      setSuccess("");

      await API.post("/claims", {
        itemId: id,
        message,
      });

      setSuccess("Claim request submitted successfully!");
      setMessage("");
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to submit claim"
      );
    } finally {
      setClaiming(false);
    }
  };

  if (loading) {
    return <div className="page">Loading item...</div>;
  }

  if (!item) {
    return <div className="page">Item not found.</div>;
  }

  const isOwner =
    user?.id === item.reportedBy?._id;

  const canClaim =
    item.type === "Found" &&
    item.status === "Active" &&
    !isOwner;

  return (
    <div className="page">
      <Link to="/items" className="back-link">
        ← Back to Items
      </Link>

      <div className="details-card">
        <div className="details-image">
          {item.image ? (
            <img
              src={item.image}
              alt={item.title}
            />
          ) : (
            <div className="large-placeholder">
              {item.type === "Lost" ? "🔍" : "📦"}
            </div>
          )}
        </div>

        <div className="details-content">
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

          <h1>{item.title}</h1>

          <p className="details-description">
            {item.description}
          </p>

          <div className="details-info">
            <p>
              <strong>Category:</strong>{" "}
              {item.category}
            </p>

            <p>
              <strong>Location:</strong>{" "}
              {item.location}
            </p>

            <p>
              <strong>Date:</strong>{" "}
              {new Date(item.date).toLocaleDateString()}
            </p>

            <p>
              <strong>Reported by:</strong>{" "}
              {item.reportedBy?.name}
            </p>
          </div>

          {success && (
            <div className="success-message">
              {success}
            </div>
          )}

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {canClaim && (
            <form
              className="claim-form"
              onSubmit={handleClaim}
            >
              <h3>Is this your item?</h3>

              <p>
                Submit a claim request to the person
                who reported this item.
              </p>

              <textarea
                placeholder="Explain why you believe this item belongs to you..."
                value={message}
                onChange={(e) =>
                  setMessage(e.target.value)
                }
                rows="4"
              />

              <button
                type="submit"
                disabled={claiming}
              >
                {claiming
                  ? "Submitting..."
                  : "Request Claim"}
              </button>
            </form>
          )}

          {item.type === "Lost" && (
            <div className="info-box">
              This is a lost item. If you found it,
              please contact the reporter.
            </div>
          )}

          {item.status !== "Active" && (
            <div className="info-box">
              This item is no longer available for
              new claims.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ItemDetails;
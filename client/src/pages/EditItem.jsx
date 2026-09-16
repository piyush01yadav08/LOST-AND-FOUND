import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import API from "../services/api";

function EditItem() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    type: "Lost",
    location: "",
    date: "",
    image: "",
    status: "Active",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const response = await API.get(`/items/${id}`);
        const item = response.data;

        setForm({
          title: item.title || "",
          description: item.description || "",
          category: item.category || "",
          type: item.type || "Lost",
          location: item.location || "",
          date: item.date
            ? new Date(item.date).toISOString().split("T")[0]
            : "",
          image: item.image || "",
          status: item.status || "Active",
        });
      } catch (error) {
        setError(
          error.response?.data?.message || "Failed to load item"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [id]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await API.put(`/items/${id}`, form);

      setSuccess("Item updated successfully!");

      setTimeout(() => {
        navigate("/my-reports");
      }, 1500);
    } catch (error) {
      setError(
        error.response?.data?.message || "Failed to update item"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="page">Loading item...</div>;
  }

  return (
    <div className="page">
      <Link to="/my-reports" className="back-link">
        ← Back to My Reports
      </Link>

      <div className="form-container">
        <h1>Edit Item</h1>
        <p>Update the details of your reported item.</p>

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

        <form onSubmit={handleSubmit} className="item-form">
          <label>Item Type</label>

          <select
            name="type"
            value={form.type}
            onChange={handleChange}
          >
            <option value="Lost">Lost</option>
            <option value="Found">Found</option>
          </select>

          <label>Title</label>

          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            required
          />

          <label>Category</label>

          <input
            type="text"
            name="category"
            value={form.category}
            onChange={handleChange}
            required
          />

          <label>Description</label>

          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows="5"
            required
          />

          <label>Location</label>

          <input
            type="text"
            name="location"
            value={form.location}
            onChange={handleChange}
            required
          />

          <label>Date</label>

          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            required
          />

          <label>Image URL (Optional)</label>

          <input
            type="text"
            name="image"
            value={form.image}
            onChange={handleChange}
            placeholder="https://example.com/image.jpg"
          />

          <label>Status</label>

          <select
            name="status"
            value={form.status}
            onChange={handleChange}
          >
            <option value="Active">Active</option>
            <option value="Claimed">Claimed</option>
            <option value="Resolved">Resolved</option>
          </select>

          <button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default EditItem;
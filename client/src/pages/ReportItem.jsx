import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function ReportItem() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    type: "Lost",
    location: "",
    date: "",
    image: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await API.post("/items", form);

      setSuccess("Item reported successfully!");

      setForm({
        title: "",
        description: "",
        category: "",
        type: "Lost",
        location: "",
        date: "",
        image: "",
      });

      setTimeout(() => {
        navigate("/");
     }, 2500);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to report item"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="form-container">
        <h1>Report an Item</h1>
        <p>
          Help reunite lost items with their owners.
        </p>

        {error && (
          <div className="error-message">{error}</div>
        )}

        {success && (
          <div className="success-message">{success}</div>
        )}

        <form
          className="item-form"
          onSubmit={handleSubmit}
        >
          <label>Item Type</label>

          <select
            name="type"
            value={form.type}
            onChange={handleChange}
          >
            <option value="Lost">I Lost This Item</option>
            <option value="Found">I Found This Item</option>
          </select>

          <label>Item Name / Title</label>

          <input
            type="text"
            name="title"
            placeholder="e.g. Black Wallet"
            value={form.title}
            onChange={handleChange}
            required
          />

          <label>Category</label>

          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            required
          >
            <option value="">Select Category</option>
            <option value="Electronics">Electronics</option>
            <option value="Documents">Documents</option>
            <option value="Accessories">Accessories</option>
            <option value="Clothing">Clothing</option>
            <option value="Bags">Bags</option>
            <option value="Keys">Keys</option>
            <option value="Other">Other</option>
          </select>

          <label>Description</label>

          <textarea
            name="description"
            placeholder="Describe the item..."
            value={form.description}
            onChange={handleChange}
            rows="5"
            required
          />

          <label>Location</label>

          <input
            type="text"
            name="location"
            placeholder="Where was it lost/found?"
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
            placeholder="Paste image URL"
            value={form.image}
            onChange={handleChange}
          />

          <button
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Submitting..."
              : "Report Item"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ReportItem;
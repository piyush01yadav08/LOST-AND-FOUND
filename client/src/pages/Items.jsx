import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";

function Items() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    search: "",
    type: "",
    category: "",
    location: "",
    status: "",
  });

  const fetchItems = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          params.append(key, value);
        }
      });

      const response = await API.get(
        `/items?${params.toString()}`
      );

      setItems(response.data.items);
    } catch (error) {
      console.error("Failed to load items:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchItems();
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      type: "",
      category: "",
      location: "",
      status: "",
    });

    setTimeout(() => {
      fetchItems();
    }, 0);
  };

  return (
    <div className="page">
      <div className="items-header">
        <div>
          <h1>Browse Lost & Found Items</h1>
          <p>
            Search for lost items or help someone find what
            they lost.
          </p>
        </div>
      </div>

      <form
        className="filter-box"
        onSubmit={handleSearch}
      >
        <input
          type="text"
          name="search"
          placeholder="Search by item name or keyword..."
          value={filters.search}
          onChange={handleChange}
        />

        <select
          name="type"
          value={filters.type}
          onChange={handleChange}
        >
          <option value="">All Types</option>
          <option value="Lost">Lost</option>
          <option value="Found">Found</option>
        </select>

        <select
          name="category"
          value={filters.category}
          onChange={handleChange}
        >
          <option value="">All Categories</option>
          <option value="Electronics">Electronics</option>
          <option value="Documents">Documents</option>
          <option value="Accessories">Accessories</option>
          <option value="Clothing">Clothing</option>
          <option value="Bags">Bags</option>
          <option value="Keys">Keys</option>
          <option value="Other">Other</option>
        </select>

        <input
          type="text"
          name="location"
          placeholder="Location..."
          value={filters.location}
          onChange={handleChange}
        />

        <select
          name="status"
          value={filters.status}
          onChange={handleChange}
        >
          <option value="">All Status</option>
          <option value="Active">Active</option>
          <option value="Claimed">Claimed</option>
          <option value="Resolved">Resolved</option>
        </select>

        <div className="filter-buttons">
          <button type="submit">Search</button>

          <button
            type="button"
            className="clear-btn"
            onClick={clearFilters}
          >
            Clear
          </button>
        </div>
      </form>

      {loading ? (
        <div className="empty-state">
          Loading items...
        </div>
      ) : items.length === 0 ? (
        <div className="empty-state">
          <h3>No items found</h3>
          <p>Try changing your search or filters.</p>
        </div>
      ) : (
        <div className="items-grid">
          {items.map((item) => (
            <div className="item-card" key={item._id}>
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.title}
                />
              ) : (
                <div className="item-placeholder">
                  {item.type === "Lost" ? "🔍" : "📦"}
                </div>
              )}

              <div className="item-card-content">
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

                <h3>{item.title}</h3>

                <p className="item-description">
                  {item.description}
                </p>

                <p>📍 {item.location}</p>

                <p>
                  📅{" "}
                  {new Date(item.date).toLocaleDateString()}
                </p>

                <Link
                  to={`/items/${item._id}`}
                  className="view-btn"
                >
                  View Details →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Items;
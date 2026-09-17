import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";

function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    try {
      const response = await API.get("/notifications");

      setNotifications(response.data.notifications || []);
      setUnreadCount(response.data.unreadCount || 0);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Check for new notifications periodically
    const interval = setInterval(() => {
      fetchNotifications();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const markAsRead = async (id) => {
    try {
      await API.put(`/notifications/${id}/read`);

      setNotifications((prev) =>
        prev.map((notification) =>
          notification._id === id
            ? { ...notification, isRead: true }
            : notification
        )
      );

      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await API.put("/notifications/read-all");

      setNotifications((prev) =>
        prev.map((notification) => ({
          ...notification,
          isRead: true,
        }))
      );

      setUnreadCount(0);
    } catch (error) {
      console.error(
        "Failed to mark notifications as read:",
        error
      );
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case "MATCH":
        return "🔎";

      case "CLAIM":
        return "🔔";

      case "CLAIM_APPROVED":
        return "✅";

      case "CLAIM_REJECTED":
        return "❌";

      default:
        return "🔔";
    }
  };

  return (
    <div className="notification-wrapper">
      <button
        className="notification-button"
        onClick={() => setOpen(!open)}
        aria-label="Notifications"
      >
        🔔

        {unreadCount > 0 && (
          <span className="notification-count">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="notification-dropdown">

          <div className="notification-header">
            <div>
              <h3>Notifications</h3>

              {unreadCount > 0 && (
                <span>
                  {unreadCount} unread
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                className="mark-all-button"
                onClick={markAllAsRead}
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="notification-list">

            {notifications.length === 0 ? (
              <div className="no-notifications">
                <div>🔕</div>
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.slice(0, 8).map(
                (notification) => (
                  <div
                    key={notification._id}
                    className={`notification-item ${
                      !notification.isRead
                        ? "unread"
                        : ""
                    }`}
                    onClick={() =>
                      !notification.isRead &&
                      markAsRead(notification._id)
                    }
                  >

                    <div className="notification-icon">
                      {getIcon(notification.type)}
                    </div>

                    <div className="notification-content">
                      <strong>
                        {notification.title}
                      </strong>

                      <p>
                        {notification.message}
                      </p>

                      <small>
                        {new Date(
                          notification.createdAt
                        ).toLocaleString()}
                      </small>
                    </div>

                    {!notification.isRead && (
                      <span className="unread-dot"></span>
                    )}

                    {notification.item && (
                      <Link
                        to={`/items/${notification.item._id}`}
                        className="notification-view"
                        onClick={(e) => {
                          e.stopPropagation();

                          if (!notification.isRead) {
                            markAsRead(notification._id);
                          }

                          setOpen(false);
                        }}
                      >
                        View
                      </Link>
                    )}

                  </div>
                )
              )
            )}

          </div>

          {notifications.length > 8 && (
            <Link
              to="/notifications"
              className="view-all-notifications"
              onClick={() => setOpen(false)}
            >
              View all notifications
            </Link>
          )}

        </div>
      )}
    </div>
  );
}

export default NotificationBell;

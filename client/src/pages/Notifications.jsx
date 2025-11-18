import { useNotifications } from "../context/NotificationContext";
import { Link } from "react-router-dom";
import { Bell, Check, Trash2 } from "lucide-react";
import { format } from "../utils/dateFormat";

const Notifications = () => {
  const { notifications, markAsRead, markAllAsRead, deleteNotification } =
    useNotifications();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold flex items-center">
            <Bell className="w-8 h-8 mr-2" />
            Notifications
          </h1>
          <button
            onClick={markAllAsRead}
            className="flex items-center space-x-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
          >
            <Check className="w-4 h-4" />
            <span>Mark all as read</span>
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md divide-y">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <div
                key={notification._id}
                className={`p-4 hover:bg-gray-50 transition ${
                  !notification.isRead ? "bg-blue-50" : ""
                }`}
              >
                <div className="flex items-start justify-between">
                  <Link
                    to={notification.link}
                    className="flex-1"
                    onClick={() =>
                      !notification.isRead && markAsRead(notification._id)
                    }
                  >
                    <div className="flex items-center space-x-3">
                      {notification.sender?.avatar ? (
                        <img
                          src={notification.sender.avatar}
                          alt={notification.sender.username}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                          {notification.sender?.username?.[0]?.toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="text-gray-900">{notification.message}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          {format(
                            new Date(notification.createdAt),
                            "MMM d, yyyy · HH:mm"
                          )}
                        </p>
                      </div>
                    </div>
                  </Link>
                  <button
                    onClick={() => deleteNotification(notification._id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No notifications yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;

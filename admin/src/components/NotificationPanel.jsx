import React, { useState, useEffect } from "react";
import {
  Badge,
  IconButton,
  Popover,
  List,
  ListItem,
  ListItemText,
  Typography,
  Menu,
  MenuItem,
  ListItemSecondaryAction,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import {
  initializeSocket,
  onNotification,
  disconnectSocket,
} from "../services/socketService";
import {
  onMessageListener,
  requestNotificationPermission,
} from "../services/notificationService";
import { MdBookmarkAdded, MdDeleteForever } from "react-icons/md";

const NotificationPanel = ({ userId }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedNotifId, setSelectedNotifId] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));

  const token = localStorage.getItem("token");

  const fetchNotifications = async () => {
    try {
      const res = await axios.get(`/api/notifications/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (Array.isArray(res.data)) {
        setNotifications(res.data);
        setUnreadCount(res.data.filter((n) => !n.isRead).length);
      } else {
        console.error("Unexpected response format:", res.data);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  const markAsRead = async (id) => {
    try {
      await axios.patch(
        `/api/notifications/${id}/read`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => prev - 1);
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await axios.delete(`/api/notifications/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      setUnreadCount((prev) =>
        prev - notifications.find((n) => n._id === id).isRead ? prev : prev - 1
      );
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };

  useEffect(() => {
    if (!userId) return;

    initializeSocket(userId);

    onNotification((data) => {
      const newNotif = {
        ...data,
        timestamp: new Date(),
        isRead: false,
        _id: data._id || `${Date.now()}-${Math.random()}`,
      };
      setNotifications((prev) => [newNotif, ...prev]);
      setUnreadCount((prev) => prev + 1);
      toast.info(`${data.title} - ${data.message}`, {
        position: isMobile ? "top-center" : "top-right",
      });
    });

    requestNotificationPermission(userId);

    onMessageListener().then((payload) => {
      const { title, body } = payload.notification;
      const newNotif = {
        title,
        message: body,
        timestamp: new Date(),
        isRead: false,
        _id: `${Date.now()}-${Math.random()}`,
      };
      setNotifications((prev) => [newNotif, ...prev]);
      setUnreadCount((prev) => prev + 1);
      toast.info(`${title}: ${body}`, {
        position: isMobile ? "top-center" : "top-right",
      });
    });

    fetchNotifications();

    return () => disconnectSocket();
  }, [userId, isMobile]);

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
    setUnreadCount(0);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMenuOpen = (event, notifId) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedNotifId(notifId);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedNotifId(null);
  };

  const handleNotifClick = (notifId) => {
    const notif = notifications.find((n) => n._id === notifId);
    if (!notif.isRead) {
      markAsRead(notifId);
    }
  };

  const open = Boolean(anchorEl);

  return (
    <div className="flex items-center justify-center">
      <IconButton onClick={handleOpen}>
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon className="text-2xl md:text-3xl" />
        </Badge>
      </IconButton>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{
          sx: {
            width: isMobile ? "90vw" : isTablet ? 300 : 350,
            maxHeight: isMobile ? "60vh" : 400,
            overflow: "auto",
          },
        }}
      >
        <List sx={{ padding: isMobile ? 1 : 2 }}>
          {Array.isArray(notifications) && notifications.length === 0 ? (
            <ListItem>
              <ListItemText
                primary="Không có thông báo!"
                primaryTypographyProps={{
                  className: isMobile ? "text-sm" : "text-base",
                }}
              />
            </ListItem>
          ) : (
            notifications.map((notif, index) => (
              <ListItem
                key={notif._id || index}
                divider
                onClick={() => handleNotifClick(notif._id)}
                sx={{
                  cursor: "pointer",
                  backgroundColor: notif.isRead
                    ? "inherit"
                    : "rgba(0, 0, 0, 0.04)",
                  "&:hover": {
                    backgroundColor: "rgba(0, 0, 0, 0.08)",
                  },
                  padding: isMobile ? "4px" : "6px",
                }}
              >
                <ListItemText
                  primary={notif.title || notif.name}
                  primaryTypographyProps={{
                    fontWeight: notif.isRead ? "normal" : "bold",
                    color: notif.isRead ? "text.secondary" : "text.primary",
                    className: isMobile ? "text-sm" : "text-base",
                  }}
                  secondary={
                    <>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: notif.isRead ? "normal" : "bold",
                          color: notif.isRead
                            ? "text.secondary"
                            : "text.primary",
                        }}
                        className={isMobile ? "text-xs" : "text-sm"}
                      >
                        {notif.message}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        className={isMobile ? "text-xs" : "text-sm"}
                      >
                        {new Date(notif.timestamp).toLocaleString()}
                      </Typography>
                    </>
                  }
                  secondaryTypographyProps={{ component: "div" }}
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    onClick={(e) => handleMenuOpen(e, notif._id)}
                    size={isMobile ? "small" : "medium"}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))
          )}
        </List>
      </Popover>
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem
          onClick={() => {
            markAsRead(selectedNotifId);
            handleMenuClose();
          }}
          disabled={
            notifications.find((n) => n._id === selectedNotifId)?.isRead
          }
          className={isMobile ? "text-sm" : "text-base"}
        >
          <MdBookmarkAdded className="text-lg mr-2" /> Đánh dấu là đã đọc
        </MenuItem>
        <MenuItem
          onClick={() => {
            deleteNotification(selectedNotifId);
            handleMenuClose();
          }}
          className={isMobile ? "text-sm" : "text-base"}
        >
          <MdDeleteForever className="text-lg mr-2" /> Xóa thông báo
        </MenuItem>
      </Menu>
      <ToastContainer
        position={isMobile ? "top-center" : "top-right"}
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        toastStyle={{
          fontSize: isMobile ? "14px" : "16px",
          padding: isMobile ? "8px" : "12px",
        }}
      />
    </div>
  );
};

export default NotificationPanel;

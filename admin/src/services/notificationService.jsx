import { messaging, getToken, onMessage } from "../firebase";

const VAPID_PUBLIC_KEY = "BGLq9gdlTjlpJdojvvRAHC0a0LzVtXXbCFdvvS1tXy_T53XWnyK9dSMbeA5pp1fgaCBcCDeEjSuxZeqN4SeUaEM";

export const requestNotificationPermission = async (userId) => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      const token = await getToken(messaging, {
        vapidKey: VAPID_PUBLIC_KEY,
      });

      console.log("FCM Token:", token);

      await fetch("https://apitaskmanager.pdteam.net/api/user/fcm-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ fcmToken: token }),
      });

      return token;
    } else {
      console.warn("Người dùng đã từ chối cấp quyền thông báo.");
    }
  } catch (error) {
    console.error("Lỗi khi lấy hoặc gửi FCM token:", error);
  }
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });

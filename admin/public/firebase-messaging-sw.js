// public/firebase-messaging-sw.js
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js");

// Khởi tạo Firebase app
firebase.initializeApp({
apiKey: "AIzaSyDZb5yKlepg6PJXR1ZXSkawLZsC0cKygcg",
  authDomain: "backend-api-5a7e6.firebaseapp.com",
  projectId: "backend-api-5a7e6",
  messagingSenderId: "868163805151",
  appId: "1:868163805151:web:b8ded0868ab1c939e3ee6a",
});

// Lấy Firebase Messaging
const messaging = firebase.messaging();

// Lắng nghe thông báo khi đang ở background
messaging.onBackgroundMessage(function (payload) {
  console.log("[firebase-messaging-sw.js] Received background message ", payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/icon.png", // nếu có
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

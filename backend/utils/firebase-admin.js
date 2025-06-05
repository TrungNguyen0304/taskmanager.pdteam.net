const admin = require("firebase-admin");

// Lấy biến môi trường FIREBASE_SERVICE_ACCOUNT_BASE64
const firebaseServiceAccountBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;

let serviceAccount;

// Kiểm tra xem biến môi trường có tồn tại không
if (!firebaseServiceAccountBase64) {
  console.error('Biến môi trường FIREBASE_SERVICE_ACCOUNT_BASE64 không được định nghĩa. Vui lòng kiểm tra cấu hình.');
  process.exit(1); // Dừng server nếu biến không tồn tại
}

try {
  const decodedJsonString = Buffer.from(firebaseServiceAccountBase64, 'base64').toString('utf8');

  serviceAccount = JSON.parse(decodedJsonString);
} catch (error) {
  console.error('Lỗi khi giải mã hoặc parse biến FIREBASE_SERVICE_ACCOUNT_BASE64:', error.message);
  process.exit(1);
}

// Khởi tạo Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Hàm gửi thông báo
const sendNotification = async (token, title, body) => {
  const message = {
    token,
    notification: {
      title,
      body
    }
  };

  try {
    const response = await admin.messaging().send(message);
    console.log(" Notification sent:", response);
  } catch (error) {
    console.error(" Error sending FCM notification:", error.message);
  }
};

module.exports = { sendNotification };
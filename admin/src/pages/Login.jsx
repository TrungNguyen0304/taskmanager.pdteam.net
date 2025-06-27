import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { requestNotificationPermission } from "../services/notificationService"; // Sửa path nếu cần

const Login = () => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    const user = JSON.parse(localStorage.getItem("user"));
    if (isLoggedIn === "true" && user) {
      if (user.role === "company") navigate("/", { replace: true });
      else if (user.role === "leader") navigate("/", { replace: true });
      else if (user.role === "member") navigate("/", { replace: true });
      navigate("/", { replace: true });
    }
  }, [navigate]);

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: Yup.object({
      email: Yup.string().email("Email không hợp lệ").required("Bắt buộc"),
      password: Yup.string().min(6, "Tối thiểu 6 ký tự").required("Bắt buộc"),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        // Đăng nhập
        const response = await fetch("https://apitaskmanager.pdteam.net/api/user/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Đăng nhập thất bại");

        const token = data.token;
        if (!token) throw new Error("Không nhận được token từ server.");

        // Lấy thông tin user
        const profileRes = await fetch(
          "https://apitaskmanager.pdteam.net/api/protected/profile",
          {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const profileData = await profileRes.json();
        if (!profileRes.ok) {
          throw new Error(
            profileData.message || "Lấy thông tin người dùng thất bại."
          );
        }

        const user = profileData.user;

        if (!["company", "leader", "member"].includes(user.role)) {
          throw new Error("Bạn không có quyền truy cập vào hệ thống.");
        }
        // Lưu thông tin vào localStorage

        // Lưu vào localStorage
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));

        // Gửi FCM Token tự động
        await requestNotificationPermission(user._id);

        if (user.role === "company") navigate("/", { replace: true });
        else if (user.role === "leader") navigate("/", { replace: true });
        else if (user.role === "member") navigate("/", { replace: true });
        // Chuyển trang
        navigate("/", { replace: true });
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-indigo-50 to-purple-50 p-4 sm:p-6 lg:p-8">
      <div className="relative w-full max-w-md">
        <div className="bg-white/80 backdrop-blur-sm p-6 sm:p-8 lg:p-10 rounded-2xl shadow-2xl border border-white/20">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
              Chào mừng trở lại
            </h2>
            <p className="text-gray-600 text-sm sm:text-base">
              Đăng nhập vào tài khoản của bạn
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
          )}

          <form onSubmit={formik.handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-700">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`w-full px-3 py-2 border ${
                  formik.touched.email && formik.errors.email
                    ? "border-red-400 focus:border-red-500"
                    : "border-gray-200 focus:border-blue-500"
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                placeholder="example@gmail.com"
              />
              {formik.touched.email && formik.errors.email && (
                <p className="text-red-500 text-sm mt-2 flex items-center">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {formik.errors.email}
                </p>
              )}
            </div>

            <div className="relative">
              <label className="block mb-2 text-sm font-semibold text-gray-700">
                Mật khẩu
              </label>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`w-full px-3 h-10 border ${
                  formik.touched.password && formik.errors.password
                    ? "border-red-400 focus:border-red-500"
                    : "border-gray-200 focus:border-blue-500"
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20 pr-12`}
                placeholder="Nhập mật khẩu"
                autoComplete="current-password"
              />
              <div
                className="absolute right-3 top-2/3 transform -translate-y-1/2 cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <FaEyeSlash className="text-gray-500" />
                ) : (
                  <FaEye className="text-gray-500" />
                )}
              </div>
              {formik.touched.password && formik.errors.password && (
                <p className="text-red-500 text-sm mt-2 flex items-center">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {formik.errors.password}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={formik.isSubmitting}
              className={`w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold text-sm sm:text-base transition-all duration-200 transform focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 ${
                formik.isSubmitting
                  ? "opacity-50 cursor-not-allowed hover:scale-100"
                  : "hover:shadow-lg active:scale-[0.98]"
              }`}
            >
              {formik.isSubmitting ? "Đang đăng nhập..." : "Đăng Nhập"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;

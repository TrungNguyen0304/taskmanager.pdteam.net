import { useState, useRef, useEffect } from "react";
import { MdOutlineArrowDropDown } from "react-icons/md";
import { TbLogout } from "react-icons/tb";
import { useNavigate } from "react-router-dom";
import NotificationPanel from "./NotificationPanel";
import io from "socket.io-client"; // Thêm socket.io-client

const Navbar = ({ userId }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState("");
  const socket = useRef(null); // Ref cho socket

  // Khởi tạo socket khi component mount
  useEffect(() => {
    socket.current = io("http://localhost:8001"); // Thay bằng URL server Socket.IO thực tế
    return () => {
      socket.current.disconnect(); // Ngắt kết nối khi component unmount
    };
  }, []);

  // Lấy vai trò người dùng từ localStorage
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser?.role) {
      setUserRole(storedUser.role);
    }
  }, []);

  // Xử lý click bên ngoài để đóng dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Xử lý đăng xuất
  const handleLogout = () => {
    // Gửi sự kiện user-logout tới server
    if (userId) {
      socket.current.emit("user-logout", userId);
    }

    // Xóa dữ liệu localStorage
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setIsDropdownOpen(false);
    navigate("/login", { replace: true });
  };

  return (
    <nav className="w-full bg-white shadow-md px-4 sm:px-6 py-5 flex items-center justify-end sticky top-0 z-10">
      <div
        className="flex items-center gap-2 sm:gap-4 relative"
        ref={dropdownRef}
      >
        {userId && <NotificationPanel userId={userId} />}
        <div
          className="flex items-center gap-1 cursor-pointer"
          onClick={() => setIsDropdownOpen((prev) => !prev)}
        >
          <p className="text-gray-700 text-sm sm:text-base">
            Xin chào!{" "}
            <span className="font-semibold capitalize">{userRole}</span>
          </p>
          <MdOutlineArrowDropDown className="text-xl sm:text-2xl text-gray-600" />
        </div>
        {isDropdownOpen && (
          <div className="absolute top-12 right-0 bg-white border rounded shadow-md w-36 sm:w-40 z-50 animate-fade-in">
            <ul>
              <li
                onClick={handleLogout}
                className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer text-red-500 text-sm sm:text-base"
              >
                <TbLogout className="mr-2" />
                Đăng xuất
              </li>
            </ul>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

import React, { useContext, useState } from "react";
import { MoreVertical, Video } from "lucide-react";
import { SocketContext } from "../../../context/SocketContext";

const ChatHeader = ({
  selectedGroup,
  typingUsers,
  navigate,
  sidebarOpen,
  setSidebarOpen,
  isGroupInCall,
}) => {
  const socket = useContext(SocketContext);
  const currentUser = JSON.parse(localStorage.getItem("user"));
  const [error, setError] = useState(null);

  if (!selectedGroup) {
    console.log("ChatHeader: Không có nhóm được chọn, trả về null");
    return null;
  }

const handleVideoClick = () => {
    console.log("handleVideoClick: Bắt đầu cuộc gọi video");
    if (!socket || !socket.connected || !currentUser?._id || !selectedGroup?._id) {
        setError("Không thể bắt đầu cuộc gọi. Vui lòng kiểm tra kết nối hoặc đăng nhập.");
        return;
    }
    const attemptCallStatus = (attempts = 3, delay = 1000) => {
        socket.timeout(10000).emit(
            "get-call-status",
            { groupId: selectedGroup._id, userId: currentUser._id },
            (err, response) => {
                if (err || !response?.success) {
                    if (attempts > 1) {
                        setTimeout(() => attemptCallStatus(attempts - 1, delay * 2), delay);
                        return;
                    }
                    setError(response?.error || "Không thể kiểm tra trạng thái nhóm.");
                    return;
                }
                navigate(`/chat/video-call/${selectedGroup._id}`);
            }
        );
    };
    attemptCallStatus();
};

  return (
    <div className="px-4 py-3 sm:px-6 sm:py-4 bg-white border-b shadow-sm flex justify-between items-center">
      {error && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-4 py-2 rounded-md z-50">
          {error}
          <button onClick={() => setError(null)} className="ml-2 font-bold">
            X
          </button>
        </div>
      )}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-blue-800">
          {selectedGroup.name}
        </h2>
        <p className="text-xs sm:text-sm text-gray-600">
          {selectedGroup.members.length} thành viên
          {typingUsers?.size > 0 && (
            <span className="ml-2 text-blue-500 animate-pulse">
              {[...typingUsers].length} người đang nhập...
            </span>
          )}
        </p>
      </div>
      <div className="flex gap-2 sm:gap-3">
        <button
          onClick={handleVideoClick}
          className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${isGroupInCall ? "bg-green-100" : ""}`}
          title={isGroupInCall ? "Tham gia cuộc gọi" : "Bắt đầu cuộc gọi video"}
        >
          <Video
            size={18}
            className={`${isGroupInCall ? "text-green-600" : "text-blue-600"} sm:w-5 sm:h-5`}
          />
        </button>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          title="Mở danh sách thành viên"
        >
          <MoreVertical size={18} className="text-blue-600 sm:w-5 sm:h-5" />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;
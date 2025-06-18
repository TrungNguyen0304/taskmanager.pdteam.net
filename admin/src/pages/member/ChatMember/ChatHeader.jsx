import React from "react";
import { MoreVertical, Video } from "lucide-react";

const ChatHeader = ({
  selectedGroup,
  typingUsers,
  navigate,
  sidebarOpen,
  setSidebarOpen,
  isGroupInCall,
}) => {
  if (!selectedGroup) return null;

  const handleVideoClick = () => {
    navigate(`/chat/video-call/${selectedGroup._id}`);
  };
return (
  <div className="px-4 py-3 sm:px-6 sm:py-4 bg-white border-b shadow-sm flex justify-between items-center">
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
        {isGroupInCall && (
          <span className="ml-2 text-green-600 font-medium animate-pulse">
            📞 Đang có cuộc gọi...
          </span>
        )}
      </p>
    </div>
    <div className="flex gap-2 sm:gap-3">
      <button
        onClick={handleVideoClick}
        className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${
          isGroupInCall ? "bg-green-100" : ""
        }`}
        title={isGroupInCall ? "Tham gia cuộc gọi" : "Bắt đầu cuộc gọi video"}
      >
        <Video
          size={18}
          className={`${
            isGroupInCall ? "text-green-600" : "text-blue-600"
          } sm:w-5 sm:h-5`}
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
import React from "react";
import {
  MoreVertical,
  X,
  UserPlus,
  Users,
  Send,
  Trash2,
  ChevronDown,
  Video,
  Edit2,
  Plus,
} from "lucide-react";
import { BiDotsVerticalRounded, BiSolidImage } from "react-icons/bi";
import { FaRegEyeSlash } from "react-icons/fa";

const ChatMainLeader = ({
  selectedGroup,
  messages,
  inputText,
  setInputText,
  handleSendMessage,
  handleFileChange,
  showFileInput,
  setShowFileInput,
  sidebarOpen,
  setSidebarOpen,
  showMembers,
  setShowMembers,
  addingMember,
  setAddingMember,
  newMemberId,
  setNewMemberId,
  selectedMemberIndex,
  setSelectedMemberIndex,
  handleConfirmAdd,
  handleRemoveMember,
  handleLeaveGroup,
  currentUser,
  teamMembers,
  typingUsers,
  onlineUsers,
  openMenuId,
  setOpenMenuId,
  editingMessageId,
  editText,
  setEditText,
  handleStartEditMessage,
  handleSaveEditMessage,
  handleCancelEdit,
  handleDeleteMessage,
  handleHideMessage,
  chatEndRef,
  addMemberRef,
  error,
  navigate,
}) => {
  const handleInputChange = (e) => {
    setInputText(e.target.value);
  };

  return (
    <div className="relative flex flex-col h-full bg-white sm:shadow-lg sm:rounded-r-xl overflow-hidden w-full mx-auto">
      {/* Header */}
      <div className="px-4 py-3 sm:px-6 sm:py-4 bg-white border-b shadow-sm flex justify-between items-center">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-blue-800">
            {selectedGroup.name}
          </h2>
          <p className="text-xs sm:text-sm text-gray-600">
            {selectedGroup.members.length} thành viên
            {typingUsers.size > 0 && (
              <span className="ml-2 text-blue-500 animate-pulse">
                {[...typingUsers].length} người đang nhập...
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2 sm:gap-3">
          <button
            onClick={() => navigate(`/chat/video-call/${selectedGroup._id}`)}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            title="Bắt đầu cuộc gọi video"
          >
            <Video size={18} className="text-blue-600 sm:w-5 sm:h-5" />
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

      {/* Right Sidebar (Slides in from Right) */}
      {sidebarOpen && (
        <>
          {/* Backdrop for mobile */}
          <div
            className="fixed inset-0 bg-black/50 sm:hidden z-40"
            onClick={() => setSidebarOpen(false)}
          />
          <div
            className={`fixed top-0 right-0 h-full w-64 sm:w-72 bg-white border-l shadow-xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out ${
              sidebarOpen ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <div className="flex items-center justify-between px-4 py-4 border-b bg-gray-50">
              <div>
                <h1 className="font-bold text-gray-800 text-base sm:text-lg flex items-center gap-2">
                  {currentUser.name}
                  {onlineUsers.has(currentUser._id) && (
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  )}
                </h1>
                <p className="flex items-center text-xs text-gray-600">
                  <div className="bg-green-500 w-2 h-2 rounded-full mr-1"></div>
                  Bạn đang online
                </p>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="hover:bg-gray-100 rounded p-1 transition-colors"
              >
                <X size={16} className="text-gray-600 sm:w-5 sm:h-5" />
              </button>
            </div>

            <div className="p-4 flex flex-col gap-4 flex-1 overflow-y-auto custom-scrollbar">
              <button
                onClick={() => setShowMembers(!showMembers)}
                className="flex items-center justify-between w-full px-4 py-2 bg-gray-50 border rounded-lg hover:bg-gray-100 transition-colors"
              >
                <span className="flex items-center gap-2 text-gray-800 text-sm sm:text-base">
                  <Users size={14} className="sm:w-5 sm:h-5" /> Thành viên (
                  {selectedGroup.members.length})
                </span>
                <ChevronDown
                  size={14}
                  className={`sm:w-5 sm:h-5 ${
                    showMembers ? "rotate-180" : ""
                  } transition-transform text-gray-600`}
                />
              </button>

              {showMembers && (
                <div className="bg-gray-50 p-3 rounded-lg border space-y-3 max-h-60 overflow-y-auto custom-scrollbar">
                  {selectedGroup.members.map((member, index) => (
                    <div
                      key={member._id}
                      className="flex justify-between items-center text-xs sm:text-sm text-gray-800"
                    >
                      <span className="flex items-center gap-2">
                        {member.name}
                        {onlineUsers.has(member._id) && (
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        )}
                      </span>
                      {member._id !== currentUser._id && (
                        <div className="relative">
                          <button
                            onClick={() =>
                              setSelectedMemberIndex((prev) =>
                                prev === index ? null : index
                              )
                            }
                            className="hover:bg-gray-100 rounded p-1 transition-colors"
                          >
                            <MoreVertical
                              size={14}
                              className="text-gray-600 sm:w-5 sm:h-5"
                            />
                          </button>
                          {selectedMemberIndex === index && (
                            <div className="absolute right-6 -top-1 bg-white border rounded-lg shadow z-10">
                              <button
                                onClick={() => handleRemoveMember(index)}
                                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-gray-100 w-full text-xs sm:text-sm"
                              >
                                <Trash2 size={12} className="sm:w-4 sm:h-4" />{" "}
                                Xóa
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div ref={addMemberRef}>
                <button
                  onClick={() => setAddingMember(!addingMember)}
                  className="flex items-center gap-2 text-sm sm:text-base bg-gray-50 border rounded-lg hover:bg-gray-100 px-4 py-2 w-full transition-colors"
                >
                  <UserPlus size={14} className="text-blue-600 sm:w-5 sm:h-5" />{" "}
                  Thêm thành viên
                </button>
                {addingMember && (
                  <div className="flex gap-3 mt-3 items-center">
                    <select
                      value={newMemberId}
                      onChange={(e) => setNewMemberId(e.target.value)}
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Chọn thành viên</option>
                      {teamMembers
                        .filter(
                          (m) =>
                            !selectedGroup.members.some(
                              (member) => member._id === m._id
                            )
                        )
                        .map((member) => (
                          <option key={member._id} value={member._id}>
                            {member.name}
                          </option>
                        ))}
                    </select>
                    <button
                      onClick={handleConfirmAdd}
                      className="bg-green-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-xs sm:text-sm"
                    >
                      Thêm
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={handleLeaveGroup}
                className="mt-auto bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
              >
                Rời nhóm
              </button>
            </div>
          </div>
        </>
      )}

      {/* Chat messages */}
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto custom-scrollbar bg-gray-50">
        {error && (
          <div className="text-red-500 text-center bg-red-50 px-4 py-2 rounded-lg mb-4 text-xs sm:text-sm">
            {error}
          </div>
        )}
        {messages.map((msg) => {
          const isCurrentUser = msg.senderId === currentUser._id;
          if (msg.system || msg.hidden) {
            return msg.system ? (
              <div
                key={msg._id || msg.timestamp}
                className="text-center text-xs italic text-gray-500 mb-3"
              >
                {msg.text}
              </div>
            ) : null;
          }
          return (
            <div
              key={msg._id || msg.timestamp}
              className={`mb-4 flex ${
                isCurrentUser ? "justify-end" : "justify-start"
              } items-center gap-2 group`}
            >
              {isCurrentUser && (
                <div className="relative message-menu">
                  <button
                    onClick={() =>
                      setOpenMenuId((prev) =>
                        prev === msg._id ? null : msg._id
                      )
                    }
                    className="p-1 hover:bg-gray-200 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <BiDotsVerticalRounded
                      size={18}
                      className="text-gray-600 sm:w-5 sm:h-5"
                    />
                  </button>
                  {openMenuId === msg._id && (
                    <div className="absolute right-0 bottom-8 bg-white border rounded-lg shadow z-10 w-28 sm:w-32">
                      <button
                        onClick={() =>
                          handleStartEditMessage(msg._id, msg.text)
                        }
                        className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-gray-100 w-full text-xs sm:text-sm"
                      >
                        <Edit2 size={12} className="sm:w-4 sm:h-4" /> Chỉnh sửa
                      </button>
                      <button
                        onClick={() => handleDeleteMessage(msg._id)}
                        className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-gray-100 w-full text-xs sm:text-sm"
                      >
                        <Trash2 size={12} className="sm:w-4 sm:h-4" /> Xóa
                      </button>
                      <button
                        onClick={() => handleHideMessage(msg._id)}
                        className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 w-full text-xs sm:text-sm"
                      >
                        <FaRegEyeSlash className="w-3 h-3 sm:w-4 sm:h-4" />
                        Ẩn
                      </button>
                    </div>
                  )}
                </div>
              )}
              <div
                className={`max-w-[80%] sm:max-w-[70%] px-3 sm:px-4 py-2 rounded-lg ${
                  isCurrentUser
                    ? "bg-blue-600 text-white rounded-br-none"
                    : "bg-white border border-gray-300 rounded-bl-none"
                } shadow`}
              >
                {!isCurrentUser && (
                  <div className="text-xs font-semibold mb-1 text-gray-600">
                    {msg.senderName}
                  </div>
                )}
                {editingMessageId === msg._id && isCurrentUser ? (
                  <div className="flex flex-col gap-2">
                    <input
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-1 text-xs sm:text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSaveEditMessage(msg._id)}
                        className="bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 transition-colors text-xs sm:text-sm"
                      >
                        Lưu
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="bg-gray-300 text-gray-800 px-3 py-1 rounded-lg hover:bg-gray-400 transition-colors text-xs sm:text-sm"
                      >
                        Hủy
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs sm:text-sm">{msg.text}</div>
                )}
              </div>
              {!isCurrentUser && (
                <div className="relative message-menu">
                  <button
                    onClick={() =>
                      setOpenMenuId((prev) =>
                        prev === msg._id ? null : msg._id
                      )
                    }
                    className="p-1 hover:bg-gray-200 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <BiDotsVerticalRounded
                      size={18}
                      className="text-gray-600 sm:w-5 sm:h-5"
                    />
                  </button>
                  {openMenuId === msg._id && (
                    <div className="absolute left-0 bottom-8 bg-white border rounded-lg shadow z-10 w-28 sm:w-32">
                      <button
                        onClick={() => handleDeleteMessage(msg._id)}
                        className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-gray-100 w-full text-xs sm:text-sm"
                      >
                        <Trash2 size={12} className="sm:w-4 sm:h-4" /> Xóa
                      </button>
                      <button
                        onClick={() => handleHideMessage(msg._id)}
                        className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 w-full text-xs sm:text-sm"
                      >
                        <FaRegEyeSlash className="w-3 h-3 sm:w-4 sm:h-4" />
                        Ẩn
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
        <div ref={chatEndRef} />
      </div>

      {/* Input to send message */}
      <div className="border-t bg-white px-4 py-3 sm:px-6 sm:py-4 flex items-center gap-2 sm:gap-3">
        <div className="relative">
          <button
            onClick={() => setShowFileInput(!showFileInput)}
            className="bg-gray-100 text-gray-700 p-2 rounded-full hover:bg-gray-200 transition-all duration-200"
            title="Tải lên file"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          {showFileInput && (
            <div className="absolute bottom-12 left-0 bg-white border border-gray-200 rounded-md shadow-md z-10 w-32 sm:w-36">
              <label className="flex items-center gap-2 px-4 py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-100 cursor-pointer transition rounded-md">
                <BiSolidImage className="text-base sm:text-xl" />
                Tải ảnh lên
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            </div>
          )}
        </div>

        <input
          type="text"
          placeholder="Nhập tin nhắn..."
          value={inputText}
          onChange={handleInputChange}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSendMessage();
          }}
          className="flex-1 border border-gray-200 rounded-full px-3 sm:px-4 py-2 text-xs sm:text-sm bg-gray-50 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
        />

        <button
          onClick={handleSendMessage}
          disabled={!inputText.trim()}
          className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 disabled:bg-blue-300 transition-colors duration-200"
          title="Gửi tin nhắn"
        >
          <Send className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>
    </div>
  );
};

export default ChatMainLeader;

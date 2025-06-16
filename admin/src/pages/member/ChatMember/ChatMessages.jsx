import React from "react";
import { BiDotsVerticalRounded } from "react-icons/bi";
import { FaRegEyeSlash } from "react-icons/fa";
import { Edit2, Trash2 } from "lucide-react";
import { MdOutlineGroups2 } from "react-icons/md";

const ChatMessages = ({
  messages,
  currentUser,
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
  error,
  chatEndRef,
}) => {
  return (
    <div className="flex-1 p-4 sm:p-6 overflow-y-auto custom-scrollbar bg-gray-50">
      <div className="flex flex-col items-center mb-4">
        <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-2">
          <MdOutlineGroups2 className="w-12 h-12" />
        </div>
        <div className="text-lg font-semibold text-gray-500 mb-1">
          Bắt đầu cuộc trò chuyện của bạn
        </div>
      </div>
      {error && (
        <div className="text-red-500 text-center bg-red-50 px-4 py-2 rounded-lg mb-4 text-xs sm:text-sm">
          {error}
        </div>
      )}
      {messages.length === 0 ? (
        <div className="text-center text-gray-500 text-xs sm:text-sm">
          Chưa có tin nhắn nào trong nhóm này.
        </div>
      ) : (
        messages.map((msg) => {
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
                    <div className="absolute right-0 bottom-0 bg-white border rounded-lg shadow z-50 w-28 sm:w-32">
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
        })
      )}
      <div ref={chatEndRef} />
    </div>
  );
};

export default ChatMessages;

import React, { useEffect, useState } from "react";
import { BiDotsVerticalRounded } from "react-icons/bi";
import { FaRegEyeSlash } from "react-icons/fa";
import { Edit2, Trash2 } from "lucide-react";
import { MdOutlineGroups2 } from "react-icons/md";
import { IoMdClose } from "react-icons/io";

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
  setError,
  chatEndRef,
}) => {
  const BASE_URL = "http://localhost:8001";
  // State to manage the modal visibility and the selected image
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  // Smooth scroll to the latest message
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, chatEndRef]);

  // Handle edit submission with validation
  const handleEditSubmit = (messageId) => {
    if (editText.trim() === "") {
      alert("Tin nhắn không được để trống.");
      return;
    }
    handleSaveEditMessage(messageId);
  };

  // Open the modal with the clicked image
  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl);
    setIsModalOpen(true);
  };

  // Close the modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedImage(null);
  };

  return (
    <div className="flex-1 p-4 sm:p-6 overflow-y-auto custom-scrollbar bg-gray-50">
      {/* Chat Header */}
      <div className="flex flex-col items-center mb-6">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 rounded-full flex items-center justify-center mb-2 shadow-sm">
          <MdOutlineGroups2 className="w-10 h-10 sm:w-12 sm:h-12 text-gray-600" />
        </div>
        <div className="text-lg sm:text-xl font-semibold text-gray-700">
          Bắt đầu cuộc trò chuyện của bạn
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="relative text-red-500 text-center bg-red-50 px-4 py-2 rounded-lg mb-4 text-xs sm:text-sm shadow-sm">
          {error}
          <button
            onClick={() => setError(null)}
            className="absolute right-2 top-1 text-red-500 hover:text-red-700"
            aria-label="Đóng thông báo lỗi"
          >
            ✕
          </button>
        </div>
      )}

      {/* Messages List */}
      {messages.length === 0 ? (
        <div className="text-center text-gray-500 text-xs sm:text-sm">
          Chưa có tin nhắn nào trong nhóm này.
        </div>
      ) : (
        messages.map((msg, index) => {
          const isCurrentUser = msg.senderId === currentUser._id;
          const messageKey = msg._id || `msg-${index}-${msg.timestamp}`;

          if (msg.system || msg.hidden) {
            return msg.system ? (
              <div
                key={messageKey}
                className="text-center text-xs italic text-gray-500 mb-3"
              >
                {msg.text}
              </div>
            ) : null;
          }

          return (
            <div
              key={messageKey}
              className={`mb-4 flex ${
                isCurrentUser ? "justify-end" : "justify-start"
              } items-start gap-2 group`}
            >
              {!isCurrentUser && (
                <div className="relative message-menu">
                  <button
                    onClick={() =>
                      setOpenMenuId((prev) =>
                        prev === msg._id ? null : msg._id
                      )
                    }
                    className="p-1 hover:bg-gray-200 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Mở menu tin nhắn"
                  >
                    <BiDotsVerticalRounded
                      size={18}
                      className="text-gray-600 sm:w-5 sm:h-5"
                    />
                  </button>
                  {openMenuId === msg._id && (
                    <div className="absolute left-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-50 w-28 sm:w-32">
                      <button
                        onClick={() => handleDeleteMessage(msg._id)}
                        className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-gray-100 w-full text-xs sm:text-sm"
                        aria-label="Xóa tin nhắn"
                      >
                        <Trash2 size={12} className="sm:w-4 sm:h-4" /> Xóa
                      </button>
                      <button
                        onClick={() => handleHideMessage(msg._id)}
                        className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 w-full text-xs sm:text-sm"
                        aria-label="Ẩn tin nhắn"
                      >
                        <FaRegEyeSlash className="w-3 h-3 sm:w-4 sm:h-4" /> Ẩn
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Message Content */}
              <div
                className={`${
                  isCurrentUser ? "ml-auto" : "mr-auto"
                } max-w-[80%] sm:max-w-[60%] md:max-w-[50%]`}
              >
                {msg.imageUrl ? (
                  <img
                    src={`${BASE_URL}${msg.imageUrl}`}
                    alt={msg.fileName || "Uploaded image"}
                    className="rounded-lg object-contain w-full max-w-[200px] sm:max-w-[300px] md:max-w-[400px] cursor-pointer hover:opacity-90 transition-opacity"
                    loading="lazy"
                    onClick={() =>
                      handleImageClick(`${BASE_URL}${msg.imageUrl}`)
                    }
                  />
                ) : (
                  <div
                    className={`px-3 sm:px-4 py-2 rounded-lg shadow-sm ${
                      isCurrentUser
                        ? "bg-blue-600 text-white rounded-br-none"
                        : "bg-white border border-gray-300 rounded-bl-none"
                    }`}
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
                          aria-label="Chỉnh sửa tin nhắn"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditSubmit(msg._id)}
                            className="bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 transition-colors text-xs sm:text-sm"
                            aria-label="Lưu tin nhắn đã chỉnh sửa"
                          >
                            Lưu
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="bg-gray-300 text-gray-800 px-3 py-1 rounded-lg hover:bg-gray-400 transition-colors text-xs sm:text-sm"
                            aria-label="Hủy chỉnh sửa"
                          >
                            Hủy
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs sm:text-sm break-words">
                        {msg.text}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Menu for Current User's Messages (Right Side) */}
              {isCurrentUser && (
                <div className="relative message-menu">
                  <button
                    onClick={() =>
                      setOpenMenuId((prev) =>
                        prev === msg._id ? null : msg._id
                      )
                    }
                    className="p-1 hover:bg-gray-200 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Mở menu tin nhắn"
                  >
                    <BiDotsVerticalRounded
                      size={18}
                      className="text-gray-600 sm:w-5 sm:h-5"
                    />
                  </button>
                  {openMenuId === msg._id && (
                    <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-50 w-28 sm:w-32">
                      {!msg.imageUrl && (
                        <button
                          onClick={() =>
                            handleStartEditMessage(msg._id, msg.text)
                          }
                          className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-gray-100 w-full text-xs sm:text-sm"
                          aria-label="Chỉnh sửa tin nhắn"
                        >
                          <Edit2 size={12} className="sm:w-4 sm:h-4" /> Chỉnh sửa
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteMessage(msg._id)}
                        className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-gray-100 w-full text-xs sm:text-sm"
                        aria-label="Xóa tin nhắn"
                      >
                        <Trash2 size={12} className="sm:w-4 sm:h-4" /> Xóa
                      </button>
                      <button
                        onClick={() => handleHideMessage(msg._id)}
                        className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 w-full text-xs sm:text-sm"
                        aria-label="Ẩn tin nhắn"
                      >
                        <FaRegEyeSlash className="w-3 h-3 sm:w-4 sm:h-4" /> Ẩn
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })
      )}

      {/* Image Preview Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="relative max-w-[90vw] max-h-[90vh]">
            <img
              src={selectedImage}
              alt="Full-size image"
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
            <button
              onClick={handleCloseModal}
              className="absolute top-2 right-2 bg-gray-800 text-white rounded-full p-2 hover:bg-gray-700 transition-colors"
              aria-label="Đóng hình ảnh"
            >
              <IoMdClose className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      <div ref={chatEndRef} /> 
    </div>
  );
};

export default ChatMessages;
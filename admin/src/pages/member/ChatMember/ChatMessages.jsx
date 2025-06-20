import React, { useEffect, useState, useRef } from "react";
import { BiDotsVerticalRounded } from "react-icons/bi";
import { FaRegEyeSlash } from "react-icons/fa";
import { Edit2, Trash2 } from "lucide-react";
import { MdOutlineGroups2 } from "react-icons/md";
import { IoMdClose } from "react-icons/io";
import { FaArrowDown, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { io } from "socket.io-client";
import axios from "axios";

const ChatMessages = ({
  messages,
  setMessages,
  currentUser,
  openMenuId,
  setOpenMenuId,
  editingMessageId,
  editText,
  setEditText,
  handleStartEditMessage,
  handleDeleteMessage,
  handleHideMessage,
  error,
  setError,
  chatEndRef,
  groupId,
}) => {
  const BASE_URL = "http://localhost:8001";
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showToBottom, setShowToBottom] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRecallModalOpen, setIsRecallModalOpen] = useState(false);
  const [messageToRecall, setMessageToRecall] = useState(null);
  const chatContainerRef = useRef(null);
  const thumbnailContainerRef = useRef(null);
  const editInputRef = useRef(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const imageMessages = messages
    .filter((msg) => msg.imageUrl && !msg.hidden && !msg.isRecalled)
    .map((msg) => ({
      url: `${BASE_URL}${msg.imageUrl}`,
      fileName: msg.fileName || "Uploaded image",
    }));

  // Socket.IO setup
  useEffect(() => {
    const socket = io("http://localhost:8001", { autoConnect: true });
    socket.on("connect", () => {
      console.log("Socket.IO connected");
      reconnectAttempts.current = 0;
    });
    socket.on("message-edited", (updatedMessage) => {
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg._id === updatedMessage.messageId
            ? {
                ...msg,
                text: updatedMessage.message,
                isEdited: updatedMessage.isEdited,
              }
            : msg
        )
      );
    });
    socket.on("message-recalled", (recalledMessage) => {
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg._id === recalledMessage.messageId
            ? {
                ...msg,
                isRecalled: recalledMessage.isRecalled,
                text: recalledMessage.message,
                imageUrl: null,
              }
            : msg
        )
      );
    });
    socket.on("connect_error", () => {
      if (reconnectAttempts.current < maxReconnectAttempts) {
        console.log(
          `Socket.IO connection error, retrying (${
            reconnectAttempts.current + 1
          }/${maxReconnectAttempts})...`
        );
        reconnectAttempts.current += 1;
        setTimeout(() => socket.connect(), 1000);
      } else {
        console.error(
          "Max reconnect attempts reached. Socket.IO connection failed."
        );
        setError("Không thể kết nối đến server. Vui lòng thử lại sau.");
      }
    });
    return () => socket.disconnect();
  }, [setMessages, setError]);

  // Handle recall message
  const handleRecallMessage = async (messageId) => {
    const message = messages.find((msg) => msg._id === messageId);
    if (!message) {
      setError("Tin nhắn không tồn tại.");
      setIsRecallModalOpen(false);
      setMessageToRecall(null);
      return;
    }
    if (!groupId) {
      setError("Không tìm thấy ID nhóm.");
      setIsRecallModalOpen(false);
      setMessageToRecall(null);
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `http://localhost:8001/api/group/${groupId}/messages/${messageId}/recall`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg._id === messageId
            ? {
                ...msg,
                isRecalled: true,
                text: "Tin nhắn đã bị thu hồi",
                imageUrl: null,
              }
            : msg
        )
      );
      setError(null);
      setIsRecallModalOpen(false);
      setMessageToRecall(null);
      setOpenMenuId(null);
    } catch (error) {
      console.error("Lỗi khi thu hồi tin nhắn:", error);
      setError(
        error.response?.data?.message || "Lỗi xảy ra khi thu hồi tin nhắn."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Open recall confirmation modal
  const handleOpenRecallModal = (messageId) => {
    setMessageToRecall(messageId);
    setIsRecallModalOpen(true);
    setOpenMenuId(null);
  };

  // Close recall confirmation modal
  const handleCloseRecallModal = () => {
    setIsRecallModalOpen(false);
    setMessageToRecall(null);
  };

  // Handle save edit message
  const handleEditSubmit = async (messageId) => {
    if (!editText.trim()) {
      setError("Tin nhắn không được để trống.");
      return;
    }
    setIsLoading(true);
    try {
      const message = messages.find((msg) => msg._id === messageId);
      if (!message) {
        throw new Error("Tin nhắn không tồn tại trong danh sách.");
      }
      if (message.isRecalled) {
        throw new Error("Tin nhắn đã bị thu hồi, không thể chỉnh sửa.");
      }
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:8001/api/group/${groupId}/messages/${messageId}/edit`,
        { newMessage: editText },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // Update local state immediately
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg._id === messageId
            ? {
                ...msg,
                text: editText,
                isEdited: true,
              }
            : msg
        )
      );
      // Clear editing state
      handleStartEditMessage(null, "");
      setError(null);
      setOpenMenuId(null);
    } catch (error) {
      console.error("Lỗi khi chỉnh sửa tin nhắn:", error);
      setError(
        error.message ||
          error.response?.data?.message ||
          "Lỗi khi chỉnh sửa tin nhắn."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedImage(null);
    setCurrentImageIndex(0);
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handlePrevImage = () => {
    if (imageMessages.length === 0) return;
    setCurrentImageIndex((prev) => {
      const newIndex = prev > 0 ? prev - 1 : imageMessages.length - 1;
      setSelectedImage(imageMessages[newIndex].url);
      return newIndex;
    });
  };

  const handleNextImage = () => {
    if (imageMessages.length === 0) return;
    setCurrentImageIndex((prev) => {
      const newIndex = prev < imageMessages.length - 1 ? prev + 1 : 0;
      setSelectedImage(imageMessages[newIndex].url);
      return newIndex;
    });
  };

  const handleThumbnailClick = (imageUrl, index) => {
    setSelectedImage(imageUrl);
    setCurrentImageIndex(index);
  };

  const handleImageNavigation = (event) => {
    if (!isModalOpen || imageMessages.length === 0) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const imageWidth = rect.width;
    if (clickX < imageWidth / 2) {
      handlePrevImage();
    } else {
      handleNextImage();
    }
  };

  useEffect(() => {
    if (chatEndRef.current && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.senderId === currentUser._id) {
        chatEndRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [messages, chatEndRef, currentUser._id]);

  useEffect(() => {
    const handleScroll = () => {
      if (chatContainerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } =
          chatContainerRef.current;
        setShowToBottom(scrollTop + clientHeight < scrollHeight - 100);
      }
    };
    const container = chatContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, []);

  useEffect(() => {
    if (selectedImage && imageMessages.length > 0) {
      const index = imageMessages.findIndex((img) => img.url === selectedImage);
      if (index !== -1) {
        setCurrentImageIndex(index);
      }
    }
  }, [selectedImage, imageMessages]);

  useEffect(() => {
    if (
      isModalOpen &&
      thumbnailContainerRef.current &&
      imageMessages.length > 1
    ) {
      const selectedThumbnail =
        thumbnailContainerRef.current.children[currentImageIndex];
      if (selectedThumbnail) {
        selectedThumbnail.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }
    }
  }, [currentImageIndex, isModalOpen, imageMessages.length]);

  useEffect(() => {
    if (editingMessageId && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingMessageId]);

  const handleStartEdit = (messageId, text) => {
    const message = messages.find((msg) => msg._id === messageId);
    if (!message) {
      setError("Tin nhắn không tồn tại.");
      return;
    }
    if (message.isRecalled) {
      setError("Tin nhắn đã bị thu hồi, không thể chỉnh sửa.");
      return;
    }
    handleStartEditMessage(messageId, text);
    setOpenMenuId(null);
  };

  const handleCancel = () => {
    handleStartEditMessage(null, "");
    setOpenMenuId(null);
  };

  const handleMenuClick = (messageId) => {
    setOpenMenuId((prev) => (prev === messageId ? null : messageId));
  };

  const handleScrollToBottom = () => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div
      className="flex-1 p-4 sm:p-6 overflow-y-auto custom-scrollbar bg-gray-50"
      ref={chatContainerRef}
    >
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
                    onClick={() => handleMenuClick(msg._id)}
                    className="p-1 hover:bg-gray-200 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <BiDotsVerticalRounded
                      size={18}
                      className="text-gray-600 sm:w-5 sm:h-5"
                    />
                  </button>
                  {openMenuId === msg._id && (
                    <div className="absolute right-0 bottom-2 bg-white border rounded-lg shadow z-50 w-28 sm:w-32">
                      {msg.isRecalled ? (
                        <button
                          onClick={() => {
                            handleDeleteMessage(msg._id);
                            setOpenMenuId(null);
                          }}
                          className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-gray-100 w-full text-xs sm:text-sm"
                        >
                          <Trash2 size={12} className="sm:w-4 sm:h-4" /> Xóa
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() =>
                              handleStartEdit(msg._id, msg.text || "")
                            }
                            className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-gray-100 w-full text-xs sm:text-sm"
                            disabled={msg.isRecalled}
                          >
                            <Edit2 size={12} className="sm:w-4 sm:h-4" /> Chỉnh
                            sửa
                          </button>
                          <button
                            onClick={() => handleOpenRecallModal(msg._id)}
                            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-gray-100 w-full text-xs sm:text-sm"
                          >
                            <Trash2 size={12} className="sm:w-4 sm:h-4" /> Thu
                            hồi
                          </button>
                          <button
                            onClick={() => {
                              handleHideMessage(msg._id);
                              setOpenMenuId(null);
                            }}
                            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 w-full text-xs sm:text-sm"
                          >
                            <FaRegEyeSlash className="w-3 h-3 sm:w-4 sm:h-4" />{" "}
                            Ẩn
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}
              <div
                className={`max-w-[80%] sm:max-w-[70%] px-3 sm:px-4 py-2 rounded-lg ${
                  isCurrentUser
                    ? "bg-blue-600 text-white rounded-br-none"
                    : "bg-white border border-gray-300 rounded-bl-none"
                } shadow ${
                  editingMessageId === msg._id ? "editing-message" : ""
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
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !isLoading) {
                          handleEditSubmit(msg._id);
                        }
                      }}
                      ref={editInputRef}
                      className="w-full border border-gray-300 rounded-lg px-3 py-1 text-xs sm:text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditSubmit(msg._id)}
                        className={`bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 transition-colors text-xs sm:text-sm ${
                          isLoading ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                        disabled={isLoading}
                      >
                        {isLoading ? "Đang lưu..." : "Lưu"}
                      </button>
                      <button
                        onClick={handleCancel}
                        className="bg-gray-300 text-gray-800 px-3 py-1 rounded-lg hover:bg-gray-400 transition-colors text-xs sm:text-sm"
                      >
                        Hủy
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs sm:text-sm">
                    {msg.isRecalled ? (
                      <div className="italic text-gray-400">
                        Tin nhắn đã bị thu hồi
                      </div>
                    ) : (
                      <>
                        {msg.imageUrl && (
                          <img
                            src={`${BASE_URL}${msg.imageUrl}`}
                            alt={msg.fileName || "Uploaded image"}
                            className="max-w-[200px] sm:max-w-[300px] rounded-lg mb-2 object-contain cursor-pointer"
                            onClick={() =>
                              handleImageClick(`${BASE_URL}${msg.imageUrl}`)
                            }
                          />
                        )}
                        {msg.isEdited && (
                          <span className="text-xs text-gray-400">
                            (Đã chỉnh sửa)
                          </span>
                        )}
                        {msg.text && <div>{msg.text}</div>}
                      </>
                    )}
                  </div>
                )}
              </div>
              {!isCurrentUser && (
                <div className="relative message-menu">
                  <button
                    onClick={() => handleMenuClick(msg._id)}
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
                        onClick={() => {
                          handleDeleteMessage(msg._id);
                          setOpenMenuId(null);
                        }}
                        className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-gray-100 w-full text-xs sm:text-sm"
                      >
                        <Trash2 size={12} className="sm:w-4 sm:h-4" /> Xóa
                      </button>
                      <button
                        onClick={() => {
                          handleHideMessage(msg._id);
                          setOpenMenuId(null);
                        }}
                        className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 w-full text-xs sm:text-sm"
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
      {showToBottom && (
        <button
          onClick={handleScrollToBottom}
          className="fixed bottom-12 right-8 sm:bottom-28 sm:right-10 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-50"
        >
          <FaArrowDown className="w-5 h-5" />
        </button>
      )}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex flex-col z-50">
          <div className="flex-1 flex items-center justify-center">
            <div className="relative max-w-[90vw] max-h-[70vh] mb-20">
              <img
                src={selectedImage}
                alt={imageMessages[currentImageIndex]?.fileName || "Image"}
                className="max-w-full max-h-[70vh] object-contain rounded-lg"
                onClick={handleImageNavigation}
              />
              <button
                onClick={handleCloseModal}
                className="absolute top-2 right-2 bg-gray-800 text-white rounded-full p-2 hover:bg-gray-700 transition-colors"
              >
                <IoMdClose className="w-5 h-5" />
              </button>
            </div>
          </div>
          {imageMessages.length > 1 && (
            <div className="fixed bottom-0 left-0 right-0 bg-gray-900 bg-opacity-90 py-4 flex items-center justify-center gap-4 z-50">
              <button
                onClick={handlePrevImage}
                className="bg-gray-800 text-white p-2 rounded-full hover:bg-gray-700 transition-colors"
              >
                <FaChevronLeft className="w-4 h-4" />
              </button>
              <div
                className="flex gap-2 overflow-x-auto max-w-[80vw] custom-scrollbar"
                ref={thumbnailContainerRef}
              >
                {imageMessages.map((img, index) => (
                  <img
                    key={img.url}
                    src={img.url}
                    alt={img.fileName}
                    className={`w-16 h-16 object-cover rounded-md cursor-pointer transition-opacity ${
                      index === currentImageIndex
                        ? "opacity-100 border-2 border-blue-500"
                        : "opacity-50 hover:opacity-75"
                    }`}
                    onClick={() => handleThumbnailClick(img.url, index)}
                  />
                ))}
              </div>
              <button
                onClick={handleNextImage}
                className="bg-gray-800 text-white p-2 rounded-full hover:bg-gray-700 transition-colors"
              >
                <FaChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
      {isRecallModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[90%] max-w-sm shadow-xl">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Xác nhận thu hồi
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Bạn có chắc muốn thu hồi tin nhắn này? Hành động này không thể
              hoàn tác.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={handleCloseRecallModal}
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors text-sm"
              >
                Hủy
              </button>
              <button
                onClick={() => handleRecallMessage(messageToRecall)}
                className={`bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm ${
                  isLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={isLoading}
              >
                {isLoading ? "Đang xử lý..." : "Thu hồi"}
              </button>
            </div>
          </div>
        </div>
      )}
      <div ref={chatEndRef} />
    </div>
  );
};

export default ChatMessages;

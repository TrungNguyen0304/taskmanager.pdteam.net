import React, { useEffect, useState, useRef } from "react";
import { BiDotsVerticalRounded } from "react-icons/bi";
import { FaRegEyeSlash } from "react-icons/fa";
import { Edit2, Trash2 } from "lucide-react";
import { MdOutlineGroups2 } from "react-icons/md";
import { IoMdClose } from "react-icons/io";
import { FaArrowDown, FaChevronLeft, FaChevronRight } from "react-icons/fa";

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showToBottom, setShowToBottom] = useState(false);
  const chatContainerRef = useRef(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const thumbnailContainerRef = useRef(null);

  const imageMessages = messages
    .filter((msg) => msg.imageUrl && !msg.hidden)
    .map((msg) => ({
      url: `${BASE_URL}${msg.imageUrl}`,
      fileName: msg.fileName || "Uploaded image",
    }));

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
    setCurrentImageIndex((prev) => {
      const newIndex = prev > 0 ? prev - 1 : imageMessages.length - 1;
      setSelectedImage(imageMessages[newIndex].url);
      return newIndex;
    });
  };

  const handleNextImage = () => {
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
    if (!isModalOpen) return;

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
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, chatEndRef]);

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
    const handleKeyDown = (event) => {
      if (!isModalOpen) return;

      if (event.key === "ArrowLeft") {
        handlePrevImage();
      } else if (event.key === "ArrowRight") {
        handleNextImage();
      } else if (event.key === "Escape") {
        handleCloseModal();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen, imageMessages]);

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

  const handleEditSubmit = (messageId) => {
    if (editText.trim() === "") {
      alert("Tin nhắn không được để trống.");
      return;
    }
    handleSaveEditMessage(messageId);
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
                    <div className="absolute right-0 bottom-2 bg-white border rounded-lg shadow z-50 w-28 sm:w-32">
                      <button
                        onClick={() =>
                          handleStartEditMessage(
                            msg._id,
                            msg.text || msg.imageUrl
                          )
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
                        <FaRegEyeSlash className="w-3 h-3 sm:w-4 sm:h-4" /> Ẩn
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
                        onClick={() => handleEditSubmit(msg._id)}
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
                  <div className="text-xs sm:text-sm">
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
                    {msg.text && <div>{msg.text}</div>}
                  </div>
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
                alt={imageMessages[currentImageIndex].fileName}
                className="max-w-full max-h-[70vh] object-contain rounded-lg cursor-pointer"
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
      <div ref={chatEndRef} />
    </div>
  );
};

export default ChatMessages;

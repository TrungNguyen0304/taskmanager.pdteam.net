import React, { useEffect, useState, useRef } from "react";
import { BiDotsVerticalRounded } from "react-icons/bi";
import { FaRegEyeSlash } from "react-icons/fa";
import { Edit2, Trash2 } from "lucide-react";
import { MdOutlineGroups2 } from "react-icons/md";
import { IoMdClose } from "react-icons/io";
import { FaArrowDown, FaChevronLeft, FaChevronRight, FaFileAlt, FaDownload } from "react-icons/fa";
import { RiResetLeftFill } from "react-icons/ri";
import { v4 as uuidv4 } from "uuid";

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
  handleOpenRecallModal,
  handleRecallMessage,
  handleCloseRecallModal,
  isRecallModalOpen,
  messageToRecall,
  error,
  chatEndRef,
  recallModalRef,
}) => {
  const BASE_URL = "http://localhost:8001";
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showToBottom, setShowToBottom] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const chatContainerRef = useRef(null);
  const thumbnailContainerRef = useRef(null);
  const editInputRef = useRef(null);

  // Lọc tin nhắn trùng lặp và gán uniqueId
  const uniqueMessages = Array.from(
    new Map(messages.map((msg) => [msg._id, msg])).values()
  ).map((msg) => ({
    ...msg,
    uniqueId: msg._id || uuidv4(),
  }));

  // Kiểm tra trùng lặp và log để debug
  useEffect(() => {
    const seenIds = new Set();
    const duplicates = messages.filter((msg) => {
      const id = msg._id || msg.timestamp;
      if (seenIds.has(id)) return true;
      seenIds.add(id);
      return false;
    });
    if (duplicates.length > 0) {
   
    }
  }, [messages]);

  // Lọc các file (ảnh hoặc file khác) để hiển thị trong modal
  const fileMessages = uniqueMessages
    .filter((msg) => msg.fileUrl && !msg.hidden && !msg.isRecalled)
    .map((msg) => ({
      url: `${BASE_URL}${msg.fileUrl}`,
      fileName: msg.fileName || "Uploaded file",
      fileType: msg.fileType || "application/octet-stream",
      fileSize: msg.fileSize ? (msg.fileSize / 1024).toFixed(2) + " KB" : null,
    }));

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    const messageDate = new Date(timestamp);
    const now = new Date();
    const diffMs = now - messageDate;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours >= 24) {
      return `${diffDays} ngày`;
    } else {
      return messageDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  };

  // Kiểm tra xem file có phải là ảnh không
  const isImage = (fileType) => fileType && fileType.startsWith("image/");

  // Xử lý tải file
  const handleDownloadFile = (fileUrl, fileName) => {
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Xử lý nhấp vào file
  const handleFileClick = (file) => {
    setSelectedFile(file);
    setCurrentFileIndex(fileMessages.findIndex((f) => f.url === file.url));
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedFile(null);
    setCurrentFileIndex(0);
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handlePrevFile = () => {
    if (fileMessages.length === 0) return;
    setCurrentFileIndex((prev) => {
      const newIndex = prev > 0 ? prev - 1 : fileMessages.length - 1;
      setSelectedFile(fileMessages[newIndex]);
      return newIndex;
    });
  };

  const handleNextFile = () => {
    if (fileMessages.length === 0) return;
    setCurrentFileIndex((prev) => {
      const newIndex = prev < fileMessages.length - 1 ? prev + 1 : 0;
      setSelectedFile(fileMessages[newIndex]);
      return newIndex;
    });
  };

  const handleThumbnailClick = (file, index) => {
    setSelectedFile(file);
    setCurrentFileIndex(index);
  };

  const handleScrollToBottom = () => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    if (chatEndRef.current && uniqueMessages.length > 0) {
      const lastMessage = uniqueMessages[uniqueMessages.length - 1];
      if (lastMessage.senderId === currentUser._id) {
        chatEndRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [uniqueMessages, chatEndRef, currentUser._id]);

  useEffect(() => {
    const handleScroll = () => {
      if (chatContainerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
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
    if (selectedFile && fileMessages.length > 0) {
      const index = fileMessages.findIndex((f) => f.url === selectedFile.url);
      if (index !== -1) {
        setCurrentFileIndex(index);
      }
    }
  }, [selectedFile, fileMessages]);

  useEffect(() => {
    if (isModalOpen && thumbnailContainerRef.current && fileMessages.length > 1) {
      const selectedThumbnail = thumbnailContainerRef.current.children[currentFileIndex];
      if (selectedThumbnail) {
        selectedThumbnail.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }
    }
  }, [currentFileIndex, isModalOpen, fileMessages.length]);

  useEffect(() => {
    if (editingMessageId && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingMessageId]);

  const handleMenuClick = (messageId) => {
    setOpenMenuId((prev) => (prev === messageId ? null : messageId));
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
      {uniqueMessages.length === 0 ? (
        <div className="text-center text-gray-500 text-xs sm:text-sm">
          Chưa có tin nhắn nào trong nhóm này.
        </div>
      ) : (
        uniqueMessages.map((msg) => {
          const isCurrentUser = msg.senderId === currentUser._id;
          if (msg.system || msg.hidden) {
            return msg.system ? (
              <div
                key={msg.uniqueId}
                className="text-center text-xs italic text-gray-500 mb-3"
              >
                {msg.text}
              </div>
            ) : null;
          }
          return (
            <div
              key={msg.uniqueId}
              className={`mb-4 flex ${isCurrentUser ? "justify-end" : "justify-start"} items-center gap-2 group`}
            >
              {!isCurrentUser && (
                <div
                  className={`max-w-[80%] sm:max-w-[70%] px-3 sm:px-4 py-2 rounded-lg bg-white border border-gray-300 rounded-bl-none shadow ${
                    editingMessageId === msg._id ? "editing-message" : ""
                  }`}
                >
                  <div className="text-xs font-semibold mb-1 text-gray-600">
                    {msg.senderName}
                  </div>
                  <div className="text-xs sm:text-sm">
                    {msg.isRecalled ? (
                      <div className="italic text-gray-400">Tin nhắn đã bị thu hồi</div>
                    ) : (
                      <>
                        {msg.fileUrl && (
                          <div
                            className="flex items-center gap-2 mb-2 p-2 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors"
                            onClick={() =>
                              handleFileClick({
                                url: `${BASE_URL}${msg.fileUrl}`,
                                fileName: msg.fileName,
                                fileType: msg.fileType,
                                fileSize: msg.fileSize ? (msg.fileSize / 1024).toFixed(2) + " KB" : null,
                              })
                            }
                          >
                            {isImage(msg.fileType) ? (
                              <img
                                src={`${BASE_URL}${msg.fileUrl}`}
                                alt={msg.fileName || "Uploaded image"}
                                className="max-w-[200px] sm:max-w-[300px] rounded-lg object-contain"
                              />
                            ) : (
                              <div className="flex items-center gap-2">
                                <FaFileAlt className="w-8 h-8 text-gray-600" />
                                <div>
                                  <p className="text-xs font-medium text-gray-800 truncate max-w-[150px]">
                                    {msg.fileName || "File"}
                                  </p>
                                  {msg.fileSize && (
                                    <p className="text-xs text-gray-500">
                                      {(msg.fileSize / 1024).toFixed(2)} KB
                                    </p>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                        {msg.isEdited && (
                          <span className="text-xs text-gray-400">(Đã chỉnh sửa)</span>
                        )}
                        {msg.text && <div>{msg.text}</div>}
                      </>
                    )}
                    <div className="text-xs text-gray-400 mt-1">
                      {formatTimestamp(msg.timestamp)}
                    </div>
                  </div>
                </div>
              )}
              <div className="relative message-menu">
                <button
                  onClick={() => handleMenuClick(msg._id)}
                  className="p-1 hover:bg-gray-200 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <BiDotsVerticalRounded size={18} className="text-gray-600 sm:w-5 sm:h-5" />
                </button>
                {openMenuId === msg._id && (
                  <div
                    className={`absolute ${isCurrentUser ? "right-8" : "left-8"} bottom-0 bg-white border rounded-lg shadow z-50 w-28 sm:w-32`}
                  >
                    {!msg.isRecalled ? (
                      isCurrentUser ? (
                        <>
                          <button
                            onClick={() => handleStartEditMessage(msg._id, msg.text || "")}
                            className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-gray-100 w-full text-xs sm:text-sm"
                            disabled={msg.isRecalled}
                          >
                            <Edit2 size={12} className="sm:w-4 sm:h-4" /> Chỉnh sửa
                          </button>
                          <button
                            onClick={() => handleOpenRecallModal(msg._id)}
                            className="flex items-center gap-2 px-4 py-2 text-violet-600 hover:bg-gray-100 w-full text-xs sm:text-sm"
                            disabled={msg.isRecalled}
                          >
                            <RiResetLeftFill
                              size={12}
                              className="sm:w-4 sm:h-4"
                            />
                            Thu hồi
                          
                          </button>
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
                        </>
                      ) : (
                        <>
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
                        </>
                      )
                    ) : (
                      <button
                        onClick={() => {
                          handleDeleteMessage(msg._id);
                          setOpenMenuId(null);
                        }}
                        className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-gray-100 w-full text-xs sm:text-sm"
                      >
                        <Trash2 size={12} className="sm:w-4 sm:h-4" /> Xóa
                      </button>
                    )}
                  </div>
                )}
              </div>
              {isCurrentUser && (
                <div
                  className={`max-w-[80%] sm:max-w-[70%] px-3 sm:px-4 py-2 rounded-lg bg-blue-600 text-white rounded-br-none shadow ${
                    editingMessageId === msg._id ? "editing-message" : ""
                  }`}
                >
                  {editingMessageId === msg._id ? (
                    <div className="flex flex-col gap-2">
                      <input
                        type="text"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !isLoading) {
                            handleSaveEditMessage(msg._id);
                          }
                        }}
                        ref={editInputRef}
                        className="w-full border border-gray-300 rounded-lg px-3 py-1 text-xs sm:text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSaveEditMessage(msg._id)}
                          className={`bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 transition-colors text-xs sm:text-sm ${
                            isLoading ? "opacity-50 cursor-not-allowed" : ""
                          }`}
                          disabled={isLoading}
                        >
                          {isLoading ? "Đang lưu..." : "Lưu"}
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
                      {msg.isRecalled ? (
                        <div className="italic text-gray-400">Tin nhắn đã bị thu hồi</div>
                      ) : (
                        <>
                          {msg.fileUrl && (
                            <div
                              className="flex items-center gap-2 mb-2 p-2 bg-blue-700 rounded-lg cursor-pointer hover:bg-blue-800 transition-colors"
                              onClick={() =>
                                handleFileClick({
                                  url: `${BASE_URL}${msg.fileUrl}`,
                                  fileName: msg.fileName,
                                  fileType: msg.fileType,
                                  fileSize: msg.fileSize ? (msg.fileSize / 1024).toFixed(2) + " KB" : null,
                                })
                              }
                            >
                              {isImage(msg.fileType) ? (
                                <img
                                  src={`${BASE_URL}${msg.fileUrl}`}
                                  alt={msg.fileName || "Uploaded image"}
                                  className="max-w-[200px] sm:max-w-[300px] rounded-lg object-contain"
                                />
                              ) : (
                                <div className="flex items-center gap-2">
                                  <FaFileAlt className="w-8 h-8 text-white" />
                                  <div>
                                    <p className="text-xs font-medium text-white truncate max-w-[150px]">
                                      {msg.fileName || "File"}
                                    </p>
                                    {msg.fileSize && (
                                      <p className="text-xs text-gray-300">
                                        {(msg.fileSize / 1024).toFixed(2)} KB
                                      </p>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                          {msg.isEdited && (
                            <span className="text-xs text-gray-400">(Đã chỉnh sửa)</span>
                          )}
                          {msg.text && <div>{msg.text}</div>}
                        </>
                      )}
                      <div className="text-xs text-gray-200 mt-1">
                        {formatTimestamp(msg.timestamp)}
                      </div>
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
      {isModalOpen && selectedFile && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex flex-col z-50">
          <div className="flex-1 flex items-center justify-center">
            <div className="relative max-w-[90vw] max-h-[70vh] mb-20">
              {isImage(selectedFile.fileType) ? (
                <img
                  src={selectedFile.url}
                  alt={selectedFile.fileName || "File"}
                  className="max-w-full max-h-[70vh] object-contain rounded-lg"
                />
              ) : (
                <div className="flex flex-col items-center gap-4 bg-gray-800 p-6 rounded-lg">
                  <FaFileAlt className="w-16 h-16 text-gray-300" />
                  <p className="text-white text-sm font-medium truncate max-w-[300px]">
                    {selectedFile.fileName}
                  </p>
                  {selectedFile.fileSize && (
                    <p className="text-gray-400 text-xs">{selectedFile.fileSize}</p>
                  )}
                  <button
                    onClick={() => handleDownloadFile(selectedFile.url, selectedFile.fileName)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <FaDownload className="w-4 h-4" /> Tải xuống
                  </button>
                </div>
              )}
              <button
                onClick={handleCloseModal}
                className="absolute top-2 right-2 bg-gray-800 text-white rounded-full p-2 hover:bg-gray-700 transition-colors"
              >
                <IoMdClose className="w-5 h-5" />
              </button>
            </div>
          </div>
          {fileMessages.length > 1 && (
            <div className="fixed bottom-0 left-0 right-0 bg-gray-900 bg-opacity-90 py-4 flex items-center justify-center gap-4 z-50">
              <button
                onClick={handlePrevFile}
                className="bg-gray-800 text-white p-2 rounded-full hover:bg-gray-700 transition-colors"
              >
                <FaChevronLeft className="w-4 h-4" />
              </button>
              <div
                className="flex gap-2 overflow-x-auto max-w-[80vw] custom-scrollbar"
                ref={thumbnailContainerRef}
              >
                {fileMessages.map((file, index) => (
                  <div
                    key={file.url}
                    className={`w-16 h-16 rounded-md cursor-pointer transition-opacity ${
                      index === currentFileIndex
                        ? "opacity-100 border-2 border-blue-500"
                        : "opacity-50 hover:opacity-75"
                    }`}
                    onClick={() => handleThumbnailClick(file, index)}
                  >
                    {isImage(file.fileType) ? (
                      <img
                        src={file.url}
                        alt={file.fileName}
                        className="w-full h-full object-cover rounded-md"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-700 flex items-center justify-center rounded-md">
                        <FaFileAlt className="w-8 h-8 text-gray-300" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <button
                onClick={handleNextFile}
                className="bg-gray-800 text-white p-2 rounded-full hover:bg-gray-700 transition-colors"
              >
                <FaChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
      {isRecallModalOpen && (
        <div
          ref={recallModalRef}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        >
          <div className="bg-white rounded-lg p-6 w-[90%] max-w-sm shadow-xl">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Xác nhận thu hồi</h3>
            <p className="text-sm text-gray-600 mb-6">
              Bạn có chắc muốn thu hồi tin nhắn này? Hành động này không thể hoàn tác.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={handleCloseRecallModal}
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors text-sm"
                disabled={isLoading}
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

import React, { useState, useEffect } from "react";
import { Send, Plus } from "lucide-react";
import { BiSolidImage } from "react-icons/bi";
import { IoMdClose } from "react-icons/io";

const ChatInput = ({
  inputText,
  setInputText,
  handleSendMessage,
  handleFileChange,
  showFileInput,
  setShowFileInput,
  isUploading,
  setError, // Add setError to props
}) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSending, setIsSending] = useState(false); // Thêm trạng thái để ngăn trùng lặp

  const handleInputChange = (e) => {
    setInputText(e.target.value);
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (max 5MB) and type
    if (file.size > 5 * 1024 * 1024) {
      setError("Kích thước tệp vượt quá 5MB");
      return;
    }
    if (!file.type.startsWith("image/")) {
      setError("Vui lòng chọn một tệp hình ảnh");
      return;
    }

    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
    setShowFileInput(false);
  };

  const handleSend = async (source) => {
    // Ngăn gửi nếu đang trong quá trình gửi hoặc tải lên
    if (isSending || isUploading) return;

    setIsSending(true); // Đánh dấu đang gửi
    try {
      if (selectedImage) {
        // Trigger file upload and wait for completion
        await handleFileChange({ target: { files: [selectedImage] } });
        setSelectedImage(null);
        if (imagePreview) URL.revokeObjectURL(imagePreview);
        setImagePreview(null);
      } else if (inputText.trim()) {
        handleSendMessage();
        setInputText("");
      }
    } finally {
      setIsSending(false); // Đặt lại trạng thái sau khi gửi xong
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && (inputText.trim() || selectedImage) && !isUploading && !isSending) {
      handleSend("keyboard"); // Gọi handleSend với nguồn là bàn phím
    }
  };

  const handleClickSend = () => {
    if ((inputText.trim() || selectedImage) && !isUploading && !isSending) {
      handleSend("mouse"); // Gọi handleSend với nguồn là chuột
    }
  };

  const handleCancelImage = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setSelectedImage(null);
    setImagePreview(null);
  };

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  return (
    <div className="border-t bg-white px-4 py-3 sm:px-6 sm:py-4 flex flex-col gap-2">
      {imagePreview && (
        <div className="relative max-w-[220px] bg-white border border-gray-200 p-2 rounded-xl shadow-sm flex items-center justify-center">
          <img
            src={imagePreview}
            alt="Preview"
            className="max-w-full rounded-lg object-cover"
          />
          <button
            onClick={handleCancelImage}
            className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-7 h-7 flex items-center justify-center shadow transition"
            title="Hủy"
            type="button"
            disabled={isUploading}
          >
            <IoMdClose className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="flex items-center gap-2 sm:gap-3">
        <div className="relative">
          <button
            onClick={() => setShowFileInput(!showFileInput)}
            className="bg-gray-100 text-gray-700 p-2 rounded-full hover:bg-gray-200 transition-all duration-200"
            title="Tải lên file"
            disabled={isUploading}
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
                  onChange={handleImageSelect}
                  disabled={isUploading}
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
          onKeyDown={handleKeyDown}
          className="flex-1 border border-gray-200 rounded-full px-3 sm:px-4 py-2 text-xs sm:text-sm bg-gray-50 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
          disabled={isUploading}
        />

        <button
          onClick={handleClickSend} // Sử dụng hàm riêng cho click
          disabled={(!inputText.trim() && !selectedImage) || isUploading || isSending}
          className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 disabled:bg-blue-300 transition-colors duration-200"
          title="Gửi"
        >
          <Send className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>
    </div>
  );
};

export default ChatInput;
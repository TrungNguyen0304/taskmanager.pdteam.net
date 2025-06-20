import React, { useState } from "react";
import { Send, Plus, X } from "lucide-react";
import { BiSolidImage } from "react-icons/bi";

const ChatInput = ({
  inputText,
  setInputText,
  handleSendMessage,
  handleFileChange,
  showFileInput,
  setShowFileInput,
  setError, // Thêm prop để hiển thị lỗi
}) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleInputChange = (e) => {
    setInputText(e.target.value);
  };

  const onFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setShowFileInput(false);
      handleFileChange(file);
    }
  };

  const onSendMessage = () => {
    if (inputText.trim() || selectedFile) {
      handleSendMessage(inputText, selectedFile);
      setInputText("");
      setSelectedFile(null);
      setPreviewUrl(null);
    } else {
      setError("Vui lòng nhập tin nhắn hoặc chọn hình ảnh");
    }
  };

  const removeImage = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  return (
    <div className="border-t bg-white px-4 py-3 sm:px-6 sm:py-4 flex flex-col gap-2">
      <div className="flex items-center gap-2 sm:gap-3">
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
                  onChange={onFileChange}
                />
              </label>
            </div>
          )}
        </div>

        <input
          type="text"
          placeholder={selectedFile ? "Nhập tin nhắn kèm ảnh..." : "Nhập tin nhắn..."}
          value={inputText}
          onChange={handleInputChange}
          onKeyDown={(e) => {
            if (e.key === "Enter") onSendMessage();
          }}
          className="flex-1 border border-gray-200 rounded-full px-3 sm:px-4 py-2 text-xs sm:text-sm bg-gray-50 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
        />

        <button
          onClick={onSendMessage}
          disabled={!inputText.trim() && !selectedFile}
          className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 disabled:bg-blue-300 transition-colors duration-200"
          title="Gửi tin nhắn"
        >
          <Send className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>

      {previewUrl && (
        <div className="relative flex items-center gap-2 mt-2">
          <img
            src={previewUrl}
            alt="Image preview"
            className="max-w-[80px] max-h-[80px] object-contain rounded-md border border-gray-200"
          />
          <button
            onClick={removeImage}
            className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-all duration-200"
            title="Xóa ảnh"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default ChatInput;
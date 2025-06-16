import React from "react";
import { Send, Plus } from "lucide-react";
import { BiSolidImage } from "react-icons/bi";

const ChatInput = ({
  inputText,
  setInputText,
  handleSendMessage,
  handleFileChange,
  showFileInput,
  setShowFileInput,
}) => {
  const handleInputChange = (e) => {
    setInputText(e.target.value);
  };

  return (
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
  );
};

export default ChatInput;
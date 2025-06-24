import React, { useState } from "react";
import { Send, Plus, X } from "lucide-react";
import { BiSolidFile } from "react-icons/bi";
import { FaFileAlt } from "react-icons/fa";

const ChatInput = ({
  inputText,
  setInputText,
  handleSendMessage,
  handleFileChange,
  showFileInput,
  setShowFileInput,
  setError,
}) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [fileType, setFileType] = useState(null);

  const handleInputChange = (e) => {
    setInputText(e.target.value);
  };

  const onFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setFileType(file.type);
      setPreviewUrl(file.type.startsWith("image/") ? URL.createObjectURL(file) : null);
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
      setFileType(null);
    } else {
      setError("Vui lòng nhập tin nhắn hoặc chọn file");
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setFileType(null);
  };

  const isImage = (type) => type && type.startsWith("image/");

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
                <BiSolidFile className="text-base sm:text-xl" />
                Tải file lên
                <input
                  type="file"
                  accept="*/*" // Chấp nhận mọi loại file
                  className="hidden"
                  onChange={onFileChange}
                />
              </label>
            </div>
          )}
        </div>

        <input
          type="text"
          placeholder={selectedFile ? "Nhập tin nhắn kèm file..." : "Nhập tin nhắn..."}
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

      {selectedFile && (
        <div className="relative flex items-center gap-2 mt-2 p-2 bg-gray-100 rounded-md">
          {isImage(fileType) ? (
            <img
              src={previewUrl}
              alt="File preview"
              className="max-w-[80px] max-h-[80px] object-contain rounded-md border border-gray-200"
            />
          ) : (
            <div className="flex items-center gap-2">
              <FaFileAlt className="w-8 h-8 text-gray-600" />
              <div>
                <p className="text-xs font-medium text-gray-800 truncate max-w-[150px]">
                  {selectedFile.name || "File"}
                </p>
                <p className="text-xs text-gray-500">
                  {(selectedFile.size / 1024).toFixed(2)} KB
                </p>
              </div>
            </div>
          )}
          <button
            onClick={removeFile}
            className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-all duration-200"
            title="Xóa file"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default ChatInput;
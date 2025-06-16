import React from "react";
import { MoreVertical, X, Users, ChevronDown } from "lucide-react";
import ChatHeader from "./ChatHeader";
import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput";

const ChatMemberMain = ({
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
  currentUser,
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
  error,
  navigate,
}) => {
  return (
    <div className="relative flex flex-col h-full bg-white sm:shadow-lg sm:rounded-r-xl overflow-hidden w-full mx-auto">
      <ChatHeader
        selectedGroup={selectedGroup}
        typingUsers={typingUsers}
        navigate={navigate}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <ChatMessages
        messages={messages}
        currentUser={currentUser}
        openMenuId={openMenuId}
        setOpenMenuId={setOpenMenuId}
        editingMessageId={editingMessageId}
        editText={editText}
        setEditText={setEditText}
        handleStartEditMessage={handleStartEditMessage}
        handleSaveEditMessage={handleSaveEditMessage}
        handleCancelEdit={handleCancelEdit}
        handleDeleteMessage={handleDeleteMessage}
        handleHideMessage={handleHideMessage}
        error={error}
        chatEndRef={chatEndRef}
      />

      <ChatInput
        inputText={inputText}
        setInputText={setInputText}
        handleSendMessage={handleSendMessage}
        handleFileChange={handleFileChange}
        showFileInput={showFileInput}
        setShowFileInput={setShowFileInput}
      />

      {/* Right Sidebar (Slides in from Right) */}
      {sidebarOpen && (
        <>
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
                  {selectedGroup.members.map((member) => (
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
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatMemberMain;
import React, { useEffect } from "react";
import { MoreVertical, X, Users, ChevronDown, Trash2 } from "lucide-react";
import axios from "axios";
import ChatHeader from "./ChatHeader";
import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput";

const ChatMainMember = ({
  selectedGroup,
  messages,
  setMessages,
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
  selectedMemberIndex,
  setSelectedMemberIndex,
  handleRemoveMember,
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
  handleOpenRecallModal,
  handleRecallMessage,
  handleCloseRecallModal,
  isRecallModalOpen,
  messageToRecall,
  chatEndRef,
  recallModalRef,
  error,
  setError,
  navigate,
}) => {
  useEffect(() => {}, [isRecallModalOpen, messageToRecall]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedGroup?._id) return;
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `https://apitaskmanager.pdteam.net/api/group/${selectedGroup._id}/messages`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const transformedMessages = response.data.map((msg) => ({
          ...msg,
          text: msg.message,
        }));
        setMessages(transformedMessages);
        setError(null);
      } catch (error) {
        console.error("Error fetching messages:", error);
        setError("Không thể tải tin nhắn. Vui lòng thử lại.");
      }
    };
    fetchMessages();
  }, [selectedGroup?._id, setMessages, setError]);

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
        setMessages={setMessages}
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
        handleOpenRecallModal={handleOpenRecallModal}
        handleRecallMessage={handleRecallMessage}
        handleCloseRecallModal={handleCloseRecallModal}
        isRecallModalOpen={isRecallModalOpen}
        messageToRecall={messageToRecall}
        error={error}
        setError={setError}
        chatEndRef={chatEndRef}
        recallModalRef={recallModalRef}
      />

      <ChatInput
        inputText={inputText}
        setInputText={setInputText}
        handleSendMessage={handleSendMessage}
        handleFileChange={handleFileChange}
        showFileInput={showFileInput}
        setShowFileInput={setShowFileInput}
      />

      {sidebarOpen && (
        <>
          {/* backdrop */}
          <div
            className="fixed inset-0 bg-black/50 sm:hidden z-40"
            onClick={() => setSidebarOpen(false)}
          />
          {/* side panel */}
          <div
            className={`fixed top-0 right-0 h-full w-64 sm:w-72 bg-white border-l shadow-xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out ${
              sidebarOpen ? "translate-x-0" : "translate-x-full"
            }`}
          >
            {/* user header */}
            <div className="flex items-center justify-between px-4 py-4 border-b bg-gray-50">
              <div>
                <h1 className="font-bold text-gray-800 text-base sm:text-lg flex items-center gap-2">
                  {currentUser.name}
                  {onlineUsers.has(currentUser._id) && (
                    <span className="w-2 h-2 bg-green-500 rounded-full" />
                  )}
                </h1>
                <p className="flex items-center text-xs text-gray-600">
                  <span className="bg-green-500 w-2 h-2 rounded-full mr-1" />
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

            {/* body */}
            <div className="p-4 flex flex-col gap-4 flex-1 overflow-y-auto custom-scrollbar">
              {/* toggle member list */}
              <button
                onClick={() => setShowMembers(!showMembers)}
                className="flex items-center justify-between w-full px-4 py-2 bg-gray-50 border rounded-lg hover:bg-gray-100 transition-colors"
              >
                <span className="flex items-center gap-2 text-gray-800 text-sm sm:text-base">
                  <Users size={14} className="sm:w-5 sm:h-5" />
                  Thành viên ({selectedGroup.members.length})
                </span>
                <ChevronDown
                  size={14}
                  className={`sm:w-5 sm:h-5 ${
                    showMembers ? "rotate-180" : ""
                  } transition-transform text-gray-600`}
                />
              </button>

              {/* member list */}
              {showMembers && (
                <div className="bg-gray-50 p-3 rounded-lg border space-y-3 max-h-60 overflow-y-auto custom-scrollbar">
                  {selectedGroup.members.map((member, index) => (
                    <div
                      key={member._id}
                      className="flex justify-between items-center text-xs sm:text-sm text-gray-800"
                    >
                      <span className="flex items-center gap-2">
                        {member.name}
                        {onlineUsers.has(member._id) && (
                          <span className="w-2 h-2 bg-green-500 rounded-full" />
                        )}
                      </span>

                      {member._id !== currentUser._id && (
                        <div className="relative">
                          <button
                            onClick={() =>
                              setSelectedMemberIndex((prev) =>
                                prev === index ? null : index
                              )
                            }
                            className="hover:bg-gray-100 rounded p-1 transition-colors"
                          >
                            <MoreVertical
                              size={14}
                              className="text-gray-600 sm:w-5 sm:h-5"
                            />
                          </button>

                          {selectedMemberIndex === index && (
                            <div className="absolute right-6 -top-1 bg-white border rounded-lg shadow z-10">
                              <button
                                onClick={() => handleRemoveMember(index)}
                                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-gray-100 w-full text-xs sm:text-sm"
                              >
                                <Trash2 size={12} className="sm:w-4 sm:h-4" />
                                Xóa
                              </button>
                            </div>
                          )}
                        </div>
                      )}
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

export default ChatMainMember;

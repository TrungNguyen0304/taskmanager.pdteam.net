import React from "react";
import {
  MoreVertical,
  X,
  UserPlus,
  Users,
  ChevronDown,
  Trash2,
} from "lucide-react";
import ChatHeader from "./ChatHeader";
import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput";
import axios from "axios";

const ChatMain = ({
  selectedGroup,
  messages,
  setMessages,
  inputText,
  setInputText,
  handleSendMessage,
  showFileInput,
  setShowFileInput,
  sidebarOpen,
  setSidebarOpen,
  showMembers,
  setShowMembers,
  addingMember,
  setAddingMember,
  newMemberId,
  setNewMemberId,
  selectedMemberIndex,
  setSelectedMemberIndex,
  handleConfirmAdd,
  handleRemoveMember,
  handleLeaveGroup,
  currentUser,
  teamMembers,
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
  addMemberRef,
  error,
  setError,
  navigate,
  isUploading,
  setIsUploading,
}) => {
  // Handle image upload with loading state
  const customHandleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !selectedGroup?._id) {
      setError("Không có tệp hoặc nhóm được chọn");
      return;
    }

    // Validate file size (e.g., max 5MB) and type
    if (file.size > 5 * 1024 * 1024) {
      setError("Kích thước tệp vượt quá 5MB");
      return;
    }
    if (!file.type.startsWith("image/")) {
      setError("Vui lòng chọn một tệp hình ảnh");
      return;
    }

    try {
      setIsUploading(true);
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("image", file); // Use "image" to match backend middleware

      const response = await axios.post(
        `http://localhost:8001/api/group/${selectedGroup._id}/sendImageMessage`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Update messages state with the response, but check for duplicates
      setMessages((prev) => {
        if (prev.some((msg) => msg._id === response.data._id)) return prev;
        return [
          ...prev,
          {
            _id: response.data._id,
            senderId: response.data.senderId,
            senderName: response.data.senderName,
            imageUrl: response.data.imageUrl,
            fileName: response.data.fileName,
            fileSize: response.data.fileSize,
            fileId: response.data.fileId,
            fileType: response.data.fileType,
            timestamp: new Date(response.data.timestamp),
            system: false,
            hidden: false,
          },
        ];
      });

      setShowFileInput(false);
      setIsUploading(false);
    } catch (err) {
      setIsUploading(false);
      setError(err.response?.data?.message || "Lỗi khi gửi hình ảnh");
    }
  };

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
        isUploading={isUploading}
      />

      <ChatInput
        inputText={inputText}
        setInputText={setInputText}
        handleSendMessage={handleSendMessage}
        handleFileChange={customHandleFileChange}
        showFileInput={showFileInput}
        setShowFileInput={setShowFileInput}
        isUploading={isUploading}
      />

      {/* Right Sidebar */}
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

            <div className="p-4 flex flex-col gap-4 flex-1">
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
                  {selectedGroup.members.map((member, index) => (
                    <div
                      key={member._id}
                      className="flex justify-between items-center text-xs sm:text-sm text-gray-800"
                    >
                      <span className="flex items-center gap-2">
                        {member.name} {member.role ? `(${member.role})` : ""}
                        {onlineUsers.has(member._id) && (
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
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
                                <Trash2 size={12} className="sm:w-4 sm:h-4" />{" "}
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

              <div ref={addMemberRef}>
                <button
                  onClick={() => setAddingMember(!addingMember)}
                  className="flex items-center gap-2 text-sm sm:text-base bg-gray-50 border rounded-lg hover:bg-gray-100 px-4 py-2 w-full transition-colors"
                >
                  <UserPlus size={14} className="sm:w-5 sm:h-5" /> Thêm thành
                  viên
                </button>
                {addingMember && (
                  <div className="flex gap-2 mt-3 items-center">
                    <select
                      value={newMemberId}
                      onChange={(e) => setNewMemberId(e.target.value)}
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Chọn thành viên</option>
                      {teamMembers
                        .filter(
                          (m) =>
                            !selectedGroup.members.some(
                              (member) => member._id === m._id
                            )
                        )
                        .map((member) => (
                          <option key={member._id} value={member._id}>
                            {member.name}{" "}
                            {member.role ? `(${member.role})` : ""}
                          </option>
                        ))}
                    </select>
                    <button
                      onClick={handleConfirmAdd}
                      className="bg-green-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-xs sm:text-sm"
                    >
                      Thêm
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={handleLeaveGroup}
                className="mt-auto bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
              >
                Rời nhóm
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatMain;

import React, { useContext, useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { SocketContext } from "../../../context/SocketContext";
import axios from "axios";
import ChatSidebar from "./ChatSidebar";
import ChatMain from "./ChatMain";
import ChatHomeOut from "./ChatHomeOut";

const API_URL = "http://localhost:8001/api/group";
const LEADER_API_URL = "http://localhost:8001/api/company/showallLeaders";
const MEMBER_API_URL = "http://localhost:8001/api/company/showallMember";

const Chat = () => {
  const socket = useContext(SocketContext);
  const navigate = useNavigate();
  const chatEndRef = useRef(null);
  const addMemberRef = useRef(null);
  const createGroupRef = useRef(null);
  const recallModalRef = useRef(null); // Thêm ref cho modal thu hồi

  const currentUser = JSON.parse(localStorage.getItem("user")) || {
    _id: "",
    name: "Guest",
  };

  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showMembers, setShowMembers] = useState(true);
  const [addingMember, setAddingMember] = useState(false);
  const [newMemberId, setNewMemberId] = useState("");
  const [selectedMemberIndex, setSelectedMemberIndex] = useState(null);
  const [hasLeftGroup, setHasLeftGroup] = useState(false);
  const [creatingGroup, setCreatingGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupMembers, setNewGroupMembers] = useState([]);
  const [error, setError] = useState(null);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [openMenuId, setOpenMenuId] = useState(null);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editText, setEditText] = useState("");
  const [showFileInput, setShowFileInput] = useState(false);
  const [isRecallModalOpen, setIsRecallModalOpen] = useState(false);
  const [messageToRecall, setMessageToRecall] = useState(null);

  // Lấy danh sách nhóm và thành viên đội
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(API_URL, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const fetchedGroups = res.data.map((group) => ({
          ...group,
          members: group.members || [],
        }));
        setGroups(fetchedGroups);
        if (fetchedGroups.length > 0 && !selectedGroup) {
          setSelectedGroup(fetchedGroups[0]);
        }
      } catch (err) {
        setError(err.response?.data?.message || "Không thể lấy danh sách nhóm");
      }
    };

    const fetchTeamMembers = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Không tìm thấy token. Vui lòng đăng nhập lại.");
          return;
        }

        // Gọi API showallLeaders
        const leaderResponse = await axios.get(LEADER_API_URL, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const leaders = leaderResponse.data.leaders || [];

        // Gọi API showallMember
        const memberResponse = await axios.get(MEMBER_API_URL, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const members = memberResponse.data.members || [];

        // Kết hợp danh sách leaders và members
        const combinedMembers = [
          ...leaders.map((leader) => ({
            _id: leader._id,
            name: leader.name,
            role: leader.role,
          })),
          ...members.map((member) => ({
            _id: member._id,
            name: member.name,
            role: member.role,
          })),
        ];

        // Loại bỏ các thành viên trùng lặp dựa trên _id
        const uniqueMembers = Array.from(
          new Map(combinedMembers.map((item) => [item._id, item])).values()
        );

        setTeamMembers(uniqueMembers);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Không thể lấy danh sách Leaders và Members"
        );
      }
    };

    fetchGroups();
    fetchTeamMembers();
  }, []);

  // Xử lý tham gia/rời nhóm và lấy tin nhắn
  useEffect(() => {
    if (!selectedGroup?._id || !socket || !socket.connected) return;

    socket.emit("join-group", {
      userId: currentUser._id,
      groupId: selectedGroup._id,
    });

    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_URL}/${selectedGroup._id}/messages`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMessages(
          res.data.map((msg) => ({
            _id: msg._id,
            senderId: msg.senderId,
            senderName: msg.senderName || "System",
            text: msg.message,
            fileUrl: msg.fileUrl,
            fileName: msg.fileName,
            fileSize: msg.fileSize,
            fileType: msg.fileType,
            fileId: msg.fileId,
            timestamp: msg.timestamp,
            system: msg.senderId === "System",
            hidden: false,
            isRecalled: msg.isRecalled || false,
            isEdited: msg.isEdited || false,
          }))
        );
      } catch (err) {
        setError(err.response?.data?.message || "Không thể lấy tin nhắn");
      }
    };

    fetchMessages();

    return () => {
      if (selectedGroup?._id && socket && socket.connected) {
        socket.emit("leave-group", {
          userId: currentUser._id,
          groupId: selectedGroup._id,
        });
      }
    };
  }, [socket, selectedGroup?._id, currentUser._id]);

  // Xử lý các sự kiện socket
  useEffect(() => {
    if (!socket || !socket.connected) return;

    socket.on("user-online", (userId) => {
      setOnlineUsers((prev) => new Set(prev).add(userId));
    });

    socket.on("user-offline", (userId) => {
      setOnlineUsers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    });

    socket.on("group-message", (msg) => {
      setMessages((prev) => [
        ...prev,
        {
          _id: msg._id || Date.now(),
          senderId: msg.senderId,
          senderName: msg.senderName || "System",
          text: msg.message,
          fileUrl: msg.fileUrl,
          fileName: msg.fileName,
          fileSize: msg.fileSize,
          fileType: msg.fileType,
          fileId: msg.fileId,
          timestamp: msg.timestamp,
          system: msg.senderId === "System",
          hidden: false,
          isRecalled: false,
          isEdited: false,
        },
      ]);
    });

    socket.on("new-member", ({ groupId, memberName, isLeaving }) => {
      if (groupId === selectedGroup?._id) {
        const systemMessage = {
          _id: Date.now(),
          senderId: "System",
          senderName: "System",
          text: isLeaving
            ? `Người dùng ${memberName} đã rời nhóm`
            : `Người dùng ${memberName} đã tham gia nhóm`,
          timestamp: new Date().toISOString(),
          system: true,
          hidden: false,
        };
        setMessages((prev) => [...prev, systemMessage]);
        const fetchGroupData = async () => {
          try {
            const token = localStorage.getItem("token");
            const res = await axios.get(API_URL, {
              headers: { Authorization: `Bearer ${token}` },
            });
            const updatedGroup = res.data.find((g) => g._id === groupId);
            if (updatedGroup) {
              setSelectedGroup({
                ...updatedGroup,
                members: updatedGroup.members || [],
              });
            }
          } catch (err) {
            setError("Không thể cập nhật thông tin nhóm");
          }
        };
        fetchGroupData();
      }
    });

    socket.on("typing", ({ userId }) => {
      setTypingUsers((prev) => new Set(prev).add(userId));
      setTimeout(() => {
        setTypingUsers((prev) => {
          const newSet = new Set(prev);
          newSet.delete(userId);
          return newSet;
        });
      }, 3000);
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
                fileUrl: null,
              }
            : msg
        )
      );
      if (recalledMessage.messageId === messageToRecall) {
        setIsRecallModalOpen(false);
        setMessageToRecall(null);
      }
    });

    socket.on("message-deleted", ({ messageId, onlyFor }) => {
      if (onlyFor === currentUser._id) {
        setMessages((prevMessages) =>
          prevMessages.filter((msg) => msg._id !== messageId)
        );
      }
    });

    return () => {
      socket.off("user-online");
      socket.off("user-offline");
      socket.off("group-message");
      socket.off("new-member");
      socket.off("typing");
      socket.off("message-edited");
      socket.off("message-recalled");
      socket.off("message-deleted");
    };
  }, [socket, selectedGroup?._id, currentUser._id, messageToRecall]);

  // Cuộn xuống tin nhắn mới nhất
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Xử lý click ngoài để đóng menu và modal
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        addMemberRef.current &&
        !addMemberRef.current.contains(e.target) &&
        createGroupRef.current &&
        !createGroupRef.current.contains(e.target) &&
        recallModalRef.current &&
        !recallModalRef.current.contains(e.target) &&
        !e.target.closest(".message-menu")
      ) {
        setAddingMember(false);
        setCreatingGroup(false);
        setOpenMenuId(null);
        setEditingMessageId(null);
        setIsRecallModalOpen(false);
        setMessageToRecall(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleFileChange = (file) => {
    if (!file || !selectedGroup?._id) {
      setError("Vui lòng chọn file và nhóm");
      return;
    }
    setSelectedFile(file);
    setShowFileInput(false);
  };

  const handleSendMessage = async (text, file) => {
    if (!selectedGroup?._id) {
      setError("Vui lòng chọn nhóm");
      return;
    }
    if (!text.trim() && !file) {
      setError("Vui lòng nhập tin nhắn hoặc chọn file");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      if (file) {
        formData.append("file", file);
      }
      if (text.trim()) {
        formData.append("message", text.trim());
      }
      const response = await axios.post(
        `${API_URL}/${selectedGroup._id}/messages`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      const msg = response.data;
      socket.emit("group-message", {
        _id: msg._id,
        groupId: selectedGroup._id,
        senderId: currentUser._id,
        senderName: currentUser.name,
        message: text.trim(),
        fileUrl: msg.fileUrl,
        fileName: file?.name,
        fileSize: file?.size,
        fileType: file?.type,
        fileId: msg.fileId,
        timestamp: msg.timestamp,
      });
      setInputText("");
      setSelectedFile(null);
      setShowFileInput(false);
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi khi gửi tin nhắn hoặc file");
    }
  };

  const handleConfirmAdd = async () => {
    if (!newMemberId || !selectedGroup?._id) {
      setError("Vui lòng chọn thành viên để thêm");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${API_URL}/${selectedGroup._id}/members`,
        { userId: newMemberId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSelectedGroup({
        ...res.data.group,
        members: res.data.group.members || [],
      });
      socket.emit("new-member", {
        groupId: selectedGroup._id,
        memberName: teamMembers.find((m) => m._id === newMemberId)?.name,
        isLeaving: false,
      });
      setNewMemberId("");
      setAddingMember(false);
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi khi thêm thành viên");
    }
  };

  const handleRemoveMember = async (index) => {
    const member = selectedGroup.members[index];
    if (!member) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `${API_URL}/${selectedGroup._id}/members/${member._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSelectedGroup((prev) => ({
        ...prev,
        members: prev.members.filter((_, i) => i !== index),
      }));
      socket.emit("new-member", {
        groupId: selectedGroup._id,
        memberName: member.name,
        isLeaving: true,
      });
      setSelectedMemberIndex(null);
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi khi xóa thành viên");
    }
  };

  const handleLeaveGroup = async () => {
    if (!selectedGroup?._id) return;
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Không tìm thấy token. Vui lòng đăng nhập lại.");
        return;
      }
      await axios.delete(`${API_URL}/${selectedGroup._id}/leave`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGroups((prev) => prev.filter((group) => group._id !== selectedGroup._id));
      setSelectedGroup(null);
      setHasLeftGroup(true);
      if (socket && socket.connected) {
        socket.emit("leave-group", {
          userId: currentUser._id,
          groupId: selectedGroup._id,
        });
        socket.emit("new-member", {
          groupId: selectedGroup._id,
          memberName: currentUser.name,
          isLeaving: true,
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi khi rời nhóm");
      if (err.response?.status === 401) {
        setError("Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.");
      }
    }
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim() || newGroupMembers.length === 0) {
      setError("Tên nhóm và danh sách thành viên là bắt buộc");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${API_URL}/create`,
        { name: newGroupName, members: [...newGroupMembers, currentUser._id] },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const newGroup = {
        ...res.data.group,
        members: res.data.group.members || [],
      };
      setGroups((prev) => [...prev, newGroup]);
      setSelectedGroup(newGroup);
      setMessages([
        {
          _id: Date.now(),
          senderId: "System",
          senderName: "System",
          text: `Nhóm "${newGroup.name}" đã được tạo.`,
          timestamp: new Date().toISOString(),
          system: true,
          hidden: false,
        },
      ]);
      setNewGroupName("");
      setNewGroupMembers([]);
      setCreatingGroup(false);
      if (socket && socket.connected) {
        socket.emit("join-group", {
          userId: currentUser._id,
          groupId: newGroup._id,
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi khi tạo nhóm");
    }
  };

  const handleDeleteMessage = async (messageId) => {
    const message = messages.find((msg) => msg._id === messageId);
    if (!message) {
      setError("Tin nhắn không tồn tại.");
      return;
    }
    if (!selectedGroup?._id) {
      setError("Không tìm thấy ID nhóm.");
      return;
    }
    if (message.isRecalled && message.senderId !== currentUser._id) {
      setError("Bạn không thể xóa tin nhắn đã thu hồi của người khác.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Vui lòng đăng nhập lại để xóa tin nhắn.");
        return;
      }
      await axios.delete(
        `${API_URL}/${selectedGroup._id}/messages/${messageId}/delete`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMessages((prevMessages) =>
        prevMessages.filter((msg) => msg._id !== messageId)
      );
      socket.emit("message-deleted", {
        messageId,
        onlyFor: currentUser._id,
      });
      setError(null);
      setOpenMenuId(null);
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi khi xóa tin nhắn");
    }
  };

  const handleRecallMessage = async (messageId) => {
    const message = messages.find((msg) => msg._id === messageId);
    if (!message) {
      setError("Tin nhắn không tồn tại.");
      setIsRecallModalOpen(false);
      setMessageToRecall(null);
      return;
    }
    if (!selectedGroup?._id) {
      setError("Không tìm thấy ID nhóm.");
      setIsRecallModalOpen(false);
      setMessageToRecall(null);
      return;
    }
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Vui lòng đăng nhập lại để thu hồi tin nhắn.");
      setIsRecallModalOpen(false);
      setMessageToRecall(null);
      return;
    }

    try {
      await axios.delete(
        `${API_URL}/${selectedGroup._id}/messages/${messageId}/recall`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg._id === messageId
            ? {
                ...msg,
                isRecalled: true,
                text: "Tin nhắn đã bị thu hồi",
                fileUrl: null,
              }
            : msg
        )
      );
      socket.emit("message-recalled", {
        messageId,
        message: "Tin nhắn đã bị thu hồi",
        isRecalled: true,
      });
      setError(null);
      setIsRecallModalOpen(false);
      setMessageToRecall(null);
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi khi thu hồi tin nhắn");
    }
  };

  const handleEditSubmit = async (messageId) => {
    if (!editText.trim()) {
      setError("Tin nhắn không được để trống.");
      return;
    }
    try {
      const message = messages.find((msg) => msg._id === messageId);
      if (!message) {
        throw new Error("Tin nhắn không tồn tại trong danh sách.");
      }
      if (message.isRecalled) {
        throw new Error("Tin nhắn đã bị thu hồi, không thể chỉnh sửa.");
      }
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Vui lòng đăng nhập lại để chỉnh sửa tin nhắn.");
        return;
      }
      await axios.put(
        `${API_URL}/${selectedGroup._id}/messages/${messageId}/edit`,
        { newMessage: editText },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
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
      socket.emit("message-edited", {
        messageId,
        message: editText,
        isEdited: true,
      });
      setEditingMessageId(null);
      setEditText("");
      setError(null);
      setOpenMenuId(null);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Lỗi khi chỉnh sửa tin nhắn");
    }
  };

  const handleOpenRecallModal = (messageId) => {
    setMessageToRecall(messageId);
    setIsRecallModalOpen(true);
    setOpenMenuId(null);
  };

  const handleCloseRecallModal = () => {
    setIsRecallModalOpen(false);
    setMessageToRecall(null);
  };

  const handleHideMessage = (messageId) => {
    setMessages((prev) =>
      prev.map((msg) => (msg._id === messageId ? { ...msg, hidden: true } : msg))
    );
    setOpenMenuId(null);
  };

  const handleStartEditMessage = (messageId, text) => {
    const message = messages.find((msg) => msg._id === messageId);
    if (!message) {
      setError("Tin nhắn không tồn tại.");
      return;
    }
    if (message.isRecalled) {
      setError("Tin nhắn đã bị thu hồi, không thể chỉnh sửa.");
      return;
    }
    setEditingMessageId(messageId);
    setEditText(text);
    setOpenMenuId(null);
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditText("");
  };

  const handleTyping = () => {
    if (selectedGroup?._id && socket && socket.connected) {
      socket.emit("typing", { userId: currentUser._id, groupId: selectedGroup._id });
    }
  };

  if (hasLeftGroup) {
    return <ChatHomeOut onBackToChat={() => setHasLeftGroup(false)} />;
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100 sm:flex-row">
      {error && (
        <div className="absolute top-0 left-0 w-full bg-red-500 text-white p-2 text-center">
          {error}
          <button className="ml-2" onClick={() => setError(null)}>
            X
          </button>
        </div>
      )}
      <ChatSidebar
        groups={groups}
        setSelectedGroup={setSelectedGroup}
        selectedGroup={selectedGroup}
        teamMembers={teamMembers}
        creatingGroup={creatingGroup}
        setCreatingGroup={setCreatingGroup}
        newGroupName={newGroupName}
        setNewGroupName={setNewGroupName}
        newGroupMembers={newGroupMembers}
        setNewGroupMembers={setNewGroupMembers}
        handleCreateGroup={handleCreateGroup}
        createGroupRef={createGroupRef}
        error={error}
        setError={setError}
      />
      {selectedGroup && (
        <ChatMain
          selectedGroup={selectedGroup}
          messages={messages}
          setMessages={setMessages}
          inputText={inputText}
          setInputText={setInputText}
          handleSendMessage={handleSendMessage}
          handleFileChange={handleFileChange}
          showFileInput={showFileInput}
          setShowFileInput={setShowFileInput}
          selectedFile={selectedFile}
          setSelectedFile={setSelectedFile}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          showMembers={showMembers}
          setShowMembers={setShowMembers}
          addingMember={addingMember}
          setAddingMember={setAddingMember}
          newMemberId={newMemberId}
          setNewMemberId={setNewMemberId}
          selectedMemberIndex={selectedMemberIndex}
          setSelectedMemberIndex={setSelectedMemberIndex}
          handleConfirmAdd={handleConfirmAdd}
          handleRemoveMember={handleRemoveMember}
          handleLeaveGroup={handleLeaveGroup}
          currentUser={currentUser}
          teamMembers={teamMembers}
          typingUsers={typingUsers}
          onlineUsers={onlineUsers}
          openMenuId={openMenuId}
          setOpenMenuId={setOpenMenuId}
          editingMessageId={editingMessageId}
          setEditingMessageId={setEditingMessageId}
          editText={editText}
          setEditText={setEditText}
          handleStartEditMessage={handleStartEditMessage}
          handleSaveEditMessage={handleEditSubmit}
          handleCancelEdit={handleCancelEdit}
          handleDeleteMessage={handleDeleteMessage}
          handleHideMessage={handleHideMessage}
          handleOpenRecallModal={handleOpenRecallModal}
          handleRecallMessage={handleRecallMessage}
          handleCloseRecallModal={handleCloseRecallModal}
          isRecallModalOpen={isRecallModalOpen}
          messageToRecall={messageToRecall}
          chatEndRef={chatEndRef}
          addMemberRef={addMemberRef}
          recallModalRef={recallModalRef}
          error={error}
          setError={setError}
          navigate={navigate}
          handleTyping={handleTyping}
        />
      )}
    </div>
  );
};

export default Chat;
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import io from "socket.io-client";
import ChatSidebar from "./ChatSidebar";
import ChatMain from "./ChatMain";
import ChatHomeOutLeader from "./ChatHomeOut";

const API_URL = "http://localhost:8001/api/group";
const LEADER_API_URL = "http://localhost:8001/api/company/showallLeaders";
const MEMBER_API_URL = "http://localhost:8001/api/company/showallMember";
const SOCKET_URL = "http://localhost:8001";

const Chat = () => {
  const navigate = useNavigate();
  const chatEndRef = useRef(null);
  const addMemberRef = useRef(null);
  const createGroupRef = useRef(null);
  const socketRef = useRef(null);

  const currentUser = JSON.parse(localStorage.getItem("user")) || {
    _id: "",
    name: "Guest",
  };

  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
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
  const [isUploading, setIsUploading] = useState(false); // New state for upload loading

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Socket setup
  useEffect(() => {
    socketRef.current = io(SOCKET_URL, {
      transports: ["websocket"],
      withCredentials: true,
    });

    socketRef.current.on("connect", () => {
      console.log("Socket connected:", socketRef.current.id);
      socketRef.current.emit("user-online", currentUser._id);
    });

    socketRef.current.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    socketRef.current.on("user-online", (userId) => {
      setOnlineUsers((prev) => new Set(prev).add(userId));
    });

    socketRef.current.on("user-offline", (userId) => {
      setOnlineUsers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    });

    socketRef.current.on("group-image", (msg) => {
      setMessages((prev) => {
        // Prevent duplicate messages
        if (prev.some((m) => m._id === msg._id || m.fileId === msg.fileId))
          return prev;
        return [
          ...prev,
          {
            _id: msg._id || `temp_${Date.now()}`,
            senderId: msg.senderId,
            senderName: msg.senderName,
            imageUrl: msg.imageUrl,
            fileName: msg.fileName,
            fileSize: msg.fileSize,
            fileId: msg.fileId,
            fileType: msg.fileType,
            timestamp: new Date(msg.timestamp),
            system: false,
            hidden: false,
          },
        ];
      });
    });

    socketRef.current.on("new-member", ({ groupId, memberName, isLeaving }) => {
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

    socketRef.current.on("typing", ({ userId, groupId }) => {
      if (groupId === selectedGroup?._id) {
        setTypingUsers((prev) => new Set(prev).add(userId));
        setTimeout(() => {
          setTypingUsers((prev) => {
            const newSet = new Set(prev);
            newSet.delete(userId);
            return newSet;
          });
        }, 3000);
      }
    });

    return () => {
      socketRef.current.emit("user-offline", currentUser._id);
      socketRef.current.disconnect();
    };
  }, [selectedGroup, currentUser._id]);

  // Fetch groups
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Không tìm thấy token");
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
    fetchGroups();
  }, []);

  // Fetch team members
  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Không tìm thấy token. Vui lòng đăng nhập lại.");
          return;
        }

        const leaderResponse = await axios.get(LEADER_API_URL, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const leaders = leaderResponse.data.leaders || [];

        const memberResponse = await axios.get(MEMBER_API_URL, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const members = memberResponse.data.members || [];

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
    fetchTeamMembers();
  }, []);

  // Fetch messages
  useEffect(() => {
    if (!selectedGroup?._id) return;

    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `${API_URL}/${selectedGroup._id}/messages`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setMessages(
          res.data.map((msg) => ({
            _id: msg._id,
            senderId: msg.senderId,
            senderName: msg.senderName || "System",
            text: msg.message,
            imageUrl: msg.imageUrl,
            fileName: msg.fileName,
            fileSize: msg.fileSize,
            fileId: msg.fileId,
            fileType: msg.fileType,
            timestamp: msg.timestamp,
            system: msg.senderId === "System",
            hidden: false,
          }))
        );
        socketRef.current.emit("join-group", {
          userId: currentUser._id,
          groupId: selectedGroup._id,
        });
      } catch (err) {
        setError(err.response?.data?.message || "Không thể lấy tin nhắn");
      }
    };

    fetchMessages();
  }, [selectedGroup, currentUser._id]);

  // Auto-scroll to latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle clicks outside menus
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (addMemberRef.current && !addMemberRef.current.contains(e.target)) {
        setAddingMember(false);
      }
      if (
        createGroupRef.current &&
        !createGroupRef.current.contains(e.target)
      ) {
        setCreatingGroup(false);
      }
      if (!e.target.closest(".message-menu")) {
        setOpenMenuId(null);
        setEditingMessageId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSendMessage = async () => {
    if (!inputText.trim() || !selectedGroup?._id) return;
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_URL}/${selectedGroup._id}/messages`,
        { message: inputText.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setInputText("");
      socketRef.current.emit("typing", {
        userId: currentUser._id,
        groupId: selectedGroup._id,
        isTyping: false,
      });
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi khi gửi tin nhắn");
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
      setGroups((prev) =>
        prev.filter((group) => group._id !== selectedGroup._id)
      );
      setSelectedGroup(null);
      setHasLeftGroup(true);
      socketRef.current.emit("leave-group", {
        userId: currentUser._id,
        groupId: selectedGroup._id,
      });
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
        { name: newGroupName, members: newGroupMembers },
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
      socketRef.current.emit("join-group", {
        userId: currentUser._id,
        groupId: newGroup._id,
      });
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi khi tạo nhóm");
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `${API_URL}/${selectedGroup._id}/messages/${messageId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
      setOpenMenuId(null);
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi khi xóa tin nhắn");
    }
  };

  const handleHideMessage = (messageId) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg._id === messageId ? { ...msg, hidden: true } : msg
      )
    );
    setOpenMenuId(null);
  };

  const handleStartEditMessage = (messageId, text) => {
    setEditingMessageId(messageId);
    setEditText(text);
    setOpenMenuId(null);
  };

  const handleSaveEditMessage = async (messageId) => {
    if (!editText.trim()) {
      setError("Tin nhắn không được để trống");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${API_URL}/${selectedGroup._id}/messages/${messageId}`,
        { message: editText.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId ? { ...msg, text: editText.trim() } : msg
        )
      );
      setEditingMessageId(null);
      setEditText("");
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi khi chỉnh sửa tin nhắn");
    }
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditText("");
  };

  if (hasLeftGroup) {
    return <ChatHomeOutLeader onBackToChat={() => setHasLeftGroup(false)} />;
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100 sm:flex-row">
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
          showFileInput={showFileInput}
          setShowFileInput={setShowFileInput}
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
          handleSaveEditMessage={handleSaveEditMessage}
          handleCancelEdit={handleCancelEdit}
          handleDeleteMessage={handleDeleteMessage}
          handleHideMessage={handleHideMessage}
          chatEndRef={chatEndRef}
          addMemberRef={addMemberRef}
          error={error}
          setError={setError}
          navigate={navigate}
          isUploading={isUploading}
          setIsUploading={setIsUploading}
        />
      )}
    </div>
  );
};

export default Chat;

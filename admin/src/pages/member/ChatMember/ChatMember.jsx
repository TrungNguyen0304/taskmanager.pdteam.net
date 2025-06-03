import React, { useState, useRef, useEffect } from "react";
import {
  MoreVertical,
  X,
  UserPlus,
  Users,
  Send,
  Trash2,
  ChevronDown,
  Video,
  Edit2,
  Plus,
} from "lucide-react";
import ChatMemberHomeOut from "./ChatMemberHomeOut";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import io from "socket.io-client";
import { BiDotsVerticalRounded, BiSolidImage } from "react-icons/bi";
import { FaRegEyeSlash } from "react-icons/fa";

const API_URL = "https://apitaskmanager.pdteam.net/api/group";
const TEAM_API_URL = "https://apitaskmanager.pdteam.net/api/member/showallTeam";
const SOCKET_URL = "https://apitaskmanager.pdteam.net";

const ChatMember = () => {
  const navigate = useNavigate();
  const chatEndRef = useRef(null);
  const addMemberRef = useRef(null);
  const createGroupRef = useRef(null);
  const socketRef = useRef(null);

  const currentUser = JSON.parse(localStorage.getItem("user")) || {
    _id: "",
    name: "Guest",
  };

  useEffect(() => {
    socketRef.current = io(SOCKET_URL, {
      transports: ["websocket"],
      withCredentials: true,
    });

    socketRef.current.on("connect", () => {
      console.log("Socket connected:", socketRef.current.id);
    });

    socketRef.current.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

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

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const token = localStorage.getItem("token");
        const formData = new FormData();
        formData.append("file", file);
        await axios.post(`${API_URL}/${selectedGroup._id}/files`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
        console.log("File uploaded:", file.name);
        setShowFileInput(false);
      } catch (err) {
        setError(err.response?.data?.message || "Lỗi khi tải ảnh lên");
      }
    }
  };

  // Connect socket and emit user-online
  useEffect(() => {
    socketRef.current.connect();
    if (currentUser._id) {
      socketRef.current.emit("user-online", currentUser._id);
      setOnlineUsers((prev) => new Set(prev).add(currentUser._id));
    }

    socketRef.current.on("user-online", (userId) => {
      console.log("User online:", userId);
      setOnlineUsers((prev) => new Set(prev).add(userId));
    });

    socketRef.current.on("user-offline", (userId) => {
      console.log("User offline:", userId);
      setOnlineUsers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    });

    return () => {
      if (currentUser._id) {
        socketRef.current.emit("user-offline", currentUser._id);
      }
      socketRef.current.disconnect();
    };
  }, [currentUser._id]);

  // Fetch groups
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
    fetchGroups();
  }, []);

  // Fetch team members
  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(TEAM_API_URL, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const members = res.data.teams.reduce((acc, team) => {
          return [
            ...acc,
            ...team.assignedMembers.map((member) => ({
              _id: member._id,
              name: member.name,
            })),
          ];
        }, []);
        setTeamMembers(members);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Không thể lấy danh sách thành viên team"
        );
      }
    };
    fetchTeamMembers();
  }, []);

  // Fetch messages and join group room
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

  // Handle real-time messages and member updates
  useEffect(() => {
    if (!selectedGroup?._id) return;

    const handleReceiveMessage = (msg) => {
      console.log("Received message:", msg);
      setMessages((prev) => [
        ...prev,
        {
          _id: msg._id || Date.now(),
          senderId: msg.senderId,
          senderName: msg.senderName || "System",
          text: msg.message,
          timestamp: msg.timestamp,
          system: msg.senderId === "System",
          hidden: false,
        },
      ]);
    };

    const handleNewMember = ({ groupId, memberName, isLeaving }) => {
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
    };

    socketRef.current.on("group-message", handleReceiveMessage);
    socketRef.current.on("new-member", handleNewMember);

    return () => {
      socketRef.current.off("group-message", handleReceiveMessage);
      socketRef.current.off("new-member", handleNewMember);
    };
  }, [selectedGroup]);

  // Handle typing events
  useEffect(() => {
    const handleTyping = ({ userId }) => {
      setTypingUsers((prev) => new Set(prev).add(userId));
      setTimeout(() => {
        setTypingUsers((prev) => {
          const newSet = new Set(prev);
          newSet.delete(userId);
          return newSet;
        });
      }, 3000);
    };

    socketRef.current.on("typing", handleTyping);

    return () => {
      socketRef.current.off("typing", handleTyping);
    };
  }, []);

  // Auto-scroll to latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle click outside to close add member, create group, or message menu
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

  // Send typing event
  const handleInputChange = (e) => {
    setInputText(e.target.value);
    if (selectedGroup?._id) {
      socketRef.current.emit("typing", {
        userId: currentUser._id,
        groupId: selectedGroup._id,
      });
    }
  };

  // Send message
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
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi khi gửi tin nhắn");
    }
  };

  // Add member
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

  // Remove member
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

  // Leave group
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

  // Create group
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

  // Delete message
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

  // Hide message (client-side only)
  const handleHideMessage = (messageId) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg._id === messageId ? { ...msg, hidden: true } : msg
      )
    );
    setOpenMenuId(null);
  };

  // Start editing message
  const handleStartEditMessage = (messageId, text) => {
    setEditingMessageId(messageId);
    setEditText(text);
    setOpenMenuId(null);
  };

  // Save edited message
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

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditText("");
  };

  if (hasLeftGroup) {
    return <ChatMemberHomeOut onBackToChat={() => setHasLeftGroup(false)} />;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Left Sidebar */}
      <div className="w-80 bg-white border-r rounded-l-xl shadow-md flex flex-col p-6 gap-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Nhóm của tôi</h2>
          <button
            onClick={() => setCreatingGroup(!creatingGroup)}
            className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
          >
            {creatingGroup ? "" : "Tạo nhóm"}
          </button>
        </div>

        {creatingGroup && (
          <div
            ref={createGroupRef}
            className="space-y-3 rounded-lg shadow-sm p-4 bg-gray-50 border"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              type="text"
              placeholder="Tên nhóm"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              className="w-full border border-gray-300 px-3 py-2 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="max-h-40 overflow-y-auto custom-scrollbar border border-gray-300 rounded-lg p-3 bg-white">
              {teamMembers.map((member) => (
                <label
                  key={member._id}
                  className="flex items-center justify-between gap-2 py-1 text-sm text-gray-800 hover:bg-gray-100 rounded px-2"
                >
                  {member.name}
                  <input
                    type="checkbox"
                    checked={newGroupMembers.includes(member._id)}
                    onChange={() => {
                      setNewGroupMembers((prev) =>
                        prev.includes(member._id)
                          ? prev.filter((id) => id !== member._id)
                          : [...prev, member._id]
                      );
                    }}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </label>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setNewGroupName("");
                  setNewGroupMembers([]);
                  setError(null);
                  setCreatingGroup(false);
                }}
                className="flex-1 bg-gray-300 text-gray-800 py-2 rounded-lg hover:bg-gray-400 transition-colors text-sm"
              >
                Hủy
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCreateGroup();
                }}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                Tạo nhóm
              </button>
            </div>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </div>
        )}

        <div className="flex-1 overflow-y-auto space-y-3">
          {groups.map((group) => (
            <button
              key={group._id}
              onClick={() => setSelectedGroup(group)}
              className={`w-full text-left px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors ${
                selectedGroup?._id === group._id
                  ? "bg-blue-100 font-semibold"
                  : "bg-white"
              } shadow-sm`}
            >
              {group.name}
            </button>
          ))}
        </div>
      </div>

      {selectedGroup && (
        <div className="relative flex flex-col h-screen bg-white shadow-lg rounded-r-xl overflow-hidden w-full mx-auto">
          {/* Header */}
          <div className="px-6 py-4 bg-white border-b shadow-sm flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-blue-800">
                {selectedGroup.name}
              </h2>
              <p className="text-sm text-gray-600">
                {selectedGroup.members.length} thành viên
                {typingUsers.size > 0 && (
                  <span className="ml-2 text-blue-500 animate-pulse">
                    {[...typingUsers].length} người đang nhập...
                  </span>
                )}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() =>
                  navigate(`/chat/video-call/${selectedGroup._id}`)
                }
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                title="Bắt đầu cuộc gọi video"
              >
                <Video size={20} className="text-blue-600" />
              </button>
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <MoreVertical size={20} className="text-blue-600" />
              </button>
            </div>
          </div>

          {/* Sidebar */}
          {sidebarOpen && (
            <div className="absolute top-0 right-0 h-full w-72 bg-white border-l shadow-xl z-10 flex flex-col">
              <div className="flex items-center justify-between px-4 py-4 border-b bg-gray-50">
                <div>
                  <h1 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                    {currentUser.name}
                    {onlineUsers.has(currentUser._id) && (
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    )}
                  </h1>
                  <p className="text-xs text-gray-600">Bạn đang online</p>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="hover:bg-gray-100 rounded p-1 transition-colors"
                >
                  <X size={18} className="text-gray-600" />
                </button>
              </div>

              <div className="p-4 flex flex-col gap-4 flex-1">
                <button
                  onClick={() => setShowMembers(!showMembers)}
                  className="flex items-center justify-between w-full px-4 py-2 bg-gray-50 border rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <span className="flex items-center gap-2 text-gray-800">
                    <Users size={16} /> Thành viên (
                    {selectedGroup.members.length})
                  </span>
                  <ChevronDown
                    size={16}
                    className={`${
                      showMembers ? "rotate-180" : ""
                    } transition-transform text-gray-600`}
                  />
                </button>

                {showMembers && (
                  <div className="bg-gray-50 p-3 rounded-lg border space-y-3 max-h-60 overflow-y-auto custom-scrollbar">
                    {selectedGroup.members.map((member, index) => (
                      <div
                        key={member._id}
                        className="flex justify-between items-center text-sm text-gray-800"
                      >
                        <span className="flex items-center gap-2">
                          {member.name}
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
                                size={16}
                                className="text-gray-600"
                              />
                            </button>
                            {selectedMemberIndex === index && (
                              <div className="absolute right-0 top-6 bg-white border rounded-lg shadow z-10">
                                <button
                                  onClick={() => handleRemoveMember(index)}
                                  className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-gray-100 w-full text-sm"
                                >
                                  <Trash2 size={14} /> Xóa
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
                    className="flex items-center gap-2 text-base bg-gray-50 border rounded-lg hover:bg-gray-100 px-4 py-2 w-full transition-colors"
                  >
                    <UserPlus size={16} className="text-blue-600" /> Thêm thành
                    viên
                  </button>
                  {addingMember && (
                    <div className="flex gap-3 mt-3 items-center">
                      <select
                        value={newMemberId}
                        onChange={(e) => setNewMemberId(e.target.value)}
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                              {member.name}
                            </option>
                          ))}
                      </select>
                      <button
                        onClick={handleConfirmAdd}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                      >
                        Thêm
                      </button>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleLeaveGroup}
                  className="mt-auto bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Rời nhóm
                </button>
              </div>
            </div>
          )}

          {/* Chat messages */}
          <div className="flex-1 p-6 overflow-y-auto custom-scrollbar bg-gray-50">
            {error && (
              <div className="text-red-500 text-center bg-red-50 px-4 py-2 rounded-lg mb-4">
                {error}
              </div>
            )}
            {messages.map((msg) => {
              const isCurrentUser = msg.senderId === currentUser._id;
              if (msg.system || msg.hidden) {
                return msg.system ? (
                  <div
                    key={msg._id || msg.timestamp}
                    className="text-center text-xs italic text-gray-500 mb-3"
                  >
                    {msg.text}
                  </div>
                ) : null;
              }
              return (
                <div
                  key={msg._id || msg.timestamp}
                  className={`mb-4 flex ${
                    isCurrentUser ? "justify-end" : "justify-start"
                  } items-center gap-2 group`}
                >
                  {isCurrentUser && (
                    <div className="relative message-menu">
                      <button
                        onClick={() =>
                          setOpenMenuId((prev) =>
                            prev === msg._id ? null : msg._id
                          )
                        }
                        className="p-1 hover:bg-gray-200 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <BiDotsVerticalRounded
                          size={20}
                          className="text-gray-600"
                        />
                      </button>
                      {openMenuId === msg._id && (
                        <div className="absolute right-0 bottom-8 bg-white border rounded-lg shadow z-10 w-32">
                          <button
                            onClick={() =>
                              handleStartEditMessage(msg._id, msg.text)
                            }
                            className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-gray-100 w-full text-sm"
                          >
                            <Edit2 size={14} /> Chỉnh sửa
                          </button>
                          <button
                            onClick={() => handleDeleteMessage(msg._id)}
                            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-gray-100 w-full text-sm"
                          >
                            <Trash2 size={14} /> Xóa
                          </button>
                          <button
                            onClick={() => handleHideMessage(msg._id)}
                            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 w-full text-sm"
                          >
                            <FaRegEyeSlash className="w-4 h-4" />
                            Ẩn
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                  <div
                    className={`max-w-[70%] px-4 py-2 rounded-lg ${
                      isCurrentUser
                        ? "bg-blue-600 text-white rounded-br-none"
                        : "bg-white border border-gray-300 rounded-bl-none"
                    } shadow`}
                  >
                    {!isCurrentUser && (
                      <div className="text-xs font-semibold mb-1 text-gray-600">
                        {msg.senderName}
                      </div>
                    )}
                    {editingMessageId === msg._id && isCurrentUser ? (
                      <div className="flex flex-col gap-2">
                        <input
                          type="text"
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-1 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSaveEditMessage(msg._id)}
                            className="bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 transition-colors text-sm"
                          >
                            Lưu
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="bg-gray-300 text-gray-800 px-3 py-1 rounded-lg hover:bg-gray-400 transition-colors text-sm"
                          >
                            Hủy
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>{msg.text}</div>
                    )}
                  </div>
                  {!isCurrentUser && (
                    <div className="relative message-menu">
                      <button
                        onClick={() =>
                          setOpenMenuId((prev) =>
                            prev === msg._id ? null : msg._id
                          )
                        }
                        className="p-1 hover:bg-gray-200 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <BiDotsVerticalRounded
                          size={20}
                          className="text-gray-600"
                        />
                      </button>
                      {openMenuId === msg._id && (
                        <div className="absolute left-0 bottom-8 bg-white border rounded-lg shadow z-10 w-32">
                          <button
                            onClick={() => handleDeleteMessage(msg._id)}
                            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-gray-100 w-full text-sm"
                          >
                            <Trash2 size={14} /> Xóa
                          </button>
                          <button
                            onClick={() => handleHideMessage(msg._id)}
                            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 w-full text-sm"
                          >
                            <FaRegEyeSlash className="w-4 h-4" />
                            Ẩn
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
            <div ref={chatEndRef} />
          </div>

          {/* Input to send message */}
          <div className="border-t bg-white px-4 py-3 sm:px-6 sm:py-4 flex items-center gap-3">
            <div className="relative">
              <button
                onClick={() => setShowFileInput(!showFileInput)}
                className="bg-gray-100 text-gray-700 p-2 rounded-full hover:bg-gray-200 transition-all duration-200"
                title="Tải lên file"
              >
                <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
              {showFileInput && (
                <div className="absolute bottom-12 left-0 bg-white border border-gray-200 rounded-md shadow-md z-10 w-36">
                  <label className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer transition rounded-md">
                    <BiSolidImage className="text-xl" />
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
              className="flex-1 border border-gray-200 rounded-full px-4 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 bg-gray-50 placeholder:text-gray-400"
            />

            <button
              onClick={handleSendMessage}
              disabled={!inputText.trim()}
              className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 disabled:bg-blue-300 transition-colors duration-200"
              title="Gửi tin nhắn"
            >
              <Send className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatMember;

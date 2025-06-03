import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  MoreVertical,
  X,
  UserPlus,
  Users,
  Send,
  Trash2,
  ChevronDown,
  Plus,
} from "lucide-react";
import axios from "axios";
import io from "socket.io-client";

const API_URL = "http://localhost:8001/api/group";
const TEAM_API_URL = "http://localhost:8001/api/leader/showallTeam";
const SOCKET_URL = "http://localhost:8001";

const Chat = () => {
  const chatEndRef = useRef(null);
  const addMemberRef = useRef(null);
  const createGroupRef = useRef(null);

  const currentUser = JSON.parse(localStorage.getItem("user")) || {
    _id: "",
    name: "Guest",
  };
  const socket = useMemo(() => io(SOCKET_URL, { autoConnect: false }), []);

  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showMembers, setShowMembers] = useState(true);
  const [addingMember, setAddingMember] = useState(false);
  const [newMemberId, setNewMemberId] = useState("");
  const [selectedMemberIndex, setSelectedMemberIndex] = useState(null);
  const [hasLeftGroup, setHasLeftGroup] = useState(false);
  const [error, setError] = useState(null);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [teamMembers, setTeamMembers] = useState([]);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupMembers, setNewGroupMembers] = useState([]);

  // Connect socket and emit user-online
  useEffect(() => {
    socket.connect();
    socket.emit("user-online", currentUser._id);

    return () => {
      socket.disconnect();
    };
  }, [socket, currentUser._id]);

  // Fetch groups
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_URL}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const groups = res.data.map(group => ({
          ...group,
          members: group.members || [], // Ensure members is always an array
        }));
        setGroups(groups);
        if (groups.length > 0 && !selectedGroup) {
          setSelectedGroup(groups[0]);
        }
      } catch (err) {
        setError("Không thể lấy danh sách nhóm");
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
        setError(err.response?.data?.message || "Không thể lấy danh sách thành viên team");
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
        const res = await axios.get(`${API_URL}/${selectedGroup._id}/messages`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMessages(
          res.data.map((msg) => ({
            _id: msg._id,
            senderId: msg.senderId,
            senderName: msg.senderName,
            text: msg.message,
            timestamp: msg.timestamp,
            system: msg.senderId === "system",
          }))
        );
        socket.emit("join-group", { userId: currentUser._id, groupId: selectedGroup._id });
      } catch (err) {
        setError("Không thể lấy tin nhắn");
      }
    };

    fetchMessages();

    return () => {
      if (selectedGroup?._id) {
        socket.emit("leave-group", { userId: currentUser._id, groupId: selectedGroup._id });
      }
    };
  }, [selectedGroup, socket, currentUser._id]);

  // Receive real-time messages
  useEffect(() => {
    const handleReceiveMessage = (msg) => {
      setMessages((prev) => [
        ...prev,
        {
          _id: msg._id || Date.now(),
          senderId: msg.senderId,
          senderName: msg.senderName || "System",
          text: msg.message,
          timestamp: msg.timestamp,
          system: msg.senderId === "system",
        },
      ]);
    };

    socket.on("group-message", handleReceiveMessage);

    return () => {
      socket.off("group-message", handleReceiveMessage);
    };
  }, [socket]);

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

    socket.on("typing", handleTyping);

    return () => {
      socket.off("typing", handleTyping);
    };
  }, [socket]);

  // Auto-scroll to latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle click outside to close add member input
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (addMemberRef.current && !addMemberRef.current.contains(e.target)) {
        setAddingMember(false);
      }
      if (createGroupRef.current && !createGroupRef.current.contains(e.target)) {
        setShowCreateGroup(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Send typing event
  const handleInputChange = (e) => {
    setInputText(e.target.value);
    if (selectedGroup?._id) {
      socket.emit("typing", { userId: currentUser._id, groupId: selectedGroup._id });
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
    if (!newMemberId.trim() || !selectedGroup?._id) return;
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${API_URL}/${selectedGroup._id}/members`,
        { userId: newMemberId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const newMember = teamMembers.find((member) => member._id === newMemberId);
      // Ensure res.data has members array
      const updatedGroup = {
        ...res.data,
        members: res.data.members || [], // Fallback to empty array if members is undefined
      };
      socket.emit("group-message", {
        groupId: selectedGroup._id,
        senderId: "system",
        senderName: "System",
        message: `${newMember?.name || "Một thành viên"} đã được thêm vào nhóm`,
        timestamp: new Date().toISOString(),
      });
      setSelectedGroup(updatedGroup);
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
      await axios.delete(`${API_URL}/${selectedGroup._id}/members/${member._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      socket.emit("group-message", {
        groupId: selectedGroup._id,
        senderId: "system",
        senderName: "System",
        message: `${member.name} đã bị xóa khỏi nhóm`,
        timestamp: new Date().toISOString(),
      });
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
      await axios.delete(`${API_URL}/${selectedGroup._id}/leave`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      socket.emit("group-message", {
        groupId: selectedGroup._id,
        senderId: "system",
        senderName: "System",
        message: `${currentUser.name} đã rời nhóm`,
        timestamp: new Date().toISOString(),
      });
      socket.emit("leave-group", { userId: currentUser._id, groupId: selectedGroup._id });
      setGroups((prev) => prev.filter((group) => group._id !== selectedGroup._id));
      setSelectedGroup(null);
      setHasLeftGroup(true);
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi khi rời nhóm");
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
        members: res.data.group.members || [], // Ensure members is an array
      };
      setGroups((prev) => [...prev, newGroup]);
      setSelectedGroup(newGroup);
      setNewGroupName("");
      setNewGroupMembers([]);
      setShowCreateGroup(false);
      socket.emit("group-message", {
        groupId: newGroup._id,
        senderId: "system",
        senderName: "System",
        message: `Nhóm "${newGroup.name}" đã được tạo`,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi khi tạo nhóm");
    }
  };

  if (hasLeftGroup) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-gray-800">Bạn đã rời nhóm</h2>
          <button
            onClick={() => {
              setHasLeftGroup(false);
              setSelectedGroup(groups[0] || null);
            }}
            className="bg-indigo-600 text-white px-6 py-2 rounded-full hover:bg-indigo-700 transition-all duration-300"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* Left Sidebar: Group List */}
      <div className="bg-white w-80 shadow-xl flex flex-col transition-all duration-300">
        <div className="p-4 bg-indigo-600 text-white flex justify-between items-center">
          <h1 className="text-xl font-bold">Nhóm Chat</h1>
          <button
            onClick={() => setShowCreateGroup(true)}
            className="p-2 rounded-full hover:bg-indigo-700 transition-all duration-300"
          >
            <Plus size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {groups.map((group) => (
            <button
              key={group._id}
              onClick={() => setSelectedGroup(group)}
              className={`w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-indigo-50 transition-all duration-200 ${
                selectedGroup?._id === group._id ? "bg-indigo-100" : ""
              }`}
            >
              <h3 className="font-semibold text-gray-900">{group.name}</h3>
              <p className="text-sm text-gray-600">{group.members?.length || 0} thành viên</p>
            </button>
          ))}
        </div>
        {showCreateGroup && (
          <div
            ref={createGroupRef}
            className="absolute top-0 left-0 w-80 bg-white shadow-2xl p-4 z-20 h-full transition-transform duration-300"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-indigo-800">Tạo Nhóm Mới</h2>
              <button
                onClick={() => setShowCreateGroup(false)}
                className="text-gray-600 hover:text-gray-800 transition-all duration-200"
              >
                <X size={20} />
              </button>
            </div>
            <input
              type="text"
              placeholder="Tên nhóm"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
            />
            <select
              multiple
              value={newGroupMembers}
              onChange={(e) =>
                setNewGroupMembers(
                  Array.from(e.target.selectedOptions, (option) => option.value)
                )
              }
              className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
            >
              <option value="" disabled>
                Chọn thành viên
              </option>
              {teamMembers.map((member) => (
                <option key={member._id} value={member._id}>
                  {member.name}
                </option>
              ))}
            </select>
            <button
              onClick={handleCreateGroup}
              className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-all duration-200"
            >
              Tạo Nhóm
            </button>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </div>
        )}
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white shadow-xl">
        {/* Header */}
        <div className="px-6 py-4 bg-indigo-50 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-indigo-800">
              {selectedGroup?.name || "Chọn một nhóm"}
            </h2>
            <p className="text-sm text-gray-600">
              {selectedGroup?.members?.length || 0} thành viên
              {typingUsers.size > 0 && (
                <span className="ml-2 text-indigo-500 animate-pulse">
                  {[...typingUsers].length} người đang nhập...
                </span>
              )}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowMembers(!showMembers)}
              className="p-2 rounded-full hover:bg-indigo-200 transition-all duration-200"
            >
              <Users size={20} />
            </button>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-full hover:bg-indigo-200 transition-all duration-200"
            >
              <MoreVertical size={20} />
            </button>
          </div>
        </div>

        {/* Right Sidebar: Members and Actions */}
        {sidebarOpen && (
          <div className="absolute top-0 right-0 h-full w-80 bg-white shadow-2xl border-l border-gray-200 z-20 flex flex-col transition-transform duration-300">
            <div className="flex items-center justify-between px-4 py-4 border-b bg-indigo-50">
              <div>
                <h1 className="font-bold text-gray-800 text-lg">{currentUser.name}</h1>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="hover:bg-indigo-200 rounded p-2 transition-all duration-200"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 flex flex-col gap-4 flex-1">
              <button
                onClick={() => setShowMembers(!showMembers)}
                className="flex items-center justify-between w-full px-4 py-2 bg-indigo-50 border border-gray-200 rounded-lg hover:bg-indigo-100 transition-all duration-200"
              >
                <span className="flex items-center gap-2 text-gray-800">
                  <Users size={16} /> Thành viên ({selectedGroup?.members?.length || 0})
                </span>
                <ChevronDown
                  size={16}
                  className={`${showMembers ? "rotate-180" : ""} transition-transform duration-200`}
                />
              </button>

              {showMembers && (
                <div className="bg-white p-3 rounded-lg border border-gray-200 space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                  {selectedGroup?.members?.map((member, index) => (
                    <div
                      key={member._id}
                      className="flex justify-between items-center text-sm text-gray-700"
                    >
                      <div className="flex items-center gap-2">
                        <span>{member.name}</span>
                        {member._id === currentUser._id && (
                          <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                        )}
                      </div>
                      {member._id !== currentUser._id && (
                        <div className="relative">
                          <button
                            onClick={() =>
                              setSelectedMemberIndex((prev) => (prev === index ? null : index))
                            }
                            className="hover:bg-gray-100 rounded p-1 transition-all duration-200"
                          >
                            <MoreVertical size={16} />
                          </button>
                          {selectedMemberIndex === index && (
                            <div className="absolute right-0 top-6 bg-white border rounded-lg shadow-lg z-10">
                              <button
                                onClick={() => handleRemoveMember(index)}
                                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-gray-100 w-full transition-all duration-200"
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
                  className="flex items-center gap-2 text-base bg-indigo-50 border border-gray-200 rounded-lg hover:bg-indigo-100 px-4 py-2 w-full transition-all duration-200"
                >
                  <UserPlus size={16} /> Thêm thành viên
                </button>
                {addingMember && (
                  <div className="mt-2 space-y-2">
                    <select
                      value={newMemberId}
                      onChange={(e) => setNewMemberId(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
                    >
                      <option value="">Chọn thành viên</option>
                      {teamMembers.map((member) => (
                        <option key={member._id} value={member._id}>
                          {member.name}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={handleConfirmAdd}
                      className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-all duration-200"
                    >
                      Thêm
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={handleLeaveGroup}
                className="mt-auto bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center justify-center gap-2 transition-all duration-200"
              >
                <Trash2 size={16} /> Rời nhóm
              </button>
            </div>
          </div>
        )}

        {/* Message Area */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 bg-gray-50 custom-scrollbar">
          {error && (
            <div className="text-red-500 text-center bg-red-50 px-4 py-2 rounded-lg">
              {error}
            </div>
          )}
          {messages.map((msg) => (
            <div
              key={msg._id}
              className={`flex flex-col ${
                msg.system
                  ? "items-center"
                  : msg.senderId === currentUser._id
                  ? "items-end"
                  : "items-start"
              }`}
            >
              {msg.system ? (
                <div className="text-sm text-gray-600 bg-yellow-100 px-4 py-2 rounded-lg shadow-md max-w-[70%] text-center italic">
                  {msg.text}
                </div>
              ) : (
                <>
                  <span
                    className={`text-sm mb-1 font-semibold ${
                      msg.senderId === currentUser._id ? "text-indigo-600" : "text-blue-600"
                    }`}
                  >
                    {msg.senderName}
                  </span>
                  <div
                    className={`px-4 py-2 rounded-2xl shadow-md max-w-[70%] text-base transition-all duration-200 ${
                      msg.senderId === currentUser._id
                        ? "bg-indigo-100 text-gray-800"
                        : "bg-white text-gray-800 border border-gray-200"
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-xs text-gray-500 mt-1">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </span>
                </>
              )}
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Input Area */}
        <div className="flex items-center gap-3 px-6 py-4 border-t border-gray-200 bg-white">
          <input
            type="text"
            placeholder="Nhập tin nhắn..."
            value={inputText}
            onChange={handleInputChange}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
          />
          <button
            onClick={handleSendMessage}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-3 flex items-center justify-center transition-all duration-300"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
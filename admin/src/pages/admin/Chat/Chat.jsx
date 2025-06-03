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
} from "lucide-react";
import ChatHomeOut from "./ChatHomeOut";
import { useNavigate } from "react-router-dom";

const Chat = () => {
  const navigate = useNavigate();
  const currentUser = "Lê Quý Thiện (Leader)";
  const chatEndRef = useRef(null);
  const addMemberRef = useRef(null);

  const [room, setRoom] = useState({
    id: "vanphong",
    name: "Văn Phòng Test",
    members: [
      "Lê Quý Thiện (Leader)",
      "Trần Thị B",
      "Phạm Văn C",
      "Nguyễn Thị D",
      "Võ Văn E",
    ],
  });

  const [joinedGroups, setJoinedGroups] = useState([
    { id: "vanphong", name: "Văn Phòng Test" },
    { id: "marketing", name: "Marketing Chiến lược" },
  ]);
  const [creatingGroup, setCreatingGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupMembers, setNewGroupMembers] = useState("");

  const [messages, setMessages] = useState([
    {
      sender: "System",
      text: "Nhóm Văn Phòng Test đã được tạo.",
      system: true,
    },
    { sender: "Nguyễn Văn A", text: "Chào cả nhà! Sẵn sàng làm việc chưa?" },
    {
      sender: "Lê Quý Thiện (Leader)",
      text: "Chào mọi người! Bắt đầu họp nhé!",
    },
    { sender: "Trần Thị B", text: "Ok, em sẵn sàng rồi đây!" },
    {
      sender: "Phạm Văn C",
      text: "Có kế hoạch gì cho tuần này chưa anh Thiện?",
    },
    {
      sender: "Lê Quý Thiện (Leader)",
      text: "Để anh gửi kế hoạch chi tiết ngay.",
    },
    {
      sender: "Nguyễn Thị D",
      text: "Nhớ thêm em vào danh sách phân công nha!",
    },
    { sender: "System", text: "Võ Văn E đã tham gia nhóm.", system: true },
    { sender: "Võ Văn E", text: "Xin chào mọi người, em mới vào nhóm!" },
  ]);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showMembers, setShowMembers] = useState(true);
  const [addingMember, setAddingMember] = useState(false);
  const [newMemberName, setNewMemberName] = useState("");
  const [selectedMemberIndex, setSelectedMemberIndex] = useState(null);
  const [hasLeftGroup, setHasLeftGroup] = useState(false);
  const [inputText, setInputText] = useState("");

  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    setMessages((prev) => [
      ...prev,
      { sender: currentUser, text: inputText.trim() },
    ]);
    setInputText("");
  };

  const handleConfirmAdd = () => {
    if (!newMemberName.trim()) return;
    const addedName = newMemberName.trim();
    setRoom((prev) => ({
      ...prev,
      members: [...prev.members, addedName],
    }));
    setMessages((prev) => [
      ...prev,
      {
        sender: "System",
        text: `${
          currentUser === "Lê Quý Thiện (Leader)" ? "Bạn" : currentUser
        } đã thêm ${addedName} vào nhóm.`,
        system: true,
      },
    ]);
    setNewMemberName("");
    setAddingMember(false);
  };

  const handleRemoveMember = (index) => {
    const removedMember = room.members[index];
    setRoom((prev) => ({
      ...prev,
      members: prev.members.filter((_, i) => i !== index),
    }));
    setMessages((prev) => [
      ...prev,
      {
        sender: "System",
        text: `${
          currentUser === "Lê Quý Thiện (Leader)" ? "Bạn" : currentUser
        } đã xóa ${removedMember} khỏi nhóm.`,
        system: true,
      },
    ]);
    setSelectedMemberIndex(null);
  };

  const handleLeaveGroup = () => {
    setRoom((prev) => ({
      ...prev,
      members: prev.members.filter((m) => m !== currentUser),
    }));
    setMessages((prev) => [
      ...prev,
      {
        sender: "System",
        text: `${currentUser} đã rời nhóm.`,
        system: true,
      },
    ]);
    setSidebarOpen(false);
    setHasLeftGroup(true);
  };

  const handleClickOutside = (e) => {
    if (addMemberRef.current && !addMemberRef.current.contains(e.target)) {
      setAddingMember(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (hasLeftGroup) {
    return <ChatHomeOut onBackToChat={() => setHasLeftGroup(false)} />;
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
            {creatingGroup ? "Hủy" : "Tạo nhóm"}
          </button>
        </div>

        {creatingGroup && (
          <div className="space-y-3 rounded-lg shadow-sm">
            <input
              type="text"
              placeholder="Tên nhóm"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              className="w-full border border-gray-300 px-3 py-2 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <textarea
              rows={2}
              placeholder="Thành viên (ngăn cách bởi dấu phẩy)"
              value={newGroupMembers}
              onChange={(e) => setNewGroupMembers(e.target.value)}
              className="w-full border border-gray-300 px-3 py-2 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => {
                if (!newGroupName.trim()) return;
                const members = newGroupMembers
                  .split(",")
                  .map((m) => m.trim())
                  .filter((m) => m);
                setJoinedGroups((prev) => [
                  ...prev,
                  {
                    id: newGroupName.toLowerCase().replace(/\s+/g, "-"),
                    name: newGroupName,
                  },
                ]);
                setRoom({
                  id: newGroupName.toLowerCase().replace(/\s+/g, "-"),
                  name: newGroupName,
                  members: [currentUser, ...members],
                });
                setMessages([
                  {
                    sender: "System",
                    text: `Nhóm "${newGroupName}" đã được tạo.`,
                    system: true,
                  },
                ]);
                setCreatingGroup(false);
                setNewGroupName("");
                setNewGroupMembers("");
              }}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              Tạo nhóm
            </button>
          </div>
        )}

        {/* {creatingGroup && (
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
        )} */}

        {/* List of joined groups */}
        <div className="flex-1 overflow-y-auto space-y-3">
          {joinedGroups.map((group, idx) => (
            <button
              key={idx}
              onClick={() => {
                setRoom((prev) => ({
                  ...prev,
                  id: group.id,
                  name: group.name,
                }));
                setMessages([
                  {
                    sender: "System",
                    text: `Bạn đang ở nhóm "${group.name}".`,
                    system: true,
                  },
                ]);
              }}
              className={`w-full text-left px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors ${
                room.id === group.id ? "bg-blue-100 font-semibold" : "bg-white"
              } shadow-sm`}
            >
              {group.name}
            </button>
          ))}
        </div>
      </div>

      <div className="relative flex flex-col h-screen bg-white shadow-lg rounded-r-xl overflow-hidden w-full mx-auto">
        {/* Header */}
        <div className="px-6 py-4 bg-white border-b shadow-sm flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-blue-800">{room.name}</h2>
            <p className="text-sm text-gray-600">
              {room.members.length} thành viên
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate("/chat/video-call")}
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
                <h1 className="font-bold text-gray-800 text-lg">
                  {currentUser}
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
              {/* Toggle Member List */}
              <button
                onClick={() => setShowMembers(!showMembers)}
                className="flex items-center justify-between w-full px-4 py-2 bg-gray-50 border rounded-lg hover:bg-gray-100 transition-colors"
              >
                <span className="flex items-center gap-2 text-gray-800">
                  <Users size={16} /> Thành viên ({room.members.length})
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
                  {room.members.map((member, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center text-sm text-gray-800"
                    >
                      <span>{member}</span>
                      {member !== currentUser && (
                        <div className="relative">
                          <button
                            onClick={() =>
                              setSelectedMemberIndex((prev) =>
                                prev === index ? null : index
                              )
                            }
                            className="hover:bg-gray-100 rounded p-1 transition-colors"
                          >
                            <MoreVertical size={16} className="text-gray-600" />
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

              {/* Add member */}
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
                    <input
                      type="text"
                      placeholder="Tên thành viên"
                      value={newMemberName}
                      onChange={(e) => setNewMemberName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleConfirmAdd()}
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={handleConfirmAdd}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                    >
                      Thêm
                    </button>
                  </div>
                )}
              </div>

              {/* Leave group */}
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
          {messages.map((msg, i) => {
            const isCurrentUser = msg.sender === currentUser;
            if (msg.system) {
              return (
                <div
                  key={i}
                  className="text-center text-xs italic text-gray-500 mb-3"
                >
                  {msg.text}
                </div>
              );
            }
            return (
              <div
                key={i}
                className={`mb-4 flex flex-col ${
                  isCurrentUser ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`max-w-[70%] px-4 py-2 rounded-lg ${
                    isCurrentUser
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-white border border-gray-300 rounded-bl-none"
                  } shadow`}
                >
                  {!isCurrentUser && (
                    <div className="text-xs font-semibold mb-1 text-gray-600">
                      {msg.sender}
                    </div>
                  )}
                  <div>{msg.text}</div>
                </div>
              </div>
            );
          })}
          <div ref={chatEndRef} />
        </div>

        {/* Input to send message */}
        <div className="border-t px-6 py-4 bg-white flex items-center gap-4">
          <input
            type="text"
            placeholder="Nhập tin nhắn..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSendMessage();
              }
            }}
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSendMessage}
            className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors"
            title="Gửi tin nhắn"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;

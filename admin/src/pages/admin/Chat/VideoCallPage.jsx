import React, { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FaPhoneSlash,
  FaMicrophoneSlash,
  FaMicrophone,
  FaVideoSlash,
} from "react-icons/fa6";
import { BsThreeDotsVertical } from "react-icons/bs";
import { HiMiniVideoCamera } from "react-icons/hi2";
import io from "socket.io-client";
import axios from "axios";

const SOCKET_URL = "http://localhost:8001";
const API_URL = "http://localhost:8001/api/group";

const MAX_VISIBLE = 5;

const VideoCallPage = () => {
  const navigate = useNavigate();
  const { groupId } = useParams(); // Get groupId from URL
  const socketRef = useRef(null);
  const selfVideoRef = useRef(null);
  const peerConnectionsRef = useRef({});
  const remoteVideoRefs = useRef({});
  const [selfStream, setSelfStream] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [showMoreModal, setShowMoreModal] = useState(false);
  const [openModalMenuId, setOpenModalMenuId] = useState(null);
  const [visibleParticipantIds, setVisibleParticipantIds] = useState([]);
  const [error, setError] = useState(null);

  const currentUser = JSON.parse(localStorage.getItem("user")) || {
    _id: "",
    name: "Guest",
  };

  // Initialize Socket.IO and WebRTC
  useEffect(() => {
    // Connect to Socket.IO
    socketRef.current = io(SOCKET_URL, {
      transports: ["websocket"],
      withCredentials: true,
    });

    socketRef.current.on("connect", () => {
      console.log("Socket connected:", socketRef.current.id);
      socketRef.current.emit("join-group", {
        userId: currentUser._id,
        groupId,
      });
    });

    // Fetch group members to initialize participants
    const fetchGroupMembers = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_URL}/${groupId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const members = res.data.members.map((member) => ({
          id: member._id,
          name: member.name,
          isSelf: member._id === currentUser._id,
          isCameraOff: true, // Initially off until stream is received
          isMicOff: true,
        }));
        setParticipants(members);

        // Set initial visible participants (self + up to MAX_VISIBLE - 1 others)
        const selfId = members.find((p) => p.isSelf)?.id;
        const initialVisible = [
          selfId,
          ...members
            .filter((p) => !p.isSelf)
            .slice(0, MAX_VISIBLE - 1)
            .map((p) => p.id),
        ].filter(Boolean);
        setVisibleParticipantIds(initialVisible);
      } catch (err) {
        setError(err.response?.data?.message || "Không thể lấy thông tin nhóm");
      }
    };
    fetchGroupMembers();

    // Initialize local stream
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        setSelfStream(stream);
        if (selfVideoRef.current) {
          selfVideoRef.current.srcObject = stream;
        }
        setParticipants((prev) =>
          prev.map((p) =>
            p.isSelf ? { ...p, isCameraOff: false, isMicOff: false } : p
          )
        );
      })
      .catch((err) => {
        console.error("Lỗi khi lấy camera/micro:", err);
        setError("Không thể truy cập camera hoặc micro");
      });

    // Handle call-started event
    socketRef.current.on(
      "call-started",
      ({ groupId: callGroupId, callerId }) => {
        if (callGroupId === groupId && callerId !== currentUser._id) {
          startWebRTCConnections();
        }
      }
    );

    // WebRTC signaling handlers
    socketRef.current.on("offer", async ({ from, offer }) => {
      const peer = createPeerConnection(from);
      await peer.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);
      socketRef.current.emit("answer", {
        to: from,
        answer,
        groupId,
      });
    });

    socketRef.current.on("answer", async ({ from, answer }) => {
      const peer = peerConnectionsRef.current[from];
      if (peer) {
        await peer.setRemoteDescription(new RTCSessionDescription(answer));
      }
    });

    socketRef.current.on("ice-candidate", async ({ from, candidate }) => {
      const peer = peerConnectionsRef.current[from];
      if (peer && candidate) {
        await peer.addIceCandidate(new RTCIceCandidate(candidate));
      }
    });

    socketRef.current.on("user-joined-call", ({ userId, userName }) => {
      setParticipants((prev) => {
        if (!prev.some((p) => p.id === userId)) {
          return [
            ...prev,
            { id: userId, name: userName, isCameraOff: true, isMicOff: true },
          ];
        }
        return prev;
      });
      if (userId !== currentUser._id) {
        initiateOffer(userId);
      }
    });

    socketRef.current.on("user-left-call", ({ userId }) => {
      setParticipants((prev) => prev.filter((p) => p.id !== userId));
      if (peerConnectionsRef.current[userId]) {
        peerConnectionsRef.current[userId].close();
        delete peerConnectionsRef.current[userId];
        delete remoteVideoRefs.current[userId];
      }
    });

    return () => {
      if (selfStream) {
        selfStream.getTracks().forEach((track) => track.stop());
      }
      Object.values(peerConnectionsRef.current).forEach((peer) => peer.close());
      socketRef.current.disconnect();
    };
  }, [groupId, currentUser._id]);

  // Start video call by calling the API
  const startVideoCall = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_URL}/${groupId}/call`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      startWebRTCConnections();
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi khi khởi tạo cuộc gọi");
    }
  };

  // Create WebRTC peer connection
  const createPeerConnection = (remoteUserId) => {
    const peer = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        // Add TURN servers if needed
      ],
    });

    // Add local stream tracks to peer connection
    if (selfStream) {
      selfStream
        .getTracks()
        .forEach((track) => peer.addTrack(track, selfStream));
    }

    // Handle incoming stream
    peer.ontrack = (event) => {
      const [remoteStream] = event.streams;
      if (remoteVideoRefs.current[remoteUserId]) {
        remoteVideoRefs.current[remoteUserId].srcObject = remoteStream;
      }
      setParticipants((prev) =>
        prev.map((p) =>
          p.id === remoteUserId
            ? { ...p, isCameraOff: !remoteStream.getVideoTracks().length }
            : p
        )
      );
    };

    // Handle ICE candidates
    peer.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current.emit("ice-candidate", {
          to: remoteUserId,
          candidate: event.candidate,
          groupId,
        });
      }
    };

    peerConnectionsRef.current[remoteUserId] = peer;
    return peer;
  };

  // Initiate WebRTC offer to a user
  const initiateOffer = async (remoteUserId) => {
    const peer = createPeerConnection(remoteUserId);
    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    socketRef.current.emit("offer", {
      to: remoteUserId,
      offer,
      groupId,
    });
  };

  // Start WebRTC connections for all group members
  const startWebRTCConnections = () => {
    participants.forEach((p) => {
      if (p.id !== currentUser._id && !peerConnectionsRef.current[p.id]) {
        initiateOffer(p.id);
      }
    });
    socketRef.current.emit("user-joined-call", {
      userId: currentUser._id,
      userName: currentUser.name,
      groupId,
    });
  };

  // Start call when component mounts
  useEffect(() => {
    if (participants.length > 0) {
      startVideoCall();
    }
  }, [participants]);

  // Handle end call
  const handleEndCall = () => {
    if (selfStream) {
      selfStream.getTracks().forEach((track) => track.stop());
    }
    Object.values(peerConnectionsRef.current).forEach((peer) => peer.close());
    peerConnectionsRef.current = {};
    socketRef.current.emit("user-left-call", {
      userId: currentUser._id,
      groupId,
    });
    navigate("/chat");
  };

  // Toggle camera
  const toggleCamera = () => {
    if (selfStream) {
      const videoTrack = selfStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setParticipants((prev) =>
          prev.map((p) =>
            p.isSelf ? { ...p, isCameraOff: !videoTrack.enabled } : p
          )
        );
      }
    }
  };

  // Toggle microphone
  const toggleMicrophone = () => {
    if (selfStream) {
      const audioTrack = selfStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setParticipants((prev) =>
          prev.map((p) =>
            p.isSelf ? { ...p, isMicOff: !audioTrack.enabled } : p
          )
        );
      }
    }
  };

  // Toggle menu for participant controls
  const toggleMenu = (userId) => {
    setOpenMenuId((prev) => (prev === userId ? null : userId));
  };

  const toggleModalMenu = (userId) => {
    setOpenModalMenuId((prev) => (prev === userId ? null : userId));
  };

  // Update participant state (for admin controls, if needed)
  const updateParticipant = (userId, key) => {
    setParticipants((prev) =>
      prev.map((p) => (p.id === userId ? { ...p, [key]: !p[key] } : p))
    );
    setOpenMenuId(null);
    setOpenModalMenuId(null);
  };

  // Toggle pinning participant
  const togglePinParticipant = (userId) => {
    const selfId = participants.find((p) => p.isSelf)?.id;
    if (userId === selfId) return;

    setVisibleParticipantIds((prev) => {
      let newIds;
      if (prev.includes(userId)) {
        newIds = prev.filter((id) => id !== userId);
        if (newIds.length < MAX_VISIBLE) {
          const sortedParticipants = participants
            .filter((p) => !p.isSelf && !newIds.includes(p.id))
            .sort((a, b) => {
              const aScore =
                !a.isCameraOff && !a.isMicOff
                  ? 3
                  : !a.isMicOff
                  ? 2
                  : !a.isCameraOff
                  ? 1
                  : 0;
              const bScore =
                !b.isCameraOff && !b.isMicOff
                  ? 3
                  : !b.isMicOff
                  ? 2
                  : !b.isCameraOff
                  ? 1
                  : 0;
              return bScore - aScore;
            });
          const additionalIds = sortedParticipants
            .slice(0, MAX_VISIBLE - newIds.length)
            .map((p) => p.id);
          newIds = [...newIds, ...additionalIds];
        }
      } else {
        if (prev.length < MAX_VISIBLE) {
          newIds = [...prev, userId];
        } else {
          newIds = prev.slice(0, MAX_VISIBLE - 1);
          newIds.push(userId);
        }
      }
      return newIds;
    });
  };

  const visibleParticipants = visibleParticipantIds
    .map((id) => participants.find((p) => p.id === id))
    .filter(Boolean);

  const otherParticipants = participants.filter(
    (p) => !visibleParticipantIds.includes(p.id)
  );

  return (
    <div className="h-screen bg-gray-900 text-white flex flex-col p-4 relative rounded-2xl shadow-lg">
      {error && (
        <div className="absolute top-4 left-4 bg-red-600 text-white px-4 py-2 rounded">
          {error}
        </div>
      )}
      <div className="absolute top-4 left-4 text-lg font-semibold">
        Đang gọi nhóm video...
      </div>
      <button
        onClick={handleEndCall}
        className="absolute top-4 right-4 p-2 rounded-full bg-gray-800 hover:bg-gray-700"
      >
        <X size={20} />
      </button>
      <div className="flex-1 mt-16 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 place-items-center overflow-y-auto px-2">
        {visibleParticipants.map((user) => (
          <div
            key={user.id}
            className={`w-full h-52 rounded-xl flex items-center justify-center relative ${
              user.isSelf ? "bg-blue-700" : "bg-gray-700"
            }`}
          >
            {user.isSelf ? (
              user.isCameraOff ? (
                <span className="text-sm text-gray-400 italic">
                  Camera đã tắt
                </span>
              ) : (
                <video
                  ref={selfVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover rounded-xl"
                />
              )
            ) : user.isCameraOff ? (
              <span className="text-sm text-gray-400 italic">
                Camera đã tắt
              </span>
            ) : (
              <video
                ref={(el) => (remoteVideoRefs.current[user.id] = el)}
                autoPlay
                playsInline
                className="w-full h-full object-cover rounded-xl"
              />
            )}
            {!user.isSelf && (
              <div className="absolute top-2 right-2">
                <button
                  onClick={() => toggleMenu(user.id)}
                  className="p-1 rounded hover:bg-gray-600"
                >
                  <BsThreeDotsVertical />
                </button>
                {openMenuId === user.id && (
                  <div className="absolute right-0 mt-2 w-40 bg-gray-800 border border-gray-700 rounded shadow-lg z-10">
                    <button
                      onClick={() => updateParticipant(user.id, "isCameraOff")}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-700"
                    >
                      {user.isCameraOff ? "Bật camera" : "Tắt camera"}
                    </button>
                    <button
                      onClick={() => updateParticipant(user.id, "isMicOff")}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-700"
                    >
                      {user.isMicOff ? "Bật micro" : "Tắt micro"}
                    </button>
                  </div>
                )}
              </div>
            )}
            <span className="absolute bottom-2 left-2 text-xs text-gray-300">
              {user.name}
            </span>
            <div className="absolute bottom-2 right-2 text-white">
              {user.isMicOff ? (
                <FaMicrophoneSlash className="text-red-500 text-lg" />
              ) : (
                <FaMicrophone className="text-green-400 text-lg" />
              )}
            </div>
          </div>
        ))}
        {participants.length > MAX_VISIBLE && (
          <div
            className="w-full h-52 rounded-xl flex items-center justify-center cursor-pointer bg-gray-700 hover:bg-gray-600 text-xl font-semibold select-none"
            onClick={() => setShowMoreModal(true)}
          >
            +{participants.length - MAX_VISIBLE} thêm
          </div>
        )}
      </div>
      <div className="flex justify-center items-center gap-6 mt-6">
        <button
          onClick={toggleMicrophone}
          className="p-3 rounded-full bg-gray-800 hover:bg-gray-700"
          title={
            participants.find((p) => p.isSelf)?.isMicOff
              ? "Bật micro"
              : "Tắt micro"
          }
        >
          {participants.find((p) => p.isSelf)?.isMicOff ? (
            <FaMicrophoneSlash className="text-red-500 text-xl" />
          ) : (
            <FaMicrophone className="text-green-400 text-xl" />
          )}
        </button>
        <button
          onClick={toggleCamera}
          className="p-3 rounded-full bg-gray-800 hover:bg-gray-700"
          title={
            participants.find((p) => p.isSelf)?.isCameraOff
              ? "Bật camera"
              : "Tắt camera"
          }
        >
          {participants.find((p) => p.isSelf)?.isCameraOff ? (
            <FaVideoSlash className="text-red-500 text-xl" />
          ) : (
            <HiMiniVideoCamera className="text-green-400 text-xl" />
          )}
        </button>
        <button
          onClick={handleEndCall}
          className="p-3 rounded-full bg-red-600 hover:bg-red-700"
          title="Kết thúc cuộc gọi"
        >
          <FaPhoneSlash className="text-white text-xl" />
        </button>
      </div>
      {showMoreModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl max-w-3xl w-full max-h-[80vh] overflow-y-auto p-6 relative">
            <button
              onClick={() => setShowMoreModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-700"
            >
              <X size={20} />
            </button>
            <h3 className="text-xl font-semibold mb-4">
              Quản lý người tham gia
            </h3>
            <p className="mb-4 text-gray-400 text-sm">
              Bấm vào tên để ghim/bỏ ghim người đó lên video chính (tối đa{" "}
              {MAX_VISIBLE})
            </p>
            <ul className="divide-y divide-gray-700">
              {participants.map((user) => (
                <li
                  key={user.id}
                  className={`flex justify-between items-center py-3 cursor-pointer hover:bg-blue-400 px-3 rounded ${
                    visibleParticipantIds.includes(user.id) ? "bg-blue-700" : ""
                  } ${user.isSelf ? "cursor-not-allowed" : ""}`}
                  onClick={() => togglePinParticipant(user.id)}
                >
                  <div>
                    <span className="font-medium">{user.name}</span>
                    {user.isSelf && (
                      <span className="ml-2 text-xs italic">(Bạn)</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 relative">
                    {user.isMicOff ? (
                      <FaMicrophoneSlash className="text-red-500" />
                    ) : (
                      <FaMicrophone className="text-green-400" />
                    )}
                    {!user.isSelf && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleModalMenu(user.id);
                          }}
                          className="p-1 rounded hover:bg-gray-700"
                        >
                          <BsThreeDotsVertical />
                        </button>
                        {openModalMenuId === user.id && (
                          <div className="absolute right-0 top-full mt-1 w-36 bg-gray-800 border border-gray-700 rounded shadow-lg z-20">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                updateParticipant(user.id, "isCameraOff");
                              }}
                              className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-700"
                            >
                              {user.isCameraOff ? "Bật camera" : "Tắt camera"}
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                updateParticipant(user.id, "isMicOff");
                              }}
                              className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-700"
                            >
                              {user.isMicOff ? "Bật micro" : "Tắt micro"}
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoCallPage;

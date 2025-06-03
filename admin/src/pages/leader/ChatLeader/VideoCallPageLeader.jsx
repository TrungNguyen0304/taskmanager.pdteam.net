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
import { MdScreenShare, MdStopScreenShare } from "react-icons/md";
import io from "socket.io-client";
import axios from "axios";

const socket = io("http://localhost:8001", {
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
}); // Replace with your Socket.IO server URL
const API_BASE_URL = "http://localhost:8001/api/group";

const MAX_VISIBLE = 5;

const VideoCallPageLeader = ({ userId, authToken }) => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("user")) || {
    _id: userId || "guest",
    name: "Guest",
  };

  // Initialize participants with current user
  const [participants, setParticipants] = useState([
    {
      id: currentUser._id,
      name: currentUser.name,
      isSelf: true,
      isCameraOff: false,
      isMicOff: false,
    },
  ]);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [showMoreModal, setShowMoreModal] = useState(false);
  const [openModalMenuId, setOpenModalMenuId] = useState(null);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [callStatus, setCallStatus] = useState({
    isCallActive: false,
    participants: [],
    isScreenShareActive: false,
    screenSharers: [],
  });
  const [error, setError] = useState(null);

  const selfVideoRef = useRef(null);
  const screenShareVideoRef = useRef(null);
  const [selfStream, setSelfStream] = useState(null);
  const peerConnections = useRef(new Map());
  const remoteStreams = useRef(new Map());
  const videoRefs = useRef(new Map());

  const [visibleParticipantIds, setVisibleParticipantIds] = useState([
    currentUser._id,
  ]);

  const self = participants.find((p) => p.isSelf);

  // WebRTC configuration
  const configuration = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
    ],
  };

  // Fetch call status and participants
  const fetchCallStatus = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/${groupId}/call-status`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setCallStatus(response.data);
      const serverParticipants = response.data.participants || [];
      const updatedParticipants = serverParticipants.map((sp) => ({
        id: sp.userId,
        name: sp.userName,
        isSelf: sp.userId === currentUser._id,
        isCameraOff: sp.isCameraOff || false,
        isMicOff: sp.isMicOff || false,
      }));

      // Ensure current user is included
      if (!updatedParticipants.some((p) => p.isSelf)) {
        updatedParticipants.push({
          id: currentUser._id,
          name: currentUser.name,
          isSelf: true,
          isCameraOff: false,
          isMicOff: false,
        });
      }
      setParticipants(updatedParticipants);

      // Update visible participant IDs
      const selfId = updatedParticipants.find((p) => p.isSelf)?.id;
      const sortedParticipants = updatedParticipants
        .filter((p) => !p.isSelf)
        .sort((a, b) => {
          const aScore = !a.isCameraOff && !a.isMicOff ? 3 : !a.isMicOff ? 2 : !a.isCameraOff ? 1 : 0;
          const bScore = !b.isCameraOff && !b.isMicOff ? 3 : !b.isMicOff ? 2 : !b.isCameraOff ? 1 : 0;
          return bScore - aScore;
        });
      const newVisibleIds = [
        selfId,
        ...sortedParticipants.slice(0, MAX_VISIBLE - 1).map((p) => p.id),
      ].filter(Boolean);
      setVisibleParticipantIds(newVisibleIds);
      setError(null);
    } catch (error) {
      console.error("Error fetching call status:", error.response?.data?.message || error.message);
      setError("Không thể tải danh sách người tham gia. Vui lòng thử lại.");
    }
  };

  // Initiate call
  const initCall = async () => {
    try {
      await axios.post(`${API_BASE_URL}/${groupId}/call`, {}, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      socket.emit("start-call", { groupId, userId: currentUser._id, offer: null });
    } catch (error) {
      console.error("Error initiating call:", error.response?.data?.message || error.message);
      setError("Không thể khởi tạo cuộc gọi. Vui lòng thử lại.");
    }
  };

  // Initialize WebRTC, Socket.IO, and fetch participants
  useEffect(() => {
    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
      socket.emit("user-online", currentUser._id);
    });
    socket.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
      setError("Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.");
    });
    socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    fetchCallStatus();
    initCall();

    const initWebRTC = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setSelfStream(stream);
        if (selfVideoRef.current) {
          selfVideoRef.current.srcObject = stream;
        }

        socket.on("call-started", async ({ groupId: callGroupId, userId: callerId, offer }) => {
          if (callGroupId !== groupId || callerId === currentUser._id) return;

          const peerConnection = new RTCPeerConnection(configuration);
          peerConnections.current.set(callerId, peerConnection);

          stream.getTracks().forEach((track) => peerConnection.addTrack(track, stream));

          peerConnection.ontrack = (event) => {
            const [remoteStream] = event.streams;
            remoteStreams.current.set(callerId, remoteStream);
            const videoElement = videoRefs.current.get(callerId);
            if (videoElement) {
              videoElement.srcObject = remoteStream;
            }
          };

          peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
              socket.emit("ice-candidate", {
                groupId,
                userId: currentUser._id,
                candidate: event.candidate,
                toUserId: callerId,
              });
            }
          };

          if (offer) {
            await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);
            socket.emit("call-answer", { groupId, userId: currentUser._id, answer, toUserId: callerId });
          }
        });

        socket.on("call-answer", async ({ groupId: callGroupId, userId: answererId, answer }) => {
          if (callGroupId !== groupId) return;
          const peerConnection = peerConnections.current.get(answererId);
          if (peerConnection && answer) {
            await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
          }
        });

        socket.on("ice-candidate", ({ groupId: callGroupId, userId: senderId, candidate }) => {
          if (callGroupId !== groupId) return;
          const peerConnection = peerConnections.current.get(senderId);
          if (peerConnection && candidate) {
            peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
          }
        });

        socket.on("call-ended", ({ groupId: callGroupId, userId: endedUserId }) => {
          if (callGroupId !== groupId) return;
          const peerConnection = peerConnections.current.get(endedUserId);
          if (peerConnection) {
            peerConnection.close();
            peerConnections.current.delete(endedUserId);
            remoteStreams.current.delete(endedUserId);
            const videoElement = videoRefs.current.get(endedUserId);
            if (videoElement) {
              videoElement.srcObject = null;
            }
          }
          fetchCallStatus();
        });

        socket.on("screen-share-started", async ({ groupId: callGroupId, userId: sharerId, offer }) => {
          if (callGroupId !== groupId || sharerId === currentUser._id) return;

          const peerConnection = new RTCPeerConnection(configuration);
          peerConnections.current.set(`screen-${sharerId}`, peerConnection);

          peerConnection.ontrack = (event) => {
            const [remoteStream] = event.streams;
            remoteStreams.current.set(`screen-${sharerId}`, remoteStream);
            if (screenShareVideoRef.current) {
              screenShareVideoRef.current.srcObject = remoteStream;
            }
          };

          peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
              socket.emit("ice-candidate", {
                groupId,
                userId: currentUser._id,
                candidate: event.candidate,
                toUserId: sharerId,
              });
            }
          };

          if (offer) {
            await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);
            socket.emit("call-answer", { groupId, userId: currentUser._id, answer, toUserId: sharerId });
          }
          fetchCallStatus();
        });

        socket.on("screen-share-stopped", ({ groupId: callGroupId, userId: sharerId }) => {
          if (callGroupId !== groupId) return;
          const peerConnection = peerConnections.current.get(`screen-${sharerId}`);
          if (peerConnection) {
            peerConnection.close();
            peerConnections.current.delete(`screen-${sharerId}`);
            remoteStreams.current.delete(`screen-${sharerId}`);
            if (screenShareVideoRef.current) {
              screenShareVideoRef.current.srcObject = null;
            }
          }
          fetchCallStatus();
        });
      } catch (error) {
        console.error("Error initializing WebRTC:", error);
        setError("Không thể truy cập camera hoặc micro. Vui lòng kiểm tra quyền truy cập.");
      }
    };

    initWebRTC();

    return () => {
      if (selfStream) {
        selfStream.getTracks().forEach((track) => track.stop());
      }
      peerConnections.current.forEach((pc) => pc.close());
      socket.off("connect");
      socket.off("connect_error");
      socket.off("disconnect");
      socket.off("call-started");
      socket.off("call-answer");
      socket.off("ice-candidate");
      socket.off("call-ended");
      socket.off("screen-share-started");
      socket.off("screen-share-stopped");
    };
  }, [groupId, currentUser._id]);

  // Handle camera toggle
  useEffect(() => {
    if (selfStream && self) {
      selfStream.getVideoTracks().forEach((track) => {
        track.enabled = !self.isCameraOff;
      });
    }
  }, [self?.isCameraOff, selfStream]);

  // Handle microphone toggle
  useEffect(() => {
    if (selfStream && self) {
      selfStream.getAudioTracks().forEach((track) => {
        track.enabled = !self.isMicOff;
      });
    }
  }, [self?.isMicOff, selfStream]);

  // Handle screen sharing
  const handleScreenShare = async () => {
    try {
      await axios.post(`${API_BASE_URL}/${groupId}/screen-share`, {}, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (!isScreenSharing) {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        setIsScreenSharing(true);
        const peerConnection = new RTCPeerConnection(configuration);
        peerConnections.current.set(`screen-${currentUser._id}`, peerConnection);

        stream.getTracks().forEach((track) => peerConnection.addTrack(track, stream));

        peerConnection.onicecandidate = (event) => {
          if (event.candidate) {
            socket.emit("ice-candidate", {
              groupId,
              userId: currentUser._id,
              candidate: event.candidate,
              toUserId: null,
            });
          }
        };

        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        socket.emit("start-screen-share", { groupId, userId: currentUser._id, offer });

        stream.getVideoTracks()[0].onended = () => {
          handleStopScreenShare();
        };
      }
    } catch (error) {
      console.error("Error starting screen share:", error.response?.data?.message || error.message);
      setError("Không thể chia sẻ màn hình. Vui lòng thử lại.");
    }
  };

  const handleStopScreenShare = async () => {
    setIsScreenSharing(false);
    const peerConnection = peerConnections.current.get(`screen-${currentUser._id}`);
    if (peerConnection) {
      peerConnection.close();
      peerConnections.current.delete(`screen-${currentUser._id}`);
      socket.emit("stop-screen-share", { groupId, userId: currentUser._id });
    }
    try {
      await axios.post(`${API_BASE_URL}/${groupId}/screen-share`, {}, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      fetchCallStatus();
    } catch (error) {
      console.error("Error stopping screen share:", error.response?.data?.message || error.message);
      setError("Không thể dừng chia sẻ màn hình. Vui lòng thử lại.");
    }
  };

  const handleEndCall = async () => {
    if (selfStream) {
      selfStream.getTracks().forEach((track) => track.stop());
    }
    peerConnections.current.forEach((pc) => pc.close());
    socket.emit("end-call", { groupId, userId: currentUser._id });
    try {
      await axios.post(`${API_BASE_URL}/${groupId}/call`, {}, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      navigate("/chat");
    } catch (error) {
      console.error("Error ending call:", error.response?.data?.message || error.message);
      navigate("/chat");
    }
  };

  const toggleMenu = (userId) => {
    setOpenMenuId((prev) => (prev === userId ? null : userId));
  };

  const toggleModalMenu = (userId) => {
    setOpenModalMenuId((prev) => (prev === userId ? null : userId));
  };

  const updateParticipant = (userId, key) => {
    setParticipants((prev) =>
      prev.map((p) => (p.id === userId ? { ...p, [key]: !p[key] } : p))
    );
    setOpenMenuId(null);
    setOpenModalMenuId(null);
  };

  const togglePinParticipant = (userId) => {
    if (userId === currentUser._id) return;

    setVisibleParticipantIds((prev) => {
      let newIds;
      if (prev.includes(userId)) {
        newIds = prev.filter((id) => id !== userId);
        if (newIds.length < MAX_VISIBLE) {
          const sortedParticipants = participants
            .filter((p) => !p.isSelf && !newIds.includes(p.id))
            .sort((a, b) => {
              const aScore = !a.isCameraOff && !a.isMicOff ? 3 : !a.isMicOff ? 2 : !a.isCameraOff ? 1 : 0;
              const bScore = !b.isCameraOff && !b.isMicOff ? 3 : !b.isMicOff ? 2 : !b.isCameraOff ? 1 : 0;
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
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-4 py-2 rounded-lg shadow">
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
            className={`w-full h-52 rounded-xl flex items-center justify-center relative ${user.isSelf ? "bg-blue-700" : "bg-gray-700"
              }`}
          >
            {user.isSelf ? (
              user.isCameraOff ? (
                <span className="text-sm text-gray-400 italic">Camera đã tắt</span>
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
              <span className="text-sm text-gray-400 italic">Camera đã tắt</span>
            ) : (
              <video
                ref={(el) => videoRefs.current.set(user.id, el)}
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

        {callStatus.isScreenShareActive && (
          <div className="w-full h-52 rounded-xl flex items-center justify-center relative bg-gray-700">
            <video
              ref={screenShareVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover rounded-xl"
            />
            <span className="absolute bottom-2 left-2 text-xs text-gray-300">
              Screen Share ({callStatus.screenSharers[0]?.userName || "Unknown"})
            </span>
          </div>
        )}

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
          onClick={() =>
            self &&
            setParticipants((prev) =>
              prev.map((p) => (p.isSelf ? { ...p, isMicOff: !p.isMicOff } : p))
            )
          }
          className="p-3 rounded-full bg-gray-800 hover:bg-gray-700"
          title={self?.isMicOff ? "Bật micro" : "Tắt micro"}
        >
          {self?.isMicOff ? (
            <FaMicrophoneSlash className="text-red-500 text-xl" />
          ) : (
            <FaMicrophone className="text-green-400 text-xl" />
          )}
        </button>

        <button
          onClick={() =>
            self &&
            setParticipants((prev) =>
              prev.map((p) => (p.isSelf ? { ...p, isCameraOff: !p.isCameraOff } : p))
            )
          }
          className="p-3 rounded-full bg-gray-800 hover:bg-gray-700"
          title={self?.isCameraOff ? "Bật camera" : "Tắt camera"}
        >
          {self?.isCameraOff ? (
            <FaVideoSlash className="text-red-500 text-xl" />
          ) : (
            <HiMiniVideoCamera className="text-green-400 text-xl" />
          )}
        </button>

        <button
          onClick={isScreenSharing ? handleStopScreenShare : handleScreenShare}
          className="p-3 rounded-full bg-gray-800 hover:bg-gray-700"
          title={isScreenSharing ? "Dừng chia sẻ màn hình" : "Chia sẻ màn hình"}
        >
          {isScreenSharing ? (
            <MdStopScreenShare className="text-red-500 text-xl" />
          ) : (
            <MdScreenShare className="text-green-400 text-xl" />
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
            <h3 className="text-xl font-semibold mb-4">Quản lý người tham gia</h3>
            <p className="mb-4 text-gray-400 text-sm">
              Bấm vào tên để ghim/bỏ ghim người đó lên video chính (tối đa {MAX_VISIBLE})
            </p>
            <ul className="divide-y divide-gray-700">
              {participants.map((user) => (
                <li
                  key={user.id}
                  className={`flex justify-between items-center py-3 cursor-pointer hover:bg-blue-400 px-3 rounded ${visibleParticipantIds.includes(user.id) ? "bg-blue-700" : ""
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

export default VideoCallPageLeader;
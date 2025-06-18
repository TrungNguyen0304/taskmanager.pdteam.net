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
});
const API_BASE_URL = "http://localhost:8001/api/group";

const MAX_VISIBLE = 5;

const VideoCallPageMember = ({ userId, authToken }) => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("user")) || {
    _id: userId || "guest",
    name: "Guest",
  };
  const token = authToken || localStorage.getItem("token");

  // Validate user and token
  if (!token || !currentUser._id || currentUser._id === "guest") {
    console.error("Invalid authToken or userId:", { authToken: token, userId: currentUser._id });
    navigate("/login");
    return (
      <div className="h-screen bg-gray-900 text-white flex flex-col p-4 relative rounded-2xl shadow-lg">
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-4 py-2 rounded-lg shadow">
          Không có token xác thực hoặc thông tin người dùng không hợp lệ. Vui lòng đăng nhập lại.
        </div>
      </div>
    );
  }

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
  const [notification, setNotification] = useState(false);

  const selfVideoRef = useRef(null);
  const screenShareVideoRef = useRef(null);
  const [selfStream, setSelfStream] = useState(null);
  const peerConnections = useRef(new Map());
  const remoteStreams = useRef(new Map());
  const videoRefs = useRef(new Map());
  const pendingCandidates = useRef(new Map());

  const [visibleParticipantIds, setVisibleParticipantIds] = useState([
    currentUser._id,
  ]);

  const self = participants.find((p) => p.isSelf);

  const configuration = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
    ],
  };

  const fetchJSON = async (url) => {
    console.log("Fetching URL:", url, "with headers:", { Authorization: `Bearer ${token}` });
    try {
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error("Full error response:", error.response?.data);
      throw error;
    }
  };

  const postJSON = async (url, body) => {
    console.log("Posting to URL:", url, "with headers:", { Authorization: `Bearer ${token}` }, "and body:", body);
    try {
      const response = await axios.post(url, body, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Full error response:", error.response?.data);
      throw error;
    }
  };

  const fetchCallStatus = async () => {
    try {
      console.log("Fetching call status for groupId:", groupId);
      const data = await fetchJSON(`${API_BASE_URL}/${groupId}/call-status`);
      setCallStatus(data);
      const serverParticipants = data.participants || [];
      const updatedParticipants = serverParticipants.map((sp) => ({
        id: sp.userId,
        name: sp.userName,
        isSelf: sp.userId === currentUser._id,
        isCameraOff: sp.isCameraOff || false,
        isMicOff: sp.isMicOff || false,
      }));

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

      if (data.inCall) {
        setNotification(true);
      }
    } catch (error) {
      console.error("Error fetching call status:", error.message);
      if (error.response?.status === 403) {
        setError("Bạn không có quyền truy cập nhóm này hoặc token không hợp lệ.");
      } else {
        setError("Không thể tải danh sách người tham gia. Vui lòng thử lại.");
      }
    }
  };

  const addVideoStream = (id, stream, label) => {
    if (videoRefs.current.has(id)) return;
    remoteStreams.current.set(id, stream);
    const videoElement = videoRefs.current.get(id);
    if (videoElement) {
      videoElement.srcObject = stream;
    }
    setParticipants((prev) => {
      if (prev.some((p) => p.id === id)) return prev;
      return [...prev, { id, name: label, isSelf: id === currentUser._id, isCameraOff: false, isMicOff: false }];
    });
  };

  const initCall = async () => {
    try {
      console.log("Initiating call for groupId:", groupId);
      await postJSON(`${API_BASE_URL}/${groupId}/call`, {});
      socket.emit("start-call", { groupId, userId: currentUser._id, offer: null });
    } catch (error) {
      console.error("Error initiating call:", error.message);
      if (error.response?.status === 403) {
        setError("Bạn không có quyền khởi tạo cuộc gọi hoặc token không hợp lệ.");
      } else {
        setError("Không thể khởi tạo cuộc gọi. Vui lòng thử lại.");
      }
    }
  };

  const joinCall = async () => {
    setNotification(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setSelfStream(stream);
      if (selfVideoRef.current) {
        selfVideoRef.current.srcObject = stream;
      }
      addVideoStream(currentUser._id, stream, "Bạn");
    } catch (error) {
      console.error("Error joining call:", error);
      setError("Không thể truy cập camera hoặc micro. Vui lòng kiểm tra quyền truy cập.");
    }
  };

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
      socket.emit("user-online", currentUser._id);
      socket.emit("join-group", { userId: currentUser._id, groupId });
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
        addVideoStream(currentUser._id, stream, "Bạn");

        socket.on("call-started", async ({ groupId: callGroupId, userId: fromId, userName, offer }) => {
          if (callGroupId !== groupId || fromId === currentUser._id) return;
          setNotification(true);

          window.joinCall = async () => {
            setNotification(false);
            const pc = new RTCPeerConnection(configuration);
            peerConnections.current.set(fromId, pc);

            stream.getTracks().forEach((track) => pc.addTrack(track, stream));

            pc.onicecandidate = (event) => {
              if (event.candidate) {
                socket.emit("ice-candidate", {
                  groupId,
                  userId: currentUser._id,
                  candidate: event.candidate,
                  toUserId: fromId,
                });
              }
            };

            pc.ontrack = (event) => {
              const [remoteStream] = event.streams;
              addVideoStream(fromId, remoteStream, userName);
            };

            await pc.setRemoteDescription(new RTCSessionDescription(offer));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            socket.emit("call-answer", { groupId, userId: currentUser._id, answer, toUserId: fromId });
          };
        });

        socket.on("call-answer", async ({ groupId: callGroupId, userId: fromId, answer }) => {
          if (callGroupId !== groupId) return;
          const pc = peerConnections.current.get(fromId) || peerConnections.current.get(`screen-${fromId}`);
          if (!pc || pc.signalingState === "stable") return;
          try {
            await pc.setRemoteDescription(new RTCSessionDescription(answer));
            if (pendingCandidates.current.has(fromId)) {
              for (const candidate of pendingCandidates.current.get(fromId)) {
                await pc.addIceCandidate(new RTCIceCandidate(candidate));
              }
              pendingCandidates.current.delete(fromId);
            }
          } catch (err) {
            console.warn("Error setting remote description:", err);
          }
        });

        socket.on("ice-candidate", async ({ groupId: callGroupId, userId: fromId, candidate }) => {
          if (callGroupId !== groupId) return;
          const pc = peerConnections.current.get(fromId) || peerConnections.current.get(`screen-${fromId}`);
          if (pc && pc.remoteDescription && pc.remoteDescription.type) {
            try {
              await pc.addIceCandidate(new RTCIceCandidate(candidate));
            } catch (err) {
              console.warn("ICE candidate error:", err);
            }
          } else {
            if (!pendingCandidates.current.has(fromId)) {
              pendingCandidates.current.set(fromId, []);
            }
            pendingCandidates.current.get(fromId).push(candidate);
          }
        });

        socket.on("call-ended", ({ groupId: callGroupId, userId: endedUserId }) => {
          if (callGroupId !== groupId) return;
          const pc = peerConnections.current.get(endedUserId);
          if (pc) {
            pc.close();
            peerConnections.current.delete(endedUserId);
            remoteStreams.current.delete(endedUserId);
            videoRefs.current.delete(endedUserId);
          }
          fetchCallStatus();
        });

        socket.on("screen-share-started", async ({ groupId: callGroupId, userId: sharerId, userName, offer }) => {
          if (callGroupId !== groupId || sharerId === currentUser._id) return;

          const pc = new RTCPeerConnection(configuration);
          peerConnections.current.set(`screen-${sharerId}`, pc);

          pc.ontrack = (event) => {
            const [remoteStream] = event.streams;
            remoteStreams.current.set(`screen-${sharerId}`, remoteStream);
            if (screenShareVideoRef.current) {
              screenShareVideoRef.current.srcObject = remoteStream;
            }
            addVideoStream(`screen-${sharerId}`, remoteStream, `Màn hình ${userName}`);
          };

          pc.onicecandidate = (event) => {
            if (event.candidate) {
              socket.emit("ice-candidate", {
                groupId,
                userId: currentUser._id,
                candidate: event.candidate,
                toUserId: sharerId,
              });
            }
          };

          await pc.setRemoteDescription(new RTCSessionDescription(offer));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socket.emit("call-answer", { groupId, userId: currentUser._id, answer, toUserId: sharerId });
          fetchCallStatus();
        });

        socket.on("screen-share-stopped", ({ groupId: callGroupId, userId: sharerId }) => {
          if (callGroupId !== groupId) return;
          const pc = peerConnections.current.get(`screen-${sharerId}`);
          if (pc) {
            pc.close();
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

  useEffect(() => {
    if (selfStream && self) {
      selfStream.getVideoTracks().forEach((track) => {
        track.enabled = !self.isCameraOff;
      });
    }
  }, [self?.isCameraOff, selfStream]);

  useEffect(() => {
    if (selfStream && self) {
      selfStream.getAudioTracks().forEach((track) => {
        track.enabled = !self.isMicOff;
      });
    }
  }, [self?.isMicOff, selfStream]);

  const handleScreenShare = async () => {
    try {
      await postJSON(`${API_BASE_URL}/${groupId}/screen-share`, {});
      if (!isScreenSharing) {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        setIsScreenSharing(true);
        addVideoStream(`screen-${currentUser._id}`, stream, "Chia sẻ màn hình");

        const pc = new RTCPeerConnection(configuration);
        peerConnections.current.set(`screen-${currentUser._id}`, pc);

        stream.getTracks().forEach((track) => pc.addTrack(track, stream));

        pc.onicecandidate = (event) => {
          if (event.candidate) {
            socket.emit("ice-candidate", {
              groupId,
              userId: currentUser._id,
              candidate: event.candidate,
              toUserId: null,
            });
          }
        };

        pc.ontrack = (event) => {
          addVideoStream(`remote-screen-${currentUser._id}`, event.streams[0], "Màn hình");
        };

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit("start-screen-share", { groupId, userId: currentUser._id, offer });

        stream.getVideoTracks()[0].onended = () => {
          handleStopScreenShare();
        };
      }
    } catch (error) {
      console.error("Error starting screen share:", error.message);
      setError("Không thể chia sẻ màn hình. Vui lòng thử lại.");
    }
  };

  const handleStopScreenShare = async () => {
    setIsScreenSharing(false);
    const pc = peerConnections.current.get(`screen-${currentUser._id}`);
    if (pc) {
      pc.close();
      peerConnections.current.delete(`screen-${currentUser._id}`);
      remoteStreams.current.delete(`screen-${currentUser._id}`);
      socket.emit("stop-screen-share", { groupId, userId: currentUser._id });
    }
    try {
      await postJSON(`${API_BASE_URL}/${groupId}/screen-share`, {});
      fetchCallStatus();
    } catch (error) {
      console.error("Error stopping screen share:", error.message);
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
      await postJSON(`${API_BASE_URL}/${groupId}/call`, {});
      navigate("/chat");
    } catch (error) {
      console.error("Error ending call:", error.message);
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
      {notification && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-black px-4 py-2 rounded-lg shadow">
          📞 Nhóm đang có cuộc gọi!
          <button
            onClick={joinCall}
            className="ml-2 px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            🎥 Tham gia
          </button>
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
            className={`w-full h-52 rounded-xl flex items-center justify-center relative ${user.isSelf ? "bg-blue-700" : "bg-gray-700"}`}
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

export default VideoCallPageMember;
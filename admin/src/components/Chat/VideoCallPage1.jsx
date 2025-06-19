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

const VideoCallPage1 = ({ userId, authToken, isLeader }) => {
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
      <div className="h-screen bg-gray-900 flex items-center justify-center text-white">
        <p>Đang chuyển hướng đến trang đăng nhập...</p>
      </div>
    );
  }

  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState({});
  const [peers, setPeers] = useState({});
  const [isMicOff, setIsMicOff] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [callActive, setCallActive] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [sharingScreen, setSharingScreen] = useState(false);
  const [screenStream, setScreenStream] = useState(null);
  const [isSharingLocalVideo, setIsSharingLocalVideo] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState({});
  const [openModalMenuId, setOpenModalMenuId] = useState(null);
  const localVideoRef = useRef(null);
  const screenVideoRef = useRef(null);
  const [hasInitiatedCall, setHasInitiatedCall] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const initializeCall = async () => {
      if (!groupId || !socket || !token || !currentUser._id) {
        console.error("Missing call initialization data.");
        return;
      }

      try {
        const statusRes = await axios.get(`${API_BASE_URL}/${groupId}/call-status`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!isMounted) return;

        const { isActive: serverIsActive } = statusRes.data;

        if (!serverIsActive && !hasInitiatedCall) {
          console.log(`Initiating new call for groupId: ${groupId}`);
          socket.emit("startGroupCall", { groupId, callerName: currentUser.name });

          await axios.post(
            `${API_BASE_URL}/${groupId}/call`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
          );

          if (isMounted) {
            setHasInitiatedCall(true);
            setCallActive(true);
          }
        } else if (serverIsActive) {
          console.log(`Call already active for groupId: ${groupId}. Joining...`);
          if (isMounted) {
            setCallActive(true);
          }
          socket.emit("joinVideoCall", { groupId, userId: currentUser._id, userName: currentUser.name });
        }
      } catch (error) {
        console.error("Error checking call status or initiating/joining call:", error);
      }
    };

    initializeCall();

    socket.on("groupCallStartedConfirmation", ({ groupId: confirmedGroupId }) => {
      if (confirmedGroupId === groupId && isMounted) {
        console.log(`Call confirmed started for groupId: ${confirmedGroupId}`);
        setCallActive(true);
        setHasInitiatedCall(true);
      }
    });

    socket.on("groupCallEnded", ({ groupId: endedGroupId }) => {
      if (endedGroupId === groupId && isMounted) {
        console.log(`Call ended for groupId: ${endedGroupId}`);
        setCallActive(false);
        setHasInitiatedCall(false);
        setLocalStream(null);
        setRemoteStreams({});
        setPeers({});
        setParticipants([]);
        setSharingScreen(false);
        setScreenStream(null);
        navigate(`/chat`);
      }
    });

    socket.on("groupCallIncoming", ({ groupId: incomingGroupId, callerName }) => {
      if (incomingGroupId === groupId && isMounted) {
        console.log(`Incoming call notification for groupId: ${incomingGroupId} from ${callerName}`);
        setCallActive(true);
      }
    });

    // Handle Leader commands
    socket.on("leader-toggle-camera", ({ targetUserId, isCameraOff: state }) => {
      if (targetUserId === currentUser._id && isMounted) {
        toggleCamera();
      }
    });

    socket.on("leader-toggle-mic", ({ targetUserId, isMicOff: state }) => {
      if (targetUserId === currentUser._id && isMounted) {
        toggleMic();
      }
    });

    return () => {
      isMounted = false;
      socket.off("groupCallStartedConfirmation");
      socket.off("groupCallEnded");
      socket.off("groupCallIncoming");
      socket.off("leader-toggle-camera");
      socket.off("leader-toggle-mic");
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
      if (screenStream) {
        screenStream.getTracks().forEach((track) => track.stop());
      }
      Object.values(peers).forEach((peer) => peer.close());
    };
  }, [groupId, socket, token, currentUser._id, navigate]);

  useEffect(() => {
    if (!callActive) return;

    const startLocalStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        socket.emit("user-connected", {
          groupId,
          userId: currentUser._id,
          userName: currentUser.name,
        });

        socket.on("user-connected", ({ userId: newUserId, userName: newUserName }) => {
          if (newUserId === currentUser._id) return;

          console.log(`User ${newUserName} (${newUserId}) connected to group`);
          setParticipants((prev) => {
            const newParticipants = [...prev];
            if (!newParticipants.some(p => p.id === newUserId)) {
              newParticipants.push({ id: newUserId, name: newUserName, isMicOff: false, isCameraOff: false, isSharingScreen: false });
            }
            return newParticipants;
          });

          const peer = createPeer(newUserId, currentUser._id, stream);
          setPeers((prev) => ({ ...prev, [newUserId]: peer }));
        });

        socket.on("user-disconnected", ({ userId: disconnectedUserId }) => {
          console.log(`User ${disconnectedUserId} disconnected from group`);
          setParticipants((prev) => prev.filter((p) => p.id !== disconnectedUserId));
          setRemoteStreams((prev) => {
            const newStreams = { ...prev };
            delete newStreams[disconnectedUserId];
            return newStreams;
          });
          if (peers[disconnectedUserId]) {
            peers[disconnectedUserId].destroy();
            setPeers((prev) => {
              const newPeers = { ...prev };
              delete newPeers[disconnectedUserId];
              return newPeers;
            });
          }
        });

        socket.on("receiving-signal", ({ from, signal }) => {
          const peer = peers[from];
          if (peer) {
            peer.signal(signal);
          }
        });

        socket.on("call-participants", (activeParticipants) => {
          console.log("Active participants:", activeParticipants);
          setParticipants(activeParticipants.map(p => ({
            id: p.userId,
            name: p.userName,
            isMicOff: p.isMicOff || false,
            isCameraOff: p.isCameraOff || false,
            isSharingScreen: p.isSharingScreen || false,
          })));

          activeParticipants.forEach((p) => {
            if (p.userId !== currentUser._id && !peers[p.userId]) {
              const peer = addPeer(p.userId, currentUser._id, stream);
              setPeers((prev) => ({ ...prev, [p.userId]: peer }));
            }
          });
        });

        socket.emit("request-call-participants", { groupId });

      } catch (err) {
        console.error("Error accessing media devices.", err);
        alert("Không thể truy cập camera hoặc micro. Vui lòng kiểm tra quyền.");
        setCallActive(false);
        setHasInitiatedCall(false);
        navigate(`/chat`);
      }
    };

    startLocalStream();

    return () => {
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
      Object.values(peers).forEach((peer) => peer.destroy());
      socket.off("user-connected");
      socket.off("user-disconnected");
      socket.off("receiving-signal");
      socket.off("call-participants");
    };
  }, [callActive, groupId, socket, currentUser._id, currentUser.name, peers, navigate]);

  const createPeer = (userToSignal, callerId, stream) => {
    const peer = new window.SimplePeer({
      initiator: true,
      trickle: false,
      stream: stream,
    });

    peer.on("signal", (signal) => {
      socket.emit("sending-signal", {
        userToSignal,
        callerId,
        signal,
        groupId,
      });
    });

    peer.on("stream", (remoteStream) => {
      setRemoteStreams((prev) => ({
        ...prev,
        [userToSignal]: remoteStream,
      }));
    });

    peer.on("close", () => {
      console.log("Peer closed for", userToSignal);
      setRemoteStreams((prev) => {
        const newStreams = { ...prev };
        delete newStreams[userToSignal];
        return newStreams;
      });
      setPeers((prev) => {
        const newPeers = { ...prev };
        delete newPeers[userToSignal];
        return newPeers;
      });
    });

    peer.on("error", (err) => {
      console.error("Peer error:", err);
    });

    return peer;
  };

  const addPeer = (incomingSignalFrom, callerId, stream) => {
    const peer = new window.SimplePeer({
      initiator: false,
      trickle: false,
      stream: stream,
    });

    peer.on("signal", (signal) => {
      socket.emit("returning-signal", { signal, callerId: incomingSignalFrom, groupId });
    });

    peer.on("stream", (remoteStream) => {
      setRemoteStreams((prev) => ({
        ...prev,
        [incomingSignalFrom]: remoteStream,
      }));
    });

    peer.on("close", () => {
      console.log("Peer closed for", incomingSignalFrom);
      setRemoteStreams((prev) => {
        const newStreams = { ...prev };
        delete newStreams[incomingSignalFrom];
        return newStreams;
      });
      setPeers((prev) => {
        const newPeers = { ...prev };
        delete newPeers[incomingSignalFrom];
        return newPeers;
      });
    });

    peer.on("error", (err) => {
      console.error("Peer error:", err);
    });

    socket.on("receiving-returning-signal", ({ from, signal }) => {
      if (from === incomingSignalFrom) {
        peer.signal(signal);
      }
    });

    return peer;
  };

  const toggleMic = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
        setIsMicOff(!track.enabled);
        socket.emit("toggle-audio", {
          groupId,
          userId: currentUser._id,
          isMicOff: !track.enabled,
        });
      });
    }
  };

  const toggleCamera = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled;
        setIsCameraOff(!track.enabled);
        setIsSharingLocalVideo(!track.enabled);
        socket.emit("toggle-video", {
          groupId,
          userId: currentUser._id,
          isCameraOff: !track.enabled,
        });
      });
    }
  };

  const toggleScreenShare = async () => {
    if (!sharingScreen) {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        });
        setScreenStream(stream);
        setSharingScreen(true);
        if (screenVideoRef.current) {
          screenVideoRef.current.srcObject = stream;
        }

        Object.values(peers).forEach((peer) => {
          const currentVideoTrack = localStream.getVideoTracks()[0];
          if (currentVideoTrack) {
            peer.replaceTrack(currentVideoTrack, stream.getVideoTracks()[0], localStream);
          }
        });

        socket.emit("start-screen-share", {
          groupId,
          userId: currentUser._id,
          userName: currentUser.name,
        });

        stream.getVideoTracks()[0].onended = () => {
          toggleScreenShare();
        };

      } catch (err) {
        console.error("Error starting screen share:", err);
        setSharingScreen(false);
        setScreenStream(null);
      }
    } else {
      if (screenStream) {
        screenStream.getTracks().forEach((track) => track.stop());
      }
      setScreenStream(null);
      setSharingScreen(false);

      Object.values(peers).forEach((peer) => {
        const currentScreenTrack = screenStream ? screenStream.getVideoTracks()[0] : null;
        if (currentScreenTrack) {
          peer.removeTrack(currentScreenTrack, localStream);
        }
        const localVideoTrack = localStream.getVideoTracks()[0];
        if (localVideoTrack) {
          peer.addTrack(localVideoTrack, localStream);
        }
      });

      socket.emit("stop-screen-share", {
        groupId,
        userId: currentUser._id,
      });
    }
  };

  const endCall = () => {
    socket.emit("endGroupCall", { groupId, userId: currentUser._id });
  };

  useEffect(() => {
    socket.on("user-toggle-audio", ({ userId: toggledUserId, isMicOff: state }) => {
      setParticipants((prev) =>
        prev.map((p) => (p.id === toggledUserId ? { ...p, isMicOff: state } : p))
      );
    });

    socket.on("user-toggle-video", ({ userId: toggledUserId, isCameraOff: state }) => {
      setParticipants((prev) =>
        prev.map((p) => (p.id === toggledUserId ? { ...p, isCameraOff: state } : p))
      );
    });

    socket.on("user-start-screen-share", ({ userId: sharerId }) => {
      setParticipants(prev => prev.map(p => p.id === sharerId ? { ...p, isSharingScreen: true } : p));
    });

    socket.on("user-stop-screen-share", ({ userId: sharerId }) => {
      setParticipants(prev => prev.map(p => p.id === sharerId ? { ...p, isSharingScreen: false } : p));
    });

    socket.on('speaking', ({ userId: speakingUserId, speaking }) => {
      setIsSpeaking(prev => ({ ...prev, [speakingUserId]: speaking }));
    });

    return () => {
      socket.off("user-toggle-audio");
      socket.off("user-toggle-video");
      socket.off("user-start-screen-share");
      socket.off("user-stop-screen-share");
      socket.off("speaking");
    };
  }, [socket]);

  const updateParticipant = (userId, type) => {
    setParticipants((prev) =>
      prev.map((p) => {
        if (p.id === userId) {
          if (type === "isCameraOff") {
            return { ...p, isCameraOff: !p.isCameraOff };
          }
          if (type === "isMicOff") {
            return { ...p, isMicOff: !p.isMicOff };
          }
        }
        return p;
      })
    );
  };

  const getVisibleParticipants = () => {
    return participants
      .filter((p) => p.id !== currentUser._id)
      .slice(0, MAX_VISIBLE);
  };

  const hasMoreParticipants = participants.length > MAX_VISIBLE + 1;

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white overflow-hidden">
      <div className="px-4 py-3 sm:px-6 sm:py-4 bg-gray-800 border-b border-gray-700 flex justify-between items-center">
        <h2 className="text-xl sm:text-2xl font-bold text-blue-400">
          Cuộc gọi nhóm: {groupId}
        </h2>
        <button
          onClick={endCall}
          className="p-2 rounded-full bg-red-600 hover:bg-red-700 transition-colors flex items-center gap-2"
        >
          <FaPhoneSlash size={18} />
          <span className="hidden sm:inline">Kết thúc cuộc gọi</span>
        </button>
      </div>

      <div className="flex-grow p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 overflow-auto">
        <div className="relative bg-gray-700 rounded-lg shadow-lg aspect-video">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover rounded-lg ${isCameraOff ? "hidden" : ""}`}
          ></video>
          {isCameraOff && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800 rounded-lg">
              <span className="text-gray-400 text-lg">Camera Tắt</span>
            </div>
          )}
          {sharingScreen && (
            <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
              Đang chia sẻ màn hình
            </div>
          )}
          <div
            className={`absolute bottom-2 left-2 px-2 py-1 bg-black bg-opacity-50 rounded-md text-white text-sm ${isSpeaking[currentUser._id] ? 'border-2 border-green-400' : ''}`}
          >
            {currentUser.name} (Bạn)
            {isMicOff && (
              <FaMicrophoneSlash className="inline-block ml-1 text-red-400" size={12} />
            )}
          </div>
        </div>

        {Object.keys(remoteStreams).map((userId) => {
          const participant = participants.find((p) => p.id === userId);
          if (!participant) return null;

          return (
            <div key={userId} className="relative bg-gray-700 rounded-lg shadow-lg aspect-video">
              {!participant.isCameraOff ? (
                <video
                  ref={(video) => {
                    if (video) video.srcObject = remoteStreams[userId];
                  }}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover rounded-lg"
                ></video>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-800 rounded-lg">
                  <span className="text-gray-400 text-lg">Camera Tắt</span>
                </div>
              )}
              {participant.isSharingScreen && (
                <div className="absolute top-2 right-2 bg-purple-500 text-white text-xs px-2 py-1 rounded-full">
                  Đang chia sẻ màn hình
                </div>
              )}
              <div
                className={`absolute bottom-2 left-2 px-2 py-1 bg-black bg-opacity-50 rounded-md text-white text-sm ${isSpeaking[userId] ? 'border-2 border-green-400' : ''}`}
              >
                {participant.name}
                {participant.isMicOff && (
                  <FaMicrophoneSlash className="inline-block ml-1 text-red-400" size={12} />
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-4 bg-gray-800 border-t border-gray-700 flex justify-center items-center gap-4">
        <button
          onClick={toggleMic}
          className={`p-3 rounded-full ${isMicOff ? "bg-red-500" : "bg-blue-500"} hover:opacity-80 transition-opacity`}
        >
          {isMicOff ? (
            <FaMicrophoneSlash size={24} className="text-white" />
          ) : (
            <FaMicrophone size={24} className="text-white" />
          )}
        </button>
        <button
          onClick={toggleCamera}
          className={`p-3 rounded-full ${isCameraOff ? "bg-red-500" : "bg-blue-500"} hover:opacity-80 transition-opacity`}
        >
          {isCameraOff ? (
            <FaVideoSlash size={24} className="text-white" />
          ) : (
            <HiMiniVideoCamera size={24} className="text-white" />
          )}
        </button>
        <button
          onClick={toggleScreenShare}
          className={`p-3 rounded-full ${sharingScreen ? "bg-green-500" : "bg-gray-700"} hover:opacity-80 transition-opacity`}
        >
          {sharingScreen ? (
            <MdStopScreenShare size={24} className="text-white" />
          ) : (
            <MdScreenShare size={24} className="text-white" />
          )}
        </button>
      </div>

      {participants.length > 0 && (
        <div className="fixed right-0 top-0 h-full w-64 bg-gray-800 border-l border-gray-700 p-4 transform translate-x-0 transition-transform ease-in-out duration-300 z-30">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-white">Thành viên ({participants.length})</h3>
            <button
              onClick={() => setParticipants([])}
              className="text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>
          <div className="overflow-y-auto h-[calc(100%-60px)]">
            <ul className="space-y-3">
              {participants.map((user) => (
                <li
                  key={user.id}
                  className="flex items-center justify-between p-2 bg-gray-700 rounded-md"
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-sm font-bold text-white mr-2">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-white text-sm">{user.name}</span>
                    {user.id === currentUser._id && (
                      <span className="ml-1 text-xs text-gray-400">(Bạn)</span>
                    )}
                    {isSpeaking[user.id] && (
                      <span className="ml-2 text-green-400 text-xs">Đang nói...</span>
                    )}
                  </div>
                  <div className="relative">
                    {(user.isMicOff || user.isCameraOff || user.isSharingScreen) && (
                      <div className="flex gap-1 text-gray-400">
                        {user.isMicOff && <FaMicrophoneSlash size={16} title="Mic tắt" />}
                        {user.isCameraOff && <FaVideoSlash size={16} title="Camera tắt" />}
                        {user.isSharingScreen && <MdScreenShare size={16} title="Chia sẻ màn hình" />}
                      </div>
                    )}
                    {isLeader && user.id !== currentUser._id && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenModalMenuId(openModalMenuId === user.id ? null : user.id);
                          }}
                          className="ml-2 text-gray-400 hover:text-white"
                        >
                          <BsThreeDotsVertical size={18} />
                        </button>
                        {openModalMenuId === user.id && (
                          <div className="absolute right-0 top-full mt-1 w-36 bg-gray-800 border border-gray-700 rounded shadow-lg z-20">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                updateParticipant(user.id, "isCameraOff");
                                socket.emit("leader-toggle-camera", {
                                  groupId,
                                  targetUserId: user.id,
                                  isCameraOff: !user.isCameraOff,
                                });
                              }}
                              className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-700"
                            >
                              {user.isCameraOff ? "Bật camera" : "Tắt camera"}
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                updateParticipant(user.id, "isMicOff");
                                socket.emit("leader-toggle-mic", {
                                  groupId,
                                  targetUserId: user.id,
                                  isMicOff: !user.isMicOff,
                                });
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

export default VideoCallPage1;
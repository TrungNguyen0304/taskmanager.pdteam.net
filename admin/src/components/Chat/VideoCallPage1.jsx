import React, { useEffect, useRef, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SimplePeer from "simple-peer";
import { SocketContext } from "../../context/SocketContext";


const VideoCallPage1 = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const socket = useContext(SocketContext);
  const currentUser = JSON.parse(localStorage.getItem("user"));

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerRef = useRef(null);
  const streamRef = useRef(null);
  const hasHandledOfferRef = useRef(false);

  const [error, setError] = useState(null);
  const [callStatus, setCallStatus] = useState("⛔️ Chưa kết nối");
  const [isGroupInCall, setIsGroupInCall] = useState(false);
  const [remoteUserName, setRemoteUserName] = useState("Đối phương");
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [isSharingScreen, setIsSharingScreen] = useState(false);

  const iceServers = [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ];

  useEffect(() => {
    const startMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        streamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        console.log("✅ Đã truy cập camera/mic", stream);
        setCallStatus("🟡 Đã bật camera/mic, chờ kết nối...");
      } catch (err) {
        console.error("❌ Không thể truy cập camera/mic", err);
        setError("Không thể truy cập camera/mic");
        setCallStatus("❌ Lỗi truy cập camera/mic");
      }
    };

    startMedia();

    return () => {
      if (peerRef.current) peerRef.current.destroy();
      if (streamRef.current)
        streamRef.current.getTracks().forEach((track) => track.stop());
    };
  }, []);

  useEffect(() => {
    if (socket && currentUser?._id) {
      socket.emit("user-online", currentUser._id);
    }
  }, [socket]);

  useEffect(() => {
    const pending = localStorage.getItem("pendingOffer");
    if (pending && !hasHandledOfferRef.current) {
      const { groupId: pendingGroup, offer, userId, userName } = JSON.parse(pending);
      if (pendingGroup === groupId && userId !== currentUser._id) {
        const waitForStream = setInterval(() => {
          if (streamRef.current) {
            handleReceivedOffer({ offer, callerId: userId, userName });
            localStorage.removeItem("pendingOffer");
            clearInterval(waitForStream);
            hasHandledOfferRef.current = true;
          }
        }, 200);
      }
    }
  }, []);

  const handlePeerEvents = (peer, callerId, userName) => {
    peer.on("signal", (data) => {
      if (data.type === "answer") {
        socket.emit("call-answer", {
          groupId,
          userId: currentUser._id,
          answer: data,
          toUserId: callerId,
        });
        setCallStatus("🟢 Đã gửi answer");
      } else if (data.type === "offer") {
        socket.emit("start-call", {
          groupId,
          userId: currentUser._id,
          offer: data,
          userName: currentUser.name,
        });
        setCallStatus("📤 Đã gửi offer");
      } else if (data.candidate) {
        const candidate = {
          candidate: data.candidate.candidate,
          sdpMid: data.candidate.sdpMid,
          sdpMLineIndex: data.candidate.sdpMLineIndex,
        };

        console.log("📤 Gửi ICE candidate:", {
          fromUserId: currentUser._id,
          toUserId: callerId,
          groupId,
          candidate,
        });

        if (!callerId) {
          console.warn("❌ callerId null, không gửi ICE");
          return;
        }

        socket.emit("ice-candidate", {
          groupId,
          userId: currentUser._id,
          candidate,
          toUserId: callerId,
        });
      }
    });

    peer.on("stream", (remoteStream) => {
      console.log("📥 Nhận stream từ đối phương");
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream;
        remoteVideoRef.current
          .play()
          .then(() => {
            console.log("▶️ Video remote phát thành công");
          })
          .catch((err) => {
            console.warn("❌ Lỗi autoplay video remote:", err);
          });
      }
      setCallStatus("✅ Nhận video từ đối phương");
    });

    peer.on("error", (err) => {
      console.error("💥 Peer error:", err);
    });
  };

  const handleReceivedOffer = ({ offer, callerId, userName }) => {
    if (hasHandledOfferRef.current) return;

    const peer = new SimplePeer({
      initiator: false,
      trickle: true,
      stream: streamRef.current,
      config: { iceServers },
    });

    setCallStatus(`📥 Nhận offer từ ${userName}`);
    setRemoteUserName(userName || "Đối phương");
    peerRef.current = peer;
    handlePeerEvents(peer, callerId, userName);
    peer.signal(offer);
    hasHandledOfferRef.current = true;
  };

  const startCall = () => {
    const peer = new SimplePeer({
      initiator: true,
      trickle: true,
      stream: streamRef.current,
      config: { iceServers },
    });

    peerRef.current = peer;
    handlePeerEvents(peer, currentUser._id, currentUser.name);
    setCallStatus("📤 Đang gửi offer...");

    if (remoteVideoRef.current) {
      remoteVideoRef.current
        .play()
        .catch((err) => console.warn("❌ Lỗi play remote:", err));
    }
  };

  const endCall = () => {
    if (peerRef.current) {
      peerRef.current.destroy();
      peerRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (socket && currentUser?._id && groupId) {
      socket.emit("end-call", {
        groupId,
        userId: currentUser._id,
      });
    }

    setCallStatus("🔴 Cuộc gọi đã kết thúc");
  };

  const toggleMic = () => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setMicOn(audioTrack.enabled);
      }
    }
  };

  const toggleCamera = () => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setCameraOn(videoTrack.enabled);
      }
    }
  };

  const startScreenShare = async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });

      const screenTrack = screenStream.getVideoTracks()[0];

      screenTrack.onended = () => {
        stopScreenShare(); // Người dùng tắt chia sẻ từ trình duyệt
      };

      // Replace video track trong peer connection nếu đang gọi
      const sender = peerRef.current?.streams[0]
        ?.getVideoTracks()[0] && peerRef.current._pc
          ?.getSenders()
          ?.find((s) => s.track?.kind === "video");

      if (sender) {
        sender.replaceTrack(screenTrack);
      }

      streamRef.current = screenStream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = screenStream;
      }

      setIsSharingScreen(true);

      socket.emit("start-screen-share", {
        groupId,
        userId: currentUser._id,
        offer: null, // nếu cần thiết có thể gửi stream info
      });
    } catch (err) {
      console.error("❌ Lỗi chia sẻ màn hình:", err);
    }
  };

  const stopScreenShare = async () => {
    try {
      const camStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      const camTrack = camStream.getVideoTracks()[0];

      const sender = peerRef.current?._pc
        ?.getSenders()
        ?.find((s) => s.track?.kind === "video");

      if (sender) {
        sender.replaceTrack(camTrack);
      }

      streamRef.current = camStream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = camStream;
      }

      setIsSharingScreen(false);

      socket.emit("stop-screen-share", {
        groupId,
        userId: currentUser._id,
      });
    } catch (err) {
      console.error("❌ Lỗi khi dừng chia sẻ màn hình:", err);
    }
  };


  useEffect(() => {
    if (!socket) return;

    socket.on("call-started", ({ groupId: callGroupId, userId, offer, userName }) => {
      if (callGroupId !== groupId || userId === currentUser._id || hasHandledOfferRef.current) return;
      handleReceivedOffer({ offer, callerId: userId, userName });
    });

    socket.on("call-answer", ({ userId, answer }) => {
      if (peerRef.current && answer?.type === "answer") {
        peerRef.current.signal(answer);
        setCallStatus("🟢 Đã kết nối với đối phương");
      }
    });

    socket.on("ice-candidate", ({ candidate }) => {
      if (peerRef.current && candidate) {
        const isValid =
          typeof candidate.candidate === "string" &&
          typeof candidate.sdpMid === "string" &&
          typeof candidate.sdpMLineIndex === "number";

        if (isValid) {
          peerRef.current.signal({ type: "candidate", candidate });
        } else {
          console.warn("❌ ICE candidate không hợp lệ:", candidate);
        }
      }
    });

    socket.on("call-notification", ({ groupId: notifyGroupId }) => {
      if (notifyGroupId === groupId) {
        setIsGroupInCall(true);
      }
    });

    return () => {
      socket.off("call-started");

      socket.off("call-answer");
      socket.off("ice-candidate");
      socket.off("call-notification");
    };
  }, [socket]);

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-2">📹 Cuộc gọi nhóm</h2>
      {error && <p className="text-red-500">{error}</p>}
      <p className="text-sm mb-2">Trạng thái: {callStatus}</p>

      <div className="flex gap-4 mb-4">
        <div>
          <p className="text-xs text-gray-600">{currentUser?.name || "Bạn"}</p>
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            style={{ width: 320, height: 240, background: "black" }}
          />
        </div>
        <div>
          <p className="text-xs text-gray-600">{remoteUserName}</p>
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            controls
            style={{ width: 320, height: 240, background: "black" }}
          />
        </div>
      </div>
      <div className="flex gap-2 mt-2">
        <button
          onClick={toggleMic}
          className={`px-4 py-2 rounded text-white ${micOn ? "bg-green-600" : "bg-gray-500"}`}
        >
          {micOn ? "🎤 Tắt mic" : "🔇 Bật mic"}
        </button>

        <button
          onClick={toggleCamera}
          className={`px-4 py-2 rounded text-white ${cameraOn ? "bg-green-600" : "bg-gray-500"}`}
        >
          {cameraOn ? "🎥 Tắt cam" : "📷 Bật cam"}
        </button>
      </div>
      <button
        onClick={isSharingScreen ? stopScreenShare : startScreenShare}
        className={`px-4 py-2 rounded text-white ${isSharingScreen ? "bg-red-600" : "bg-purple-600"}`}
      >
        {isSharingScreen ? "🛑 Dừng chia sẻ" : "🖥️ Chia sẻ màn hình"}
      </button>

      <button
        onClick={startCall}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
      >
        📞 Bắt đầu gọi
      </button>

      <button
        onClick={endCall}
        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition ml-2"
      >
        ❌ Kết thúc gọi
      </button>


      {isGroupInCall && (
        <div className="fixed bottom-4 left-4 bg-blue-100 p-3 rounded shadow text-sm">
          Có cuộc gọi đang diễn ra. {" "}
          <button
            onClick={() => navigate(`/chat/video-call/${groupId}`)}
            className="underline text-blue-600"
          >
            Tham gia
          </button>
        </div>
      )}
    </div>
  );
};

export default VideoCallPage1;
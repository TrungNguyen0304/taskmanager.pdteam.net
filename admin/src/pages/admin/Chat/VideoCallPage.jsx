import React, { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  FaPhoneSlash,
  FaMicrophoneSlash,
  FaMicrophone,
  FaVideoSlash,
} from "react-icons/fa6";
import { BsThreeDotsVertical } from "react-icons/bs";
import { HiMiniVideoCamera } from "react-icons/hi2";

const initialParticipants = [
  { id: 1, name: "Bạn", isSelf: true, isCameraOff: false, isMicOff: false },
  { id: 2, name: "Nguyễn Văn A", isCameraOff: false, isMicOff: false },
  { id: 3, name: "Trần Thị B", isCameraOff: false, isMicOff: false },
  { id: 4, name: "Lê Quang C", isCameraOff: false, isMicOff: false },
  { id: 5, name: "Phạm D", isCameraOff: false, isMicOff: false },
  { id: 6, name: "Vũ E", isCameraOff: false, isMicOff: false },
  { id: 7, name: "Người F", isCameraOff: false, isMicOff: false },
  { id: 8, name: "Người G", isCameraOff: false, isMicOff: false },
];

const MAX_VISIBLE = 5; // Hiển thị 5 người + 1 ô xem thêm

const VideoCallPage = () => {
  const navigate = useNavigate();
  const [participants, setParticipants] = useState(initialParticipants);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [showMoreModal, setShowMoreModal] = useState(false);
  const [openModalMenuId, setOpenModalMenuId] = useState(null); // menu 3 chấm trong modal

  const selfVideoRef = useRef(null);
  const [selfStream, setSelfStream] = useState(null);

  // Mảng ID của những người đang được ghim hiển thị chính (tối đa 5), luôn có self ở đầu
  const [visibleParticipantIds, setVisibleParticipantIds] = useState(() => {
    const selfId = initialParticipants.find((p) => p.isSelf).id;
    // Sắp xếp theo độ ưu tiên: cả camera và mic > mic không camera > camera không mic > không gì cả
    const sortedParticipants = initialParticipants
      .filter((p) => !p.isSelf)
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
    const initialIds = [
      selfId,
      ...sortedParticipants.slice(0, MAX_VISIBLE - 1).map((p) => p.id),
    ];
    return initialIds;
  });

  const self = participants.find((p) => p.isSelf);

  // Quản lý stream camera cho người dùng self
  useEffect(() => {
    if (self.isCameraOff) {
      if (selfStream) {
        selfStream.getTracks().forEach((track) => track.stop());
        setSelfStream(null);
      }
      if (selfVideoRef.current) {
        selfVideoRef.current.srcObject = null;
      }
    } else {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then((stream) => {
          setSelfStream(stream);
          if (selfVideoRef.current) {
            selfVideoRef.current.srcObject = stream;
          }
        })
        .catch((error) => {
          console.error("Lỗi khi lấy camera/micro:", error);
        });
    }

    return () => {
      if (selfStream) {
        selfStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [self.isCameraOff]);

  // Cập nhật visibleParticipantIds khi trạng thái mic hoặc camera thay đổi
  useEffect(() => {
    const selfId = participants.find((p) => p.isSelf).id;
    const currentVisible = visibleParticipantIds.filter((id) => id !== selfId);
    // Sắp xếp theo độ ưu tiên: cả camera và mic > mic không camera > camera không mic > không gì cả
    const sortedParticipants = participants
      .filter((p) => !p.isSelf && !currentVisible.includes(p.id))
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

    let newVisibleIds = [selfId, ...currentVisible];
    const needed = MAX_VISIBLE - newVisibleIds.length;
    if (needed > 0) {
      const additionalIds = sortedParticipants
        .slice(0, needed)
        .map((p) => p.id);
      newVisibleIds = [...newVisibleIds, ...additionalIds];
    }
    setVisibleParticipantIds(newVisibleIds);
  }, [participants]);

  const handleEndCall = () => {
    if (selfStream) {
      selfStream.getTracks().forEach((track) => track.stop());
    }
    navigate("/chat");
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

  // Bấm vào người trong modal để ghim/bỏ ghim
  const togglePinParticipant = (userId) => {
    const selfId = participants.find((p) => p.isSelf).id;
    if (userId === selfId) return; // Không cho phép bỏ ghim self

    setVisibleParticipantIds((prev) => {
      let newIds;
      if (prev.includes(userId)) {
        // Bỏ ghim
        newIds = prev.filter((id) => id !== userId);
        // Nếu số lượng dưới MAX_VISIBLE và còn người để ghim, thêm người mới theo độ ưu tiên
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
        // Ghìm thêm
        if (prev.length < MAX_VISIBLE) {
          newIds = [...prev, userId];
        } else {
          // Thay người cuối cùng bằng người mới (giữ self ở đầu)
          newIds = prev.slice(0, MAX_VISIBLE - 1);
          newIds.push(userId);
        }
      }
      return newIds;
    });
  };

  // Lấy danh sách người hiển thị chính theo visibleParticipantIds
  const visibleParticipants = visibleParticipantIds
    .map((id) => participants.find((p) => p.id === id))
    .filter(Boolean);

  // Những người không được ghim (không nằm trong visibleParticipantIds)
  const otherParticipants = participants.filter(
    (p) => !visibleParticipantIds.includes(p.id)
  );

  return (
    <div className="h-screen bg-gray-900 text-white flex flex-col p-4 relative rounded-2xl shadow-lg">
      {/* Header */}
      <div className="absolute top-4 left-4 text-lg font-semibold">
        Đang gọi nhóm video...
      </div>

      {/* Close Button */}
      <button
        onClick={handleEndCall}
        className="absolute top-4 right-4 p-2 rounded-full bg-gray-800 hover:bg-gray-700"
      >
        <X size={20} />
      </button>

      {/* Video Grid */}
      <div className="flex-1 mt-16 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 place-items-center overflow-y-auto px-2">
        {visibleParticipants.map((user) => (
          <div
            key={user.id}
            className={`w-full h-52 rounded-xl flex items-center justify-center relative ${
              user.isSelf ? "bg-blue-700" : "bg-gray-700"
            }`}
          >
            {/* Hiển thị video nếu là self và camera bật */}
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
              <span className="text-sm text-gray-300">Video {user.name}</span>
            )}

            {/* Menu chỉ cho user khác */}
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

            {/* Tên và trạng thái micro */}
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

        {/* Nếu có nhiều hơn MAX_VISIBLE người thì hiển thị ô "Xem thêm" */}
        {participants.length > MAX_VISIBLE && (
          <div
            className="w-full h-52 rounded-xl flex items-center justify-center cursor-pointer bg-gray-700 hover:bg-gray-600 text-xl font-semibold select-none"
            onClick={() => setShowMoreModal(true)}
          >
            +{participants.length - MAX_VISIBLE} thêm
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex justify-center items-center gap-6 mt-6">
        <button
          onClick={() =>
            setParticipants((prev) =>
              prev.map((p) => (p.isSelf ? { ...p, isMicOff: !p.isMicOff } : p))
            )
          }
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
          onClick={() =>
            setParticipants((prev) =>
              prev.map((p) =>
                p.isSelf ? { ...p, isCameraOff: !p.isCameraOff } : p
              )
            )
          }
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

      {/* Modal xem thêm người tham gia */}
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
                    {/* Microphone icon */}
                    {user.isMicOff ? (
                      <FaMicrophoneSlash className="text-red-500" />
                    ) : (
                      <FaMicrophone className="text-green-400" />
                    )}

                    {/* Menu 3 chấm */}
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

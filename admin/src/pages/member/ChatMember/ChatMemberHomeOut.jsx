// ChatMemberHomeOut.jsx
import React, { useState } from "react";
import { Users, ArrowLeft, MailPlus, Send } from "lucide-react";

const ChatMemberHomeOut = ({ onBackToChat, onJoinApproved }) => {
  const [requestStatus, setRequestStatus] = useState(null); // 'pending', 'approved', 'rejected'
  const [joiningNew, setJoiningNew] = useState(false);
  const [groupInput, setGroupInput] = useState("");

  const handleRequestRejoin = () => {
    // Giả lập gửi yêu cầu phê duyệt
    setRequestStatus("pending");
    // Sau này bạn có thể gọi API gửi yêu cầu duyệt ở đây
  };

  const handleRequestJoinNew = () => {
    if (!groupInput.trim()) return;
    setRequestStatus("pending");
    // Gửi yêu cầu tham gia nhóm mới (gửi tên hoặc ID nhóm)
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white shadow-lg rounded-xl p-6 text-center space-y-4">
        <div className="flex flex-col items-center space-y-4">
          <Users size={48} className="text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-800">
            Bạn đã rời khỏi nhóm
          </h2>
          <p className="text-gray-600">
            Nếu muốn quay lại nhóm cũ hoặc tham gia nhóm khác, vui lòng gửi yêu
            cầu để được chủ nhóm phê duyệt.
          </p>

          {/* Trạng thái đang chờ duyệt */}
          {requestStatus === "pending" ? (
            <div className="text-yellow-600 font-medium">
              Yêu cầu của bạn đang chờ phê duyệt...
            </div>
          ) : (
            <>
              {/* Nút yêu cầu vào lại nhóm */}
              <button
                onClick={handleRequestRejoin}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
              >
                <MailPlus size={18} />
                Gửi yêu cầu vào lại nhóm cũ
              </button>

              {/* Hoặc vào nhóm mới */}
              <div className="w-full">
                {!joiningNew ? (
                  <button
                    onClick={() => setJoiningNew(true)}
                    className="mt-2 text-sm text-blue-600 hover:underline"
                  >
                    Hoặc tham gia nhóm mới?
                  </button>
                ) : (
                  <div className="mt-4 space-y-3 text-left">
                    <label className="block text-sm font-medium text-gray-700">
                      Nhập tên nhóm hoặc ID nhóm:
                    </label>
                    <input
                      type="text"
                      value={groupInput}
                      onChange={(e) => setGroupInput(e.target.value)}
                      placeholder="vd: vanphong-test"
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={handleRequestJoinNew}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
                    >
                      <Send size={16} />
                      Gửi yêu cầu tham gia nhóm mới
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Quay lại chat (nếu được duyệt) */}
          {requestStatus === "approved" && (
            <button
              onClick={onJoinApproved}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700"
            >
              <ArrowLeft size={16} />
              Vào lại nhóm
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMemberHomeOut;

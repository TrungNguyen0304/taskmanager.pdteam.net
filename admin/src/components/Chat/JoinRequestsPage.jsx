import React, { useState } from "react";
import { Check, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

const JoinRequestsPage = () => {
  const navigate = useNavigate();

  const [requests, setRequests] = useState([
    { name: "Nguyễn Văn M", approved: false },
    { name: "Trần Thị N", approved: false },
  ]);

  const handleApprove = (index) => {
    const member = requests[index].name;
    setRequests((prev) => prev.filter((_, i) => i !== index));
    alert(`Đã phê duyệt ${member} vào nhóm.`);
    // Sau này có thể gọi API thêm vào room.members
  };

  const handleReject = (index) => {
    const member = requests[index].name;
    setRequests((prev) => prev.filter((_, i) => i !== index));
    alert(`Đã từ chối ${member}.`);
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold text-blue-700">
          Yêu cầu tham gia nhóm
        </h1>
        <button
          onClick={() => navigate(-1)}
          className="text-sm px-3 py-2 rounded bg-gray-200 hover:bg-gray-300"
        >
          Quay lại
        </button>
      </div>

      {requests.length === 0 ? (
        <p className="text-gray-500">Không có yêu cầu nào.</p>
      ) : (
        <ul className="space-y-4">
          {requests.map((req, index) => (
            <li
              key={index}
              className="flex justify-between items-center bg-white p-4 border rounded shadow"
            >
              <span className="text-base font-medium text-gray-800">
                {req.name}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleApprove(index)}
                  className="text-green-600 hover:text-green-800"
                >
                  <Check size={20} />
                </button>
                <button
                  onClick={() => handleReject(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <X size={20} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default JoinRequestsPage;

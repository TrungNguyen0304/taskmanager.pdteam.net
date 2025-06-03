import React, { useState, useEffect } from "react";
import { MdKeyboardArrowUp } from "react-icons/md";
import { RiArrowDropDownLine } from "react-icons/ri";
import { Users } from "lucide-react";

const ChatMemberSidebar = ({
  groups,
  setSelectedGroup,
  selectedGroup,
  teamMembers,
  creatingGroup,
  setCreatingGroup,
  newGroupName,
  setNewGroupName,
  newGroupMembers,
  setNewGroupMembers,
  handleCreateGroup,
  createGroupRef,
  error,
  setError,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const visibleGroupCount = isExpanded ? groups.length : isMobile ? 2 : 10;
  const visibleGroups = groups.slice(0, visibleGroupCount);

  return (
    <div className="w-full sm:w-80 bg-white sm:border-r sm:rounded-l-xl sm:shadow-md flex flex-col p-4 sm:p-6 gap-4 sm:gap-6 h-auto sm:h-full">
      <div className="flex justify-between items-center">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
          Nhóm của tôi
        </h2>
      </div>

      {creatingGroup && (
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
            className="w-full border border-gray-300 px-3 py-2 text-xs sm:text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="max-h-40 overflow-y-auto custom-scrollbar border border-gray-300 rounded-lg p-3 bg-white">
            {teamMembers.map((member) => (
              <label
                key={member._id}
                className="flex items-center justify-between gap-2 py-1 text-xs sm:text-sm text-gray-800 hover:bg-gray-100 rounded px-2"
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
              className="flex-1 bg-gray-300 text-gray-800 py-2 rounded-lg hover:bg-gray-400 transition-colors text-xs sm:text-sm"
            >
              Hủy
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCreateGroup();
              }}
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors text-xs sm:text-sm"
            >
              Tạo nhóm
            </button>
          </div>
          {error && (
            <p className="text-red-500 text-xs sm:text-sm mt-2">{error}</p>
          )}
        </div>
      )}

      {groups.length === 0 && !creatingGroup ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
          <Users className="w-12 h-12 text-gray-600 mb-4 animate-pulse" />
          <p className="text-gray-600 text-sm sm:text-base mb-2 animate-fade-in-up">
            Bạn chưa có nhóm trò chuyện nào.
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-3">
          {visibleGroups.map((group) => (
            <button
              key={group._id}
              onClick={() => setSelectedGroup(group)}
              className={`w-full text-left px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors text-sm sm:text-base ${
                selectedGroup?._id === group._id
                  ? "bg-blue-100 font-semibold"
                  : "bg-white"
              } `}
            >
              {group.name}
            </button>
          ))}

          {groups.length > (isMobile ? 2 : 10) && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1 sm:gap-2 text-blue-600 hover:text-blue-800 px-3 py-1 text-sm sm:text-base rounded-md transition-colors duration-200"
            >
              <span>{isExpanded ? "Ẩn bớt" : "Xem thêm"}</span>
              {isExpanded ? (
                <MdKeyboardArrowUp size={20} />
              ) : (
                <RiArrowDropDownLine size={22} />
              )}
            </button>
          )}
        </div>
      )}
      <hr />
    </div>
  );
};

export default ChatMemberSidebar;

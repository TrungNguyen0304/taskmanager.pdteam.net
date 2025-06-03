import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  FaThLarge,
  FaUser,
  FaBuilding,
  FaProjectDiagram,
  FaBars,
  FaTimes,
  FaAngleDown,
  FaAngleUp,
} from "react-icons/fa";
import { GiProgression } from "react-icons/gi";
import { TbSubtask } from "react-icons/tb";
import { IoChatbubbleEllipsesOutline } from "react-icons/io5";
import { RiTeamLine } from "react-icons/ri";
import { VscFeedback } from "react-icons/vsc";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isEmployeeDropdownOpen, setIsEmployeeDropdownOpen] = useState(false);
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const [isTaskDropdownOpen, setIsTaskDropdownOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
    setIsEmployeeDropdownOpen(false);
    setIsProjectDropdownOpen(false);
    setIsTaskDropdownOpen(false);
  };

  const user = JSON.parse(localStorage.getItem("user")) || {};
  const role = user.role;

  const menuItems = {
    admin: {
      title: "QUẢN LÝ NHÂN SỰ",
      main: [
        {
          label: "Trang Chủ",
          to: "/",
          icon: <FaThLarge />,
        },
      ],
      menu: [
        {
          label: "Quản Lý",
          icon: <FaUser />,
          dropdown: true,
          items: [
            { label: "Nhân Viên", to: "/member" },
            { label: "Leader", to: "/leader" },
          ],
        },
        {
          label: "Phòng Ban",
          to: "/departments",
          icon: <FaBuilding />,
        },
        {
          label: "Dự Án",
          icon: <FaProjectDiagram />,
          dropdown: true,
          items: [
            { label: "Dự Án Đã Gán", to: "/project-assigned" },
            { label: "Dự Án Chưa Gán", to: "/project-unassigned" },
          ],
        },
        {
          label: "Tiến độ dự án",
          to: "/projectprogress",
          icon: <GiProgression />,
        },
        {
          label: "Đánh Giá",
          icon: <VscFeedback />,
          to: "/feedback-admin",
        },
        {
          label: "Trò chuyện",
          to: "/chat",
          icon: <IoChatbubbleEllipsesOutline />,
        },
      ],
    },
    leader: {
      title: "QUẢN LÝ NHÂN VIÊN",
      main: [
        {
          label: "Trang Chủ Leader",
          to: "/",
          icon: <FaThLarge />,
        },
      ],
      menu: [
        {
          label: "Quản Lý Nhân Viên",
          icon: <FaUser />,
          to: "/teams-table",
        },
        {
          label: "Nhiệm Vụ",
          icon: <TbSubtask />,
          dropdown: true,
          items: [
            { label: "Nhiệm Vụ Đã Giao", to: "/assigned-tasks" },
            { label: "Nhiệm Vụ Chưa Giao", to: "/unassigned-tasks" },
          ],
        },
        {
          label: "Projects",
          to: "/projects",
          icon: <FaProjectDiagram />,
        },
        {
          label: "Trò chuyện",
          to: "/chat",
          icon: <IoChatbubbleEllipsesOutline />,
        },
      ],
    },
    member: {
      title: "NHÂN VIÊN",
      main: [
        {
          label: "Trang Chủ Member",
          to: "/",
          icon: <FaThLarge />,
        },
      ],
      menu: [
        {
          label: "Nhiệm Vụ",
          icon: <TbSubtask />,
          to: "/task-member",
        },
        {
          label: "Đội Nhóm",
          icon: <RiTeamLine />,
          to: "/team-member",
        },
        {
          label: "Đánh Giá",
          icon: <VscFeedback />,
          to: "/feedback-member",
        },
        {
          label: "Trò chuyện",
          to: "/chat",
          icon: <IoChatbubbleEllipsesOutline />,
        },
      ],
    },
  };

  const currentMenu = menuItems[role] || menuItems.admin;

  return (
    <>
      <div
        className={`lg:hidden fixed top-5 z-50 transition-all duration-300 ${
          isOpen ? "right-4" : "left-4"
        }`}
      >
        <button
          className="text-white bg-[#183d5d] p-2 rounded-md shadow-md transition-transform duration-300 transform active:scale-90"
          onClick={toggleSidebar}
        >
          {isOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
        </button>
      </div>

      <aside
        className={`fixed right-0 lg:static flex-shrink-0 top-0 left-0 w-64 min-h-screen bg-gradient-to-b from-[#183d5d] to-[#1d557a] text-white p-4 lg:p-5 flex flex-col shadow-lg transition-transform duration-300 z-40 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen`}
      >
        <h1 className="text-lg lg:text-xl font-bold text-center mb-3">
          {currentMenu.title}
        </h1>
        <hr className="border-gray-400 mb-4 lg:mb-6" />

        <div className="mb-4">
          <p className="text-xs lg:text-sm text-gray-300 font-semibold mb-2">
            MAIN
          </p>
          {currentMenu.main.map((item, index) => (
            <SidebarItem
              key={index}
              icon={item.icon}
              label={item.label}
              to={item.to}
              onClick={() => setIsOpen(false)}
            />
          ))}
        </div>

        <div className="flex-1">
          <p className="text-xs lg:text-sm text-gray-300 font-semibold mb-2">
            MENU
          </p>
          <div className="flex flex-col gap-1">
            {currentMenu.menu.map((item, index) =>
              item.dropdown ? (
                <div key={index}>
                  <div
                    className="flex items-center justify-between gap-3 py-2 px-3 rounded cursor-pointer hover:bg-white/10"
                    onClick={() => {
                      if (item.label === "Quản Lý") {
                        setIsEmployeeDropdownOpen(!isEmployeeDropdownOpen);
                      } else if (item.label === "Dự Án") {
                        setIsProjectDropdownOpen(!isProjectDropdownOpen);
                      } else if (item.label === "Nhiệm Vụ") {
                        setIsTaskDropdownOpen(!isTaskDropdownOpen);
                      }
                    }}
                  >
                    <div className="flex items-center gap-3">
                      {item.icon}
                      <span>{item.label}</span>
                    </div>
                    {(item.label === "Quản Lý" && isEmployeeDropdownOpen) ||
                    (item.label === "Dự Án" && isProjectDropdownOpen) ||
                    (item.label === "Nhiệm Vụ" && isTaskDropdownOpen) ? (
                      <FaAngleUp />
                    ) : (
                      <FaAngleDown />
                    )}
                  </div>
                  {(item.label === "Quản Lý" && isEmployeeDropdownOpen) ||
                  (item.label === "Dự Án" && isProjectDropdownOpen) ||
                  (item.label === "Nhiệm Vụ" && isTaskDropdownOpen) ? (
                    <div className="ml-6 mt-1 flex flex-col gap-1">
                      {item.items.map((subItem, subIndex) => (
                        <SidebarItem
                          key={subIndex}
                          label={subItem.label}
                          to={subItem.to}
                          onClick={() => setIsOpen(false)}
                        />
                      ))}
                    </div>
                  ) : null}
                </div>
              ) : (
                <SidebarItem
                  key={index}
                  icon={item.icon}
                  label={item.label}
                  to={item.to}
                  onClick={() => setIsOpen(false)}
                />
              )
            )}
          </div>
        </div>

        <hr className="mt-4 lg:mt-6 border-gray-400" />
      </aside>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 lg:hidden z-30"
          onClick={toggleSidebar}
        ></div>
      )}
    </>
  );
};

const SidebarItem = ({ icon, label, to, onClick }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center gap-3 py-2 px-3 rounded cursor-pointer hover:bg-white/10 ${
        isActive ? "bg-white/20" : ""
      }`
    }
    onClick={onClick}
  >
    {icon && <div className="text-base lg:text-lg">{icon}</div>}
    <span>{label}</span>
  </NavLink>
);

export default Sidebar;

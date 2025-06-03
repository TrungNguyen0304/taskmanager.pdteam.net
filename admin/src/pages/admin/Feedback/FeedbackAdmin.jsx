import React, { useState } from "react";
import { MdDashboard, MdPerson, MdGroup, MdArticle } from "react-icons/md";

// data mẫu cho feedbacks, reports
const feedbackData = {
  leaders: [
    {
      id: 1,
      name: "Leader A",
      feedbacks: [
        {
          id: 101,
          content: "Great teamwork on the recent project.",
          date: "2025-05-10",
        },
        {
          id: 102,
          content: "Need to improve meeting punctuality.",
          date: "2025-05-12",
        },
        {
          id: 103,
          content: "Excellent presentation skills.",
          date: "2025-05-15",
        },
        {
          id: 104,
          content: "More focus on documentation needed.",
          date: "2025-05-17",
        },
        {
          id: 105,
          content: "Good initiative in problem-solving.",
          date: "2025-05-20",
        },
        {
          id: 106,
          content: "Positive attitude in team discussions.",
          date: "2025-05-22",
        },
      ],
      reports: [
        {
          id: 201,
          title: "Q1 Project Overview",
          description: "Summary of Q1 deliverables.",
          date: "2025-05-05",
        },
        {
          id: 202,
          title: "Team Performance Report",
          description: "Analysis of team KPIs.",
          date: "2025-05-07",
        },
        {
          id: 203,
          title: "Budget Review",
          description: "Financial overview for Q2.",
          date: "2025-05-10",
        },
        {
          id: 204,
          title: "Client Feedback Summary",
          description: "Client satisfaction survey results.",
          date: "2025-05-12",
        },
        {
          id: 205,
          title: "Risk Assessment",
          description: "Potential project risks.",
          date: "2025-05-15",
        },
      ],
    },
    {
      id: 2,
      name: "Leader B",
      feedbacks: [
        {
          id: 107,
          content: "Strong leadership in crisis.",
          date: "2025-05-11",
        },
        {
          id: 108,
          content: "Could improve task delegation.",
          date: "2025-05-13",
        },
        {
          id: 109,
          content: "Excellent client communication.",
          date: "2025-05-16",
        },
        {
          id: 110,
          content: "More detailed reports needed.",
          date: "2025-05-18",
        },
      ],
      reports: [
        {
          id: 206,
          title: "Project Milestone Update",
          description: "Progress on key milestones.",
          date: "2025-05-08",
        },
        {
          id: 207,
          title: "Team Training Plan",
          description: "Upskilling initiatives.",
          date: "2025-05-10",
        },
        {
          id: 208,
          title: "Resource Allocation",
          description: "Current resource distribution.",
          date: "2025-05-14",
        },
        {
          id: 209,
          title: "Q2 Forecast",
          description: "Projected outcomes for Q2.",
          date: "2025-05-16",
        },
      ],
    },
    {
      id: 3,
      name: "Leader C",
      feedbacks: [
        {
          id: 111,
          content: "Innovative approach to challenges.",
          date: "2025-05-09",
        },
        {
          id: 112,
          content: "Needs better time management.",
          date: "2025-05-14",
        },
        {
          id: 113,
          content: "Great at motivating the team.",
          date: "2025-05-17",
        },
        { id: 114, content: "Improve follow-up on tasks.", date: "2025-05-20" },
        {
          id: 115,
          content: "Excellent strategic planning.",
          date: "2025-05-23",
        },
      ],
      reports: [
        {
          id: 210,
          title: "Technology Adoption Report",
          description: "New tools implementation.",
          date: "2025-05-06",
        },
        {
          id: 211,
          title: "Team Efficiency Metrics",
          description: "Performance analysis.",
          date: "2025-05-09",
        },
        {
          id: 212,
          title: "Client Meeting Notes",
          description: "Key takeaways from client calls.",
          date: "2025-05-12",
        },
        {
          id: 213,
          title: "Risk Mitigation Plan",
          description: "Strategies for risk reduction.",
          date: "2025-05-15",
        },
      ],
    },
    {
      id: 4,
      name: "Leader D",
      feedbacks: [
        {
          id: 116,
          content: "Proactive in addressing issues.",
          date: "2025-05-08",
        },
        {
          id: 117,
          content: "Needs clearer communication.",
          date: "2025-05-11",
        },
        { id: 118, content: "Strong analytical skills.", date: "2025-05-14" },
        {
          id: 119,
          content: "Improve meeting facilitation.",
          date: "2025-05-18",
        },
      ],
      reports: [
        {
          id: 214,
          title: "Market Analysis",
          description: "Competitor and market trends.",
          date: "2025-05-07",
        },
        {
          id: 215,
          title: "Team Productivity Report",
          description: "Output metrics for Q1.",
          date: "2025-05-10",
        },
        {
          id: 216,
          title: "Stakeholder Feedback",
          description: "Stakeholder survey results.",
          date: "2025-05-13",
        },
        {
          id: 217,
          title: "Project Timeline Update",
          description: "Revised project schedule.",
          date: "2025-05-16",
        },
      ],
    },
  ],
  members: [
    {
      id: 101,
      name: "Member X",
      reports: [
        {
          id: 301,
          title: "Task Completion Report",
          description: "Completed tasks for May.",
          date: "2025-05-10",
        },
        {
          id: 302,
          title: "Bug Fixing Log",
          description: "Resolved issues in codebase.",
          date: "2025-05-12",
        },
        {
          id: 303,
          title: "Feature Development",
          description: "New feature implementation.",
          date: "2025-05-15",
        },
        {
          id: 304,
          title: "Testing Summary",
          description: "Unit test results.",
          date: "2025-05-18",
        },
      ],
    },
    {
      id: 102,
      name: "Member Y",
      reports: [
        {
          id: 305,
          title: "UI Design Update",
          description: "New UI mockups.",
          date: "2025-05-11",
        },
        {
          id: 306,
          title: "User Testing Feedback",
          description: "User testing results.",
          date: "2025-05-13",
        },
        {
          id: 307,
          title: "Performance Optimization",
          description: "Frontend performance improvements.",
          date: "2025-05-16",
        },
        {
          id: 308,
          title: "Accessibility Report",
          description: "Accessibility compliance check.",
          date: "2025-05-19",
        },
      ],
    },
    {
      id: 103,
      name: "Member Z",
      reports: [
        {
          id: 309,
          title: "API Integration Report",
          description: "API endpoint updates.",
          date: "2025-05-09",
        },
        {
          id: 310,
          title: "Database Optimization",
          description: "Query performance improvements.",
          date: "2025-05-12",
        },
        {
          id: 311,
          title: "Security Audit",
          description: "Security check results.",
          date: "2025-05-15",
        },
        {
          id: 312,
          title: "Deployment Log",
          description: "Recent deployment details.",
          date: "2025-05-18",
        },
      ],
    },
    {
      id: 104,
      name: "Member W",
      reports: [
        {
          id: 313,
          title: "Content Creation Report",
          description: "New blog posts drafted.",
          date: "2025-05-10",
        },
        {
          id: 314,
          title: "Social Media Metrics",
          description: "Engagement analytics.",
          date: "2025-05-13",
        },
        {
          id: 315,
          title: "Marketing Campaign",
          description: "Campaign performance summary.",
          date: "2025-05-16",
        },
        {
          id: 316,
          title: "SEO Analysis",
          description: "Search engine ranking updates.",
          date: "2025-05-19",
        },
      ],
    },
  ],
  groups: [
    {
      id: "team-x",
      name: "Team X",
      feedbacks: [
        {
          id: 301,
          content: "Team X exceeded sprint goals.",
          date: "2025-05-10",
        },
        {
          id: 302,
          content: "Need better collaboration tools.",
          date: "2025-05-12",
        },
        {
          id: 303,
          content: "Great cross-team communication.",
          date: "2025-05-15",
        },
        {
          id: 304,
          content: "Improve sprint planning accuracy.",
          date: "2025-05-18",
        },
      ],
      reports: [
        {
          id: 401,
          title: "Sprint 1 Report",
          description: "Sprint deliverables summary.",
          date: "2025-05-08",
        },
        {
          id: 402,
          title: "Team X Performance",
          description: "Team KPIs for Q1.",
          date: "2025-05-11",
        },
        {
          id: 403,
          title: "Resource Usage",
          description: "Team resource allocation.",
          date: "2025-05-14",
        },
        {
          id: 404,
          title: "Client Deliverables",
          description: "Client project updates.",
          date: "2025-05-17",
        },
      ],
    },
    {
      id: "team-y",
      name: "Team Y",
      feedbacks: [
        {
          id: 305,
          content: "Team Y delivered high-quality code.",
          date: "2025-05-09",
        },
        {
          id: 306,
          content: "More focus on testing needed.",
          date: "2025-05-12",
        },
        { id: 307, content: "Excellent team morale.", date: "2025-05-15" },
        {
          id: 308,
          content: "Improve documentation process.",
          date: "2025-05-18",
        },
      ],
      reports: [
        {
          id: 405,
          title: "Sprint 2 Report",
          description: "Sprint outcomes for Q2.",
          date: "2025-05-10",
        },
        {
          id: 406,
          title: "Team Y Metrics",
          description: "Team performance metrics.",
          date: "2025-05-13",
        },
        {
          id: 407,
          title: "Bug Tracking",
          description: "Resolved and pending bugs.",
          date: "2025-05-16",
        },
        {
          id: 408,
          title: "Feature Rollout",
          description: "New feature deployment.",
          date: "2025-05-19",
        },
      ],
    },
    {
      id: "team-z",
      name: "Team Z",
      feedbacks: [
        { id: 309, content: "Team Z improved efficiency.", date: "2025-05-08" },
        {
          id: 310,
          content: "Need better resource planning.",
          date: "2025-05-11",
        },
        { id: 311, content: "Great client feedback.", date: "2025-05-14" },
        {
          id: 312,
          content: "Focus on deadline adherence.",
          date: "2025-05-17",
        },
      ],
      reports: [
        {
          id: 409,
          title: "Sprint 3 Report",
          description: "Sprint progress for Q2.",
          date: "2025-05-09",
        },
        {
          id: 410,
          title: "Team Z KPIs",
          description: "Key performance indicators.",
          date: "2025-05-12",
        },
        {
          id: 411,
          title: "Risk Report",
          description: "Identified project risks.",
          date: "2025-05-15",
        },
        {
          id: 412,
          title: "Client Sync",
          description: "Client meeting outcomes.",
          date: "2025-05-18",
        },
      ],
    },
    {
      id: "team-w",
      name: "Team W",
      feedbacks: [
        {
          id: 313,
          content: "Team W showed great creativity.",
          date: "2025-05-07",
        },
        {
          id: 314,
          content: "Improve internal communication.",
          date: "2025-05-10",
        },
        { id: 315, content: "Strong project ownership.", date: "2025-05-13" },
        {
          id: 316,
          content: "Need faster issue resolution.",
          date: "2025-05-16",
        },
      ],
      reports: [
        {
          id: 413,
          title: "Sprint 4 Report",
          description: "Sprint deliverables for Q2.",
          date: "2025-05-08",
        },
        {
          id: 414,
          title: "Team W Performance",
          description: "Team output analysis.",
          date: "2025-05-11",
        },
        {
          id: 415,
          title: "Budget Report",
          description: "Team budget usage.",
          date: "2025-05-14",
        },
        {
          id: 416,
          title: "Stakeholder Update",
          description: "Stakeholder feedback summary.",
          date: "2025-05-17",
        },
      ],
    },
  ],
};

const TabButton = ({ label, active, onClick, icon: Icon }) => (
  <button
    onClick={onClick}
    className={`flex items-center px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg font-medium text-sm sm:text-base transition-all duration-300 
      ${
        active
          ? "bg-blue-500 text-white shadow-md"
          : "bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-blue-600"
      }
      focus:outline-none focus:ring-2 focus:ring-blue-400`}
  >
    <Icon className="mr-2 text-lg" />
    {label}
  </button>
);

const Pagination = ({ currentPage, totalPages, onPageChange }) => (
  <div className="flex justify-center items-center gap-2 mt-6">
    <button
      onClick={() => onPageChange(currentPage - 1)}
      disabled={currentPage === 1}
      className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-blue-100 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
    >
      Trước
    </button>
    {[...Array(totalPages)].map((_, index) => (
      <button
        key={index + 1}
        onClick={() => onPageChange(index + 1)}
        className={`px-3 py-1.5 text-sm rounded-lg transition-all duration-200 ${
          currentPage === index + 1
            ? "bg-blue-500 text-white shadow-md"
            : "bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-blue-600"
        }`}
      >
        {index + 1}
      </button>
    ))}
    <button
      onClick={() => onPageChange(currentPage + 1)}
      disabled={currentPage === totalPages}
      className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-blue-100 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
    >
      Sau
    </button>
  </div>
);

const FeedbackAdmin = () => {
  const [tab, setTab] = useState("leader-feedback");
  const [selectedLeaderId, setSelectedLeaderId] = useState();
  const [selectedMemberId, setSelectedMemberId] = useState();
  const [selectedGroupId, setSelectedGroupId] = useState();
  const [leaderFeedbackPage, setLeaderFeedbackPage] = useState(1);
  const [groupFeedbackPage, setGroupFeedbackPage] = useState(1);
  const [leaderReportPage, setLeaderReportPage] = useState(1);
  const [memberReportPage, setMemberReportPage] = useState(1);
  const [groupReportPage, setGroupReportPage] = useState(1);

  const itemsPerPage = 3;

  const selectedLeader = feedbackData.leaders.find(
    (l) => l.id === Number(selectedLeaderId)
  );
  const selectedMember = feedbackData.members.find(
    (m) => m.id === Number(selectedMemberId)
  );
  const selectedGroup = feedbackData.groups.find(
    (g) => g.id === selectedGroupId
  );

  const renderSelect = (label, options, value, onChange) => (
    <div className="mb-6 w-full max-w-xs sm:max-w-md">
      <label className="block mb-2 text-sm font-semibold text-gray-700">
        {label}
      </label>
      <select
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2.5 text-sm bg-white border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
      >
        <option value="">-- Chọn --</option>
        {options.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {opt.name}
          </option>
        ))}
      </select>
    </div>
  );

  const renderFeedbacks = (feedbacks, currentPage, setCurrentPage) => {
    const totalPages = Math.ceil(feedbacks.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedFeedbacks = feedbacks.slice(
      startIndex,
      startIndex + itemsPerPage
    );

    return (
      <>
        {paginatedFeedbacks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            {paginatedFeedbacks.map((fb) => (
              <div
                key={fb.id}
                className="bg-white p-4 sm:p-5 rounded-lg border border-gray-100 shadow-md"
              >
                <p className="text-xs text-gray-500 mb-2">{fb.date}</p>
                <p className="text-gray-700 text-sm leading-relaxed">
                  {fb.content}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm mt-6">
            Không có feedback nào để hiển thị.
          </p>
        )}
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </>
    );
  };

  const renderReports = (reports, currentPage, setCurrentPage) => {
    const totalPages = Math.ceil(reports.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedReports = reports.slice(
      startIndex,
      startIndex + itemsPerPage
    );

    return (
      <>
        {paginatedReports.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            {paginatedReports.map((rp) => (
              <div
                key={rp.id}
                className="bg-white p-4 sm:p-5 rounded-lg border border-gray-100 shadow-md"
              >
                <p className="text-xs text-gray-500 mb-2">{rp.date}</p>
                <p className="font-semibold text-gray-800 text-sm">
                  {rp.title}
                </p>
                <p className="text-gray-600 text-sm mt-1 leading-relaxed">
                  {rp.description}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm mt-6">
            Không có báo cáo nào để hiển thị.
          </p>
        )}
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="w-full mx-auto">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-6 sm:mb-8 flex items-center">
          <MdDashboard className="mr-2 text-2xl sm:text-3xl text-blue-500" />
          Bảng Điều Khiển Feedback (Admin)
        </h1>

        <div className="flex flex-wrap gap-2 sm:gap-3 mb-6 sm:mb-8">
          <TabButton
            label="Feedback Leader"
            active={tab === "leader-feedback"}
            onClick={() => setTab("leader-feedback")}
            icon={MdPerson}
          />
          <TabButton
            label="Feedback Nhóm"
            active={tab === "group-feedback"}
            onClick={() => setTab("group-feedback")}
            icon={MdGroup}
          />
          <TabButton
            label="Tất cả Reports"
            active={tab === "reports"}
            onClick={() => setTab("reports")}
            icon={MdArticle}
          />
        </div>

        <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-xl shadow-lg transition-all duration-300">
          {tab === "leader-feedback" && (
            <div className="animate-fade-in">
              {renderSelect(
                "Chọn Leader",
                feedbackData.leaders,
                selectedLeaderId,
                setSelectedLeaderId
              )}
              {selectedLeader &&
                renderFeedbacks(
                  selectedLeader.feedbacks,
                  leaderFeedbackPage,
                  setLeaderFeedbackPage
                )}
            </div>
          )}

          {tab === "group-feedback" && (
            <div className="animate-fade-in">
              {renderSelect(
                "Chọn Nhóm",
                feedbackData.groups,
                selectedGroupId,
                setSelectedGroupId
              )}
              {selectedGroup &&
                renderFeedbacks(
                  selectedGroup.feedbacks,
                  groupFeedbackPage,
                  setGroupFeedbackPage
                )}
            </div>
          )}

          {tab === "reports" && (
            <div className="space-y-8 sm:space-y-10 animate-fade-in">
              <section>
                <h2 className="text-lg sm:text-xl font-semibold text-blue-600 mb-4 flex items-center">
                  <MdPerson className="mr-2 text-xl text-blue-500" />
                  Báo Cáo từ Leader
                </h2>
                {renderSelect(
                  "Chọn Leader",
                  feedbackData.leaders,
                  selectedLeaderId,
                  setSelectedLeaderId
                )}
                {selectedLeader &&
                  renderReports(
                    selectedLeader.reports,
                    leaderReportPage,
                    setLeaderReportPage
                  )}
              </section>

              <section>
                <h2 className="text-lg sm:text-xl font-semibold text-green-600 mb-4 flex items-center">
                  <MdPerson className="mr-2 text-xl text-green-500" />
                  Báo Cáo từ Thành Viên
                </h2>
                {renderSelect(
                  "Chọn Member",
                  feedbackData.members,
                  selectedMemberId,
                  setSelectedMemberId
                )}
                {selectedMember &&
                  renderReports(
                    selectedMember.reports,
                    memberReportPage,
                    setMemberReportPage
                  )}
              </section>

              <section>
                <h2 className="text-lg sm:text-xl font-semibold text-purple-600 mb-4 flex items-center">
                  <MdGroup className="mr-2 text-xl text-purple-500" />
                  Báo Cáo từ Nhóm
                </h2>
                {renderSelect(
                  "Chọn Nhóm",
                  feedbackData.groups,
                  selectedGroupId,
                  setSelectedGroupId
                )}
                {selectedGroup &&
                  renderReports(
                    selectedGroup.reports,
                    groupReportPage,
                    setGroupReportPage
                  )}
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeedbackAdmin;

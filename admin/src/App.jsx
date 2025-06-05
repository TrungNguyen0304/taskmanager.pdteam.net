import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Home from "./pages/admin/Home";
import Login from "./pages/Login";
import CreateUser from "./pages/admin/Users/CreateUser";
import UpdateUser from "./pages/admin/Users/UpdateUser";
import Leader from "./pages/admin/Users/Leader";
import MemberPage from "./pages/admin/Users/Member";
import ManagementDetail from "./components/ManagementDetail";
import MemberDetail from "./pages/admin/Users/MemberDetail";
import LeaderDetail from "./pages/admin/Users/LeaderDetail";
import CreateLeader from "./pages/admin/Users/CreateLeader";
import Departments from "./pages/admin/Departments/Departments";
import ProjectAssigned from "./pages/admin/Projects/ProjectAssigned";
import CreateProject from "./pages/admin/Projects/CreateProject";
import UpdateProject from "./pages/admin/Projects/UpdateProject";
import ProjectDetail from "./pages/admin/Projects/ProjectDetail";
import CreateDepartment from "./pages/admin/Departments/CreateDepartment";
import UpdateDepartment from "./pages/admin/Departments/UpdateDepartment";
import DepartmentDetail from "./pages/admin/Departments/DepartmentDetail";
import Unassigned from "./pages/admin/Projects/Unassigned";
import Projects from "./pages/leader/Projects/Projects";
import HomeLeader from "./pages/leader/HomeLeader";
import UnassignedTasks from "./pages/leader/Tasks/UnassignedTasks";
import AssignedTasks from "./pages/leader/Tasks/AssignedTasks";
import TeamTable from "./pages/leader/Teams/TeamTable";
import HomeMember from "./pages/member/HomeMember";
import TeamDetail from "./pages/leader/Teams/TeamDetail";
import MemberDetailLeader from "./pages/leader/Teams/MemberDetailLeader";
import CreateTask from "./pages/leader/Tasks/CreateTask";
import UpdateTask from "./pages/leader/Tasks/UpdateTask";
import TaskDetail from "./pages/leader/Tasks/TaskDetail";
import ReportProjects from "./pages/leader/Projects/ReportProjects";
import TaskMember from "./pages/member/Task/TaskMember";
import ChatMember from "./pages/member/ChatMember/ChatMember";
import JoinRequestsPageMember from "./pages/member/ChatMember/JoinRequestsPageMember";
import VideoCallPageMember from "./pages/member/ChatMember/VideoCallPageMember";
import ChatLeader from "./pages/leader/ChatLeader/ChatLeader";
import JoinRequestsPageLeader from "./pages/leader/ChatLeader/JoinRequestsPageLeader";
import VideoCallPageLeader from "./pages/leader/ChatLeader/VideoCallPageLeader";
import Chat from "./pages/admin/Chat/Chat";
import JoinRequestsPage from "./pages/admin/Chat/JoinRequestsPage";
import VideoCallPage from "./pages/admin/Chat/VideoCallPage";
import FeedbackMember from "./pages/member/Task/FeedbackMember";
import ProjectProgress from "./pages/admin/ProjectProgress/ProjectProgress";
import SeeReportAdmin from "./pages/admin/ReportAdmin/SeeReportAdmin";
import TeamMember from "./pages/member/Team/TeamMember";
import TeamDetailMember from "./pages/member/Team/TeamDetailMember";
import ProjectDetailLeader from "./pages/leader/Projects/ProjectDetailLeader";

const CompanyLayout = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?._id;

  return (
    <div className="flex min-h-screen flex-col sm:flex-row">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar userId={userId} />
        <main className="flex-1 p-4 bg-gray-100 overflow-y-auto min-w-0">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/member" element={<MemberPage />} />
            <Route path="/leader" element={<Leader />} />
            <Route path="/management-detail" element={<ManagementDetail />} />
            <Route path="/member-detail" element={<MemberDetail />} />
            <Route path="/leader-detail" element={<LeaderDetail />} />
            <Route path="/departments" element={<Departments />} />
            <Route path="/create-department" element={<CreateDepartment />} />
            <Route
              path="/update-department/:id"
              element={<UpdateDepartment />}
            />
            <Route path="/department-detail" element={<DepartmentDetail />} />
            <Route path="/create-user" element={<CreateUser />} />
            <Route path="/create-leader" element={<CreateLeader />} />
            <Route path="/update-user" element={<UpdateUser />} />
            <Route path="/project-assigned" element={<ProjectAssigned />} />
            <Route path="/project-unassigned" element={<Unassigned />} />
            <Route path="/create-projects" element={<CreateProject />} />
            <Route path="/update-projects/:id" element={<UpdateProject />} />
            <Route path="/project-detail/:id" element={<ProjectDetail />} />
            <Route path="/projectprogress" element={<ProjectProgress />} />

            <Route path="/seereport-admin" element={<SeeReportAdmin />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/chat/requests" element={<JoinRequestsPage />} />
            <Route path="/chat/video-call" element={<VideoCallPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

const LeaderLayout = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?._id;

  return (
    <div className="flex min-h-screen flex-col sm:flex-row">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar userId={userId} />
        <main className="flex-1 p-4 bg-gray-100 overflow-y-auto">
          <Routes>
            <Route path="/" element={<HomeLeader />} />
            <Route path="/teams-table" element={<TeamTable />} />
            <Route path="/team-detail/:id" element={<TeamDetail />} />
            <Route path="/member-detail" element={<MemberDetailLeader />} />

            <Route path="/assigned-tasks" element={<AssignedTasks />} />
            <Route path="/create-task" element={<CreateTask />} />
            <Route path="/update-task/:id" element={<UpdateTask />} />
            <Route path="/task-detail/:id" element={<TaskDetail />} />

            <Route path="/unassigned-tasks" element={<UnassignedTasks />} />

            <Route path="/projects" element={<Projects />} />
            <Route
              path="/project-detail/:_id"
              element={<ProjectDetailLeader />}
            />
            <Route path="/project-report/:id" element={<ReportProjects />} />

            <Route path="/chat" element={<ChatLeader />} />
            <Route path="/chat/requests" element={<JoinRequestsPageLeader />} />
            <Route
              path="/chat/video-call/:groupId"
              element={<VideoCallPageLeader />}
            />
          </Routes>
        </main>
      </div>
    </div>
  );
};

const MemberLayout = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?._id;

  return (
    <div className="flex min-h-screen flex-col sm:flex-row">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar userId={userId} />
        <main className="flex-1 p-4 bg-gray-100 overflow-y-auto">
          <Routes>
            <Route path="/" element={<HomeMember />} />
            <Route path="/task-member" element={<TaskMember />} />
            <Route path="/team-member" element={<TeamMember />} />
            <Route path="/team-detail/:id" element={<TeamDetailMember />} />
            <Route path="/feedback-member" element={<FeedbackMember />} />

            <Route path="/chat" element={<ChatMember />} />
            <Route path="/chat/requests" element={<JoinRequestsPageMember />} />
            <Route path="/chat/video-call" element={<VideoCallPageMember />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

const App = () => {
  const isAuthenticated = localStorage.getItem("isLoggedIn") === "true";
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
      />
      <Route
        path="/*"
        element={
          isAuthenticated ? (
            user?.role === "company" ? (
              <CompanyLayout />
            ) : user?.role === "leader" ? (
              <LeaderLayout />
            ) : user?.role === "member" ? (
              <MemberLayout />
            ) : (
              <Navigate to="/login" replace />
            )
          ) : (
            <Navigate to="/login" replace state={{ from: location }} />
          )
        }
      />
    </Routes>
  );
};

export default App;

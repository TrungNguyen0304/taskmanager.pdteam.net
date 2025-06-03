const mongoose = require("mongoose");
const Team = require("../models/team");
const Project = require("../models/project")
const Task = require("../models/task")
const { notifyTask, notifyTaskRemoval, notifyEvaluateLeader, notifyReportCompany } = require("../controller/notification");
const Report = require("../models/report")
const User = require("../models/user");
const Feedback = require("../models/Feedback");

const getMyTeam = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id);

    // Tìm các team mà người dùng là leader
    const teams = await Team.find({ assignedLeader: userId })
      .populate("assignedLeader", "name")
      .populate("assignedMembers", "name _id"); 
    if (teams.length === 0) {
      return res.status(404).json({ message: "Bạn không tham gia vào nhóm nào." });
    }

    // Định dạng phản hồi
    res.status(200).json({
      message: "Lấy thông tin nhóm thành công.",
      teams: teams.map((team) => ({
        id: team._id,
        name: team.name,
        assignedLeader: team.assignedLeader ? team.assignedLeader.name : null,
        assignedMembers: team.assignedMembers.map((member) => ({
          _id: member._id, // Bao gồm _id thực tế của người dùng
          name: member.name,
        })),
      })),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server.", error: error.message });
  }
};
// xem dự án company giao
const viewAssignedProject = async (req, res) => {
  try {
    const userId = req.user._id;

    // Tìm các team mà user là trưởng nhóm
    const teams = await Team.find({ assignedLeader: userId }).select("_id");

    if (!teams.length) {
      return res.status(404).json({ message: "Bạn chưa là trưởng nhóm của nhóm nào." });
    }

    const teamIds = teams.map(team => team._id);

    // Tìm các project có assignedTeam là 1 trong các team mà user là leader
    const projects = await Project.find({ assignedTeam: { $in: teamIds } });

    if (!projects.length) {
      return res.status(404).json({ message: "Không có nhiệm vụ nào được giao cho nhóm bạn phụ trách." });
    }

    res.status(200).json({
      message: "Danh sách nhiệm vụ nhóm bạn phụ trách:",
      projects: projects.map(project => ({
        _id: project._id,
        name: project.name,
        description: project.description,
        deadline: project.deadline,
        status: project.status,
        teamId: project.assignedTeam
      }))
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách project:", error);
    res.status(500).json({ message: "Lỗi server.", error: error.message });
  }
};

const viewTask = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: "task không tồn tại" })
    }
    res.status(200).json({
      message: `thong tin task ${task.name}`,
      task,
    })

  } catch (error) {

  }
}
// const viewAssignedProject = async (req, res) => {
//   try {
//     const userId = req.user._id;

//     // Tìm tất cả team mà user là leader hoặc là member
//     const teams = await Team.find({
//       $or: [
//         { assignedLeader: userId },
//         { assignedMembers: userId }
//       ]
//     }).select("_id");

//     if (!teams.length) {
//       return res.status(404).json({ message: "Bạn không thuộc nhóm nào được giao nhiệm vụ." });
//     }

//     const teamIds = teams.map(team => team._id);

//     // Tìm các project được giao cho các team đó
//     const projects = await Project.find({ assignedTeam: { $in: teamIds } });

//     if (!projects.length) {
//       return res.status(404).json({ message: "Không có nhiệm vụ nào được giao cho nhóm của bạn." });
//     }

//     res.status(200).json({
//       message: "Danh sách nhiệm vụ của nhóm bạn:",
//       projects: projects.map(project => ({
//         id: project._id,
//         name: project.name,
//         description: project.description,
//         deadline: project.deadline,
//         status: project.status,
//         teamId: project.assignedTeam
//       }))
//     });
//   } catch (error) {
//     console.error("Lỗi khi lấy danh sách project:", error);
//     res.status(500).json({ message: "Lỗi server.", error: error.message });
//   }
// };


// thêm sửa xóa task
const createTask = async (req, res) => {
  try {
    const { name, description, status, projectId, priority, progress } = req.body;
    const userId = req.user._id;

    if (!name || !projectId) {
      return res.status(400).json({ message: "Thiếu tên task hoặc projectId." });
    }

    // 1. Kiểm tra project tồn tại
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Không tìm thấy project." });
    }

    // 2. Kiểm tra project đã được gán team chưa
    if (!project.assignedTeam) {
      return res.status(400).json({ message: "Project chưa được gán cho team nào." });
    }

    // 3. Lấy team và kiểm tra leader
    const team = await Team.findById(project.assignedTeam);
    if (!team || team.assignedLeader.toString() !== userId.toString()) {
      return res.status(403).json({ message: "bạn không có quyền tạo task" });
    }

    // 4. Tạo task
    const allowedStatuses = ["pending", "in_progress", "completed", "cancelled"];
    const allowedPriorities = [1, 2, 3];
    const taskStatus = allowedStatuses.includes(status) ? status : "pending";
    const taskPriority = allowedPriorities.includes(priority) ? priority : 2;
    const taskProgress = typeof progress === "number" && progress >= 0 && progress <= 100 ? progress : 0;

    const newTask = new Task({
      name,
      description,
      status: taskStatus,
      projectId: projectId,
      priority: taskPriority,
      progress: taskProgress
    });

    await newTask.save();

    res.status(201).json({
      message: "Tạo task thành công.",
      task: {
        _id: newTask._id,
        name: newTask.name,
        description: newTask.description,
        status: newTask.status,
        projectId: newTask.projectId,
        priority: newTask.priority
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, status, priority } = req.body;
    const userId = req.user._id;

    // 1. Tìm task
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: "Không tìm thấy task." });
    }

    // 2. Tìm project liên quan tới task
    const project = await Project.findById(task.projectId);
    if (!project) {
      return res.status(404).json({ message: "Không tìm thấy project." });
    }

    // 3. Kiểm tra project có assignedTeam chưa
    if (!project.assignedTeam) {
      return res.status(400).json({ message: "Project chưa được gán cho team nào." });
    }

    // 4. Kiểm tra user có phải là leader không
    const team = await Team.findById(project.assignedTeam);
    if (!team || team.assignedLeader.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Bạn không có quyền cập nhật task này." });
    }

    // 5. Cập nhật các trường nếu có
    const allowedStatuses = ["pending", "in_progress", "completed", "cancelled"];
    const allowedPriorities = [1, 2, 3];

    if (name !== undefined) task.name = name;
    if (description !== undefined) task.description = description;
    if (status !== undefined && allowedStatuses.includes(status)) task.status = status;
    if (priority !== undefined && allowedPriorities.includes(priority)) task.priority = priority;

    await task.save();

    res.status(200).json({
      message: "Cập nhật task thành công.",
      task: {
        _id: task._id,
        name: task.name,
        description: task.description,
        status: task.status,
        project: task.project,
        priority: task.priority
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    // 1. Tìm task
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: "Không tìm thấy task." });
    }

    // 2. Tìm project của task
    const project = await Project.findById(task.projectId);
    if (!project) {
      return res.status(404).json({ message: "Không tìm thấy project liên quan." });
    }

    // 3. Kiểm tra project đã được gán team chưa
    if (!project.assignedTeam) {
      return res.status(400).json({ message: "Project chưa được gán cho team nào." });
    }

    // 4. Kiểm tra quyền: user phải là leader của team đó
    const team = await Team.findById(project.assignedTeam);
    if (!team || team.assignedLeader.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Bạn không có quyền xóa task này." });
    }

    // 5. Xóa task
    await task.deleteOne();

    res.status(200).json({ message: "Xóa task thành công." });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

const showAllTasks = async (req, res) => {
  try {
    const userId = req.user._id;
    const { sortBy = "createdAt", order = "desc" } = req.query;

    // 1. Tìm tất cả các team mà user là leader
    const teams = await Team.find({ assignedLeader: userId });
    if (!teams.length) {
      return res.status(403).json({ message: "Bạn không phải leader của bất kỳ team nào." });
    }

    const teamIds = teams.map(team => team._id);

    // 2. Lấy tất cả các project được gán cho các team này
    const projects = await Project.find({ assignedTeam: { $in: teamIds } });
    if (!projects.length) {
      return res.status(200).json({ message: "Không có project nào thuộc team của bạn.", tasks: [] });
    }

    const projectIds = projects.map(project => project._id);

    // 3. Lấy tất cả các task thuộc các project đó, sắp xếp theo yêu cầu
    const sortOption = { [sortBy]: order === "asc" ? 1 : -1 };

    const tasks = await Task.find({ projectId: { $in: projectIds } })
      .sort(sortOption)
      .populate("assignedMember", "name email") // nếu cần
      .populate("projectId", "name"); // nếu cần

    res.status(200).json({
      message: "Lấy danh sách task thành công.",
      tasks
    });
  } catch (error) {
    console.error("Lỗi trong showAllTasks:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

const paginationTask = async (req, res) => {
  try {
    const userId = req.user._id;
    const { limit = 5, page = 1 } = req.body;

    const parsedLimit = parseInt(limit);
    const parsedPage = parseInt(page);
    const offset = (parsedPage - 1) * parsedLimit;

    // 1. Tìm team mà user là leader
    const teams = await Team.find({ assignedLeader: userId });
    if (!teams || teams.length === 0) {
      return res.status(403).json({ message: "Bạn không là leader của bất kỳ team nào." });
    }

    const teamIds = teams.map(team => team._id);

    // 2. Tìm project thuộc các team đó
    const projects = await Project.find({ assignedTeam: { $in: teamIds } });
    const projectIds = projects.map(p => p._id);
    if (projectIds.length === 0) {
      return res.status(200).json({ message: "Không có project nào được gán cho team của bạn.", tasks: [] });
    }

    // 3. Lấy task phân trang + tổng số
    const [tasks, total] = await Promise.all([
      Task.find({ projectId: { $in: projectIds } })
        .skip(offset)
        .limit(parsedLimit),
      Task.countDocuments({ projectId: { $in: projectIds } })
    ]);

    const pages = Math.ceil(total / parsedLimit);

    res.status(200).json({
      message: "Lấy danh sách task phân trang thành công.",
      tasks: tasks.map(task => ({
        id: task._id,
        name: task.name,
        description: task.description,
        status: task.status,
        priority: task.priority,
        projectId: task.projectId
      })),
      total,
      limit: parsedLimit,
      offset,
      page: parsedPage,
      pages
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server.", error: error.message });
  }
};

// gan task cho member
const assignTask = async (req, res) => {
  try {
    const { id } = req.params;  // Lấy id từ URL
    const { memberId, deadline } = req.body;

    // Kiểm tra thông tin bắt buộc
    if (!memberId || !deadline) {
      return res.status(400).json({ message: "Thiếu thông tin bắt buộc (memberId, deadline)." });
    }

    const parsedDeadline = new Date(deadline);
    if (isNaN(parsedDeadline.getTime())) {
      return res.status(400).json({ message: "Giá trị deadline không hợp lệ" });
    }
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Đặt về đầu ngày hôm nay

    if (parsedDeadline < now) {
      return res.status(400).json({
        message: "Deadline không được nằm trong quá khứ.",
      });
    }
    // 1. Tìm task theo id
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: "Task không tồn tại." });
    }

    // 2. Tìm project của task
    const project = await Project.findById(task.projectId);
    if (!project) {
      return res.status(404).json({ message: "Project không tồn tại." });
    }

    // 3. Kiểm tra project có assignedTeam
    if (!project.assignedTeam) {
      return res.status(400).json({ message: "Project chưa được gán cho team nào." });
    }

    // 4. Lấy thông tin team (Không kiểm tra trưởng nhóm)
    const team = await Team.findById(project.assignedTeam);
    if (!team) {
      return res.status(404).json({ message: "Team không hợp lệ." });
    }

    // Nếu task đang ở trạng thái pending hoặc draft, thì chuyển sang in_progress
    if (["pending", "draft"].includes(task.status)) {
      task.status = "in_progress";
    }

    // 5. Kiểm tra thành viên có trong team chính thức không
    if (!Array.isArray(team.assignedMembers) || team.assignedMembers.length === 0) {
      return res.status(400).json({ message: "Danh sách thành viên không hợp lệ." });
    }

    const isOfficialMember = team.assignedMembers.some(
      m => m.toString() === memberId.toString()
    );
    if (!isOfficialMember) {
      return res.status(400).json({ message: "Thành viên chưa chính thức trong team." });
    }
    // 7. Gán task cho thành viên và deadline
    task.assignedMember = memberId;
    task.deadline = new Date(deadline);

    await task.save();
    await notifyTask({ userId: memberId.toString(), task });
    res.status(200).json({
      message: "Gán task thành công.",
      task: {
        id: task._id,
        name: task.name,
        description: task.description,
        assignedMember: task.assignedMember,
        deadline: task.deadline,
        status: task.status,
        priority: task.priority
      }
    });

  } catch (error) {
    res.status(500).json({ message: "Lỗi server.", error: error.message });
  }
};


// lấy ra những task chk giao 
const unassignedTask = async (req, res) => {
  try {
    const userId = req.user._id;
    const { sortBy = "createdAt", order = "desc" } = req.query;

    // 1. Tìm tất cả các team mà user là leader
    const teams = await Team.find({ assignedLeader: userId });
    if (!teams || teams.length === 0) {
      return res.status(403).json({ message: "Bạn không là leader của bất kỳ team nào." });
    }

    const teamIds = teams.map(team => team._id);

    // 2. Lấy project thuộc các team đó
    const projects = await Project.find({ assignedTeam: { $in: teamIds } });
    const projectIds = projects.map(p => p._id);

    if (projectIds.length === 0) {
      return res.status(200).json({ message: "Không có project nào thuộc team của bạn.", tasks: [] });
    }

    // 3. Lấy các task chưa được gán (assignedMember = null)
    const sortOption = {};
    sortOption[sortBy] = order === "asc" ? 1 : -1;

    const tasks = await Task.find({
      projectId: { $in: projectIds },
      assignedMember: null
    }).sort(sortOption);

    res.status(200).json({
      message: "Lấy danh sách task chưa được gán thành công.",
      tasks
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// thu hoi task 
const revokeTaskAssignment = async (req, res) => {
  try {
    const { id } = req.params; // Lấy ID của task

    // 1. Tìm task
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: "Task không tồn tại." });
    }

    // 2. Kiểm tra task đã được gán chưa
    if (!task.assignedMember) {
      return res.status(400).json({ message: "Task chưa được gán nên không thể thu hồi." });
    }

    const revokedMemberId = task.assignedMember;

    // 3. Thu hồi task
    task.assignedMember = null;
    task.deadline = null;

    await task.save();

    // 4. Gửi thông báo (tuỳ chọn)
    await notifyTaskRemoval({
      userId: revokedMemberId.toString(),
      task,
      action: "revoke"
    });

    // 5. Phản hồi
    res.status(200).json({
      message: "Thu hồi task thành công.",
      task: {
        id: task._id,
        name: task.name,
        assignedMember: task.assignedMember,
        deadline: task.deadline,
        status: task.status,
        priority: task.priority
      }
    });

  } catch (error) {
    res.status(500).json({ message: "Lỗi server.", error: error.message });
  }
};

// lấy ra những task đã giao cho member
const getAssignedTask = async (req, res) => {
  try {
    const userId = req.user._id;
    const { sortBy = "createdAt", order = "desc" } = req.query;

    // 1. Tìm các team mà user đang là leader
    const teams = await Team.find({ assignedLeader: userId });
    if (!teams || teams.length === 0) {
      return res.status(403).json({ message: "Bạn không là leader của bất kỳ team nào." });
    }

    const teamIds = teams.map(team => team._id);

    // 2. Lấy project thuộc các team đó
    const projects = await Project.find({ assignedTeam: { $in: teamIds } });
    const projectIds = projects.map(p => p._id);

    if (projectIds.length === 0) {
      return res.status(200).json({ message: "Không có project nào thuộc team của bạn.", tasks: [] });
    }

    // 3. Lấy các task đã được gán (assignedMember ≠ null)
    const sortOption = {};
    sortOption[sortBy] = order === "asc" ? 1 : -1;

    const tasks = await Task.find({
      projectId: { $in: projectIds },
      assignedMember: { $ne: null }
    })
      .populate('assignedMember', 'name')
      .sort(sortOption);

    res.status(200).json({
      message: "Lấy danh sách task đã được gán thành công.",
      tasks
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// lấy ra tất cả những report member
// const showallRepor = async (req, res) => {
//   try {
//     const leaderId = req.user._id;

//     // Lấy các team mà user hiện tại là leader
//     const teamsLed = await Team.find({ assignedLeader: leaderId }).select('_id name');
//     console.log("teamsLed:", teamsLed); // Debug các team mà leader quản lý
//     if (teamsLed.length === 0) {
//       return res.status(404).json({ message: "Không có team nào do bạn quản lý." });
//     }

//     const teamIds = teamsLed.map(team => team._id);

//     // Lọc báo cáo của tất cả thành viên trong các team mà leader quản lý
//     const reports = await Report.find({ 
//       team: { $in: teamIds } // Lọc theo team mà leader quản lý
//     }, '-team -feedback')
//       .populate({
//         path: 'task',
//         select: '_id name deadline', // Chỉ lấy các trường cần thiết
//       })
//       .populate({
//         path: 'assignedMembers',
//         select: '_id name role', // Chỉ lấy các trường cần thiết
//       })
//       // .populate({
//       //     path: 'feedback',
//       //     select: '_id comment rating',
//       // })
//       .lean(); // Trả về dữ liệu thuần túy, không phải Mongoose document

//     console.log("Reports:", reports); // Debug các báo cáo trả về

//     if (!reports || reports.length === 0) {
//       return res.status(404).json({ message: "Không có báo cáo nào cho các team bạn quản lý." });
//     }

//     res.json(reports);
//   } catch (error) {
//     console.error("getReportsForLeader error:", error);
//     res.status(500).json({ message: "Lỗi khi lấy báo cáo.", error: error.message });
//   }
// };

const showallReport = async (req, res) => {
  try {
    const leaderId = req.user._id;

    // 1. Tìm tất cả team mà leader đang quản lý
    const teamsLed = await Team.find({ assignedLeader: leaderId }).select('_id name assignedMembers');
    if (!teamsLed || teamsLed.length === 0) {
      return res.status(404).json({ message: "Bạn không quản lý team nào." });
    }

    // 2. Lấy danh sách ID các team và tất cả member trong các team đó
    const teamIds = teamsLed.map(team => team._id);

    // Gộp tất cả thành viên trong các team lại thành một mảng duy nhất (không trùng)
    const memberIds = [
      ...new Set(
        teamsLed.flatMap(team =>
          team.assignedMembers.map(member => member.toString())
        )
      )
    ].filter(id => id !== leaderId.toString());

    if (memberIds.length === 0) {
      return res.status(404).json({ message: "Không có thành viên nào trong team của bạn." });
    }

    // 3. Tìm tất cả báo cáo của các member trong team mà leader quản lý
    const reports = await Report.find({
      team: { $in: teamIds },
      assignedMembers: { $in: memberIds }
    }, '-team -feedback')
      .populate({
        path: 'task',
        select: '_id name deadline',
      })
      .populate({
        path: 'assignedMembers',
        select: '_id name role',
      })
      .lean();

    if (!reports || reports.length === 0) {
      return res.status(404).json({ message: "Không có báo cáo nào từ các thành viên trong team của bạn." });
    }

    res.json(reports);
  } catch (error) {
    console.error("Lỗi khi lấy báo cáo cho leader:", error);
    res.status(500).json({ message: "Đã xảy ra lỗi khi lấy báo cáo.", error: error.message });
  }
};

// lây ra report của từng member
const showAllReportMember = async (req, res) => {
  try {
    const id = req.params.id;
    const leaderId = req.user._id;

    // Tìm các team do leader quản lý
    const teamsLed = await Team.find({ assignedLeader: leaderId }).select('_id assignedMembers');
    if (!teamsLed || teamsLed.length === 0) {
      return res.status(403).json({ message: "Bạn không quản lý team nào." });
    }

    // Kiểm tra xem id có thuộc team của leader không
    const isMemberInTeam = teamsLed.some(team =>
      Array.isArray(team.assignedMembers) && team.assignedMembers.some(member => member.toString() === id)
    );
    if (!isMemberInTeam) {
      return res.status(403).json({ message: "Bạn không có quyền xem báo cáo của thành viên này." });
    }

    // Lọc báo cáo của thành viên được chỉ định
    const reports = await Report.find({ assignedMembers: id }, '-team -feedback')
      .populate({
        path: 'task',
        select: '_id name deadline',
      })
      .populate({
        path: 'assignedMembers',
        select: '_id name role',
      })
      .lean(); // Trả về dữ liệu thuần túy, không phải Mongoose document

    if (!reports || reports.length === 0) {
      return res.status(404).json({ message: "Thành viên này chưa gửi báo cáo nào." });
    }

    res.json(reports);
  } catch (error) {
    console.error("getReportsForMember error:", error);
    res.status(500).json({ message: "Lỗi khi lấy báo cáo.", error: error.message });
  }
};

const evaluateMemberReport = async (req, res) => {
  try {
    const { id } = req.params; // id của report
    const { comment, score } = req.body;
    const userId = req.user._id; // leader hiện tại

    // Kiểm tra score hợp lệ
    if (typeof score !== 'number' || score < 0 || score > 10) {
      return res.status(400).json({ message: 'Điểm đánh giá phải từ 0 đến 10.' });
    }

    // Lấy report kèm thông tin team
    const report = await Report.findById(id).populate({
      path: 'team',
      populate: {
        path: 'assignedLeader',
        model: 'User'
      }
    });

    if (!report) {
      return res.status(404).json({ message: 'Báo cáo không tồn tại.' });
    }

    // Kiểm tra leader hiện tại có phải leader của team không
    const teamLeader = report.team?.assignedLeader?._id?.toString();
    if (teamLeader !== userId.toString()) {
      return res.status(403).json({ message: 'Không có quyền đánh giá báo cáo này.' });
    }

    // Kiểm tra đã feedback chưa
    const existingFeedback = await Feedback.findOne({ report: id });
    if (existingFeedback) {
      return res.status(400).json({ message: 'Báo cáo này đã được đánh giá.' });
    }

    // Tạo feedback
    const feedback = new Feedback({
      report: id,
      comment,
      score,
      from: 'Leader',
      to: 'Member'
    });

    await feedback.save();

    await notifyEvaluateLeader({
      userId: report.assignedMembers.toString(),
      feedback,
      report
    });
    // Cập nhật lại report
    report.feedback = feedback._id;
    await report.save();

    res.status(201).json({
      message: 'Đánh giá báo cáo thành công.',
      feedback
    });

  } catch (error) {
    console.error("evaluateMemberReport error:", error);
    res.status(500).json({ message: 'Lỗi server.', error: error.message });
  }
};

const createReportCompany = async (req, res) => {
  try {
    const { projectId, content, projectProgress, difficulties, feedback } = req.body;
    const userId = req.user._id;

    // Validate req.user
    if (!req.user || !userId) {
      return res.status(401).json({ message: "Không tìm thấy thông tin người dùng." });
    }

    // Kiểm tra dữ liệu bắt buộc
    if (!projectId || !content || projectProgress === undefined) {
      return res.status(400).json({ message: "Thiếu projectId, nội dung hoặc tiến độ công việc." });
    }

    // Xử lý tiến độ nếu dạng string có dấu %
    let progress = projectProgress;
    if (typeof projectProgress === "string" && projectProgress.includes("%")) {
      progress = parseInt(projectProgress.replace("%", ""), 10);
    }

    // Kiểm tra tiến độ hợp lệ
    if (isNaN(progress) || progress < 0 || progress > 100) {
      return res.status(400).json({ message: "Tiến độ công việc không hợp lệ." });
    }

    // Tìm dự án và populate thông tin team và leader
    const project = await Project.findById(projectId).populate({
      path: 'assignedTeam',
      populate: {
        path: 'assignedLeader',
        model: 'User'
      }
    });

    if (!project) {
      return res.status(404).json({ message: "Không tìm thấy dự án." });
    }

    const team = project.assignedTeam;
    const assignedLeader = team?.assignedLeader;

    if (!team || !assignedLeader) {
      return res.status(400).json({ message: "Không tìm thấy team hoặc leader của dự án." });
    }

    // Kiểm tra quyền: chỉ leader của team mới được báo cáo
    if (String(assignedLeader._id) !== String(userId)) {
      return res.status(403).json({ message: "Chỉ leader của team được báo cáo tiến độ dự án." });
    }

    // Tìm companyManager (người dùng với role: 'company')
    const companyManager = await User.findOne({ role: 'company' });
    if (!companyManager) {
      return res.status(400).json({ message: "Không tìm thấy thông tin quản lý công ty." });
    }

    // Tạo báo cáo
    const report = new Report({
      content,
      difficulties,
      projectProgress: progress,
      project: projectId,
      team: team._id,
      assignedLeader: userId,
      feedback,
      assignedMembers: []
    });

    await report.save();

    // Cập nhật tiến độ dự án
    project.progress = progress;
    await project.save();

    // Gửi thông báo
    await notifyReportCompany({
      userId: companyManager._id.toString(),
      project,
      report,
      leader: req.user.name || 'Leader'
    });

    // Populate lại báo cáo vừa lưu
    const savedReport = await report.populate([
      { path: "team", select: "name" },
      { path: "assignedLeader", select: "name" }
    ]);

    // Xóa trường assignedMember nếu có
    if (savedReport._doc?.assignedMember) {
      delete savedReport._doc.assignedMember;
    }

    // Trả về phản hồi với companyManager ID
    res.status(201).json({
      message: "Gửi báo cáo dự án thành công.",
      report: savedReport,
      companyManagerId: companyManager._id.toString() // Hiển thị ID của companyManager
    });

  } catch (error) {
    console.error("createReportCompany error:", error);
    res.status(500).json({
      message: "Lỗi server.",
      error: error.message
    });
  }
};

// xem tất cả đánh giá 
const showAllFeedback = async (req, res) => {
  try {
    const userId = req.user._id;

    // Lấy các report thuộc team mà user là assignedLeader
    const reports = await Report.find()
      .populate({
        path: 'team',
        match: { assignedLeader: userId }, // Chỉ lấy team mà user là leader
        populate: {
          path: 'assignedLeader',
          model: 'User',
          select: 'name email'
        }
      })
      .populate({
        path: 'feedback',
        model: 'Feedback',
        match: { from: 'Company', to: 'Leader' }, // Chỉ lấy feedback từ Company đến Leader
        select: 'comment score from createdAt'
      })
      .sort({ createdAt: -1 });

    // Lọc và định dạng feedback
    const feedbacks = reports
      .filter(r => r.team && r.feedback) // Chỉ lấy report có team (user là leader) và có feedback
      .map(r => ({
        feedbackId: r.feedback._id,
        team: {
          teamId: r.team?._id || null,
          teamName: r.team?.name || 'Không rõ',
          leaderName: r.team?.assignedLeader?.name || 'Không rõ'
        },
        report: {
          reportId: r._id,
          content: r.content
        },
        comment: r.feedback.comment,
        score: r.feedback.score,
        from: r.feedback.from,
        createdAt: r.feedback.createdAt
      }));

    res.status(200).json({
      message: "Lấy danh sách đánh giá thành công.",
      feedbacks
    });

  } catch (error) {
    console.error("showAllFeedbackLeader error:", error);
    res.status(500).json({
      message: "Lỗi server.",
      error: error.message
    });
  }
};

module.exports = {
  getMyTeam,
  viewAssignedProject,
  createTask,
  updateTask,
  deleteTask,
  showAllTasks,
  paginationTask,
  assignTask,
  revokeTaskAssignment,
  unassignedTask,
  getAssignedTask,
  showallReport,
  showAllReportMember,
  evaluateMemberReport,
  createReportCompany,
  showAllFeedback,
  viewTask
};

const mongoose = require("mongoose");
const Team = require("../models/team");
const Task = require("../models/task")
const Project = require("../models/project")
const user = require("../models/user")
const Report = require("../models/report");
const { notifyReport, notifyStatusTask } = require("../controller/notification");

const getMyTeam = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id);

    // Tìm tất cả nhóm mà userId có trong assignedMembers
    const teams = await Team.find({ assignedMembers: userId })
      .populate('assignedLeader', 'name _id')
      .populate('assignedMembers', 'name _id');

    if (teams.length === 0) {
      return res.status(404).json({ message: "Bạn không tham gia vào nhóm nào." });
    }

    // Trả về thông tin các nhóm mà người dùng tham gia
    res.status(200).json({
      message: "Lấy thông tin nhóm thành công.",
      teams: teams.map(team => ({
        id: team._id,
        name: team.name,
        assignedLeader: team.assignedLeader ? team.assignedLeader.name : null,
        assignedMembers: team.assignedMembers.map((member) => ({
          _id: member._id,
          name: member.name,
        }))
      }))
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server.", error: error.message });
  }
};

const getMyTasks = async (req, res) => {
  try {
    const userId = req.user._id;

    // Lấy tất cả task của user
    const tasks = await Task.find({ assignedMember: userId }).lean();

    if (tasks.length === 0) {
      return res.status(404).json({ message: "Bạn chưa được giao task nào." });
    }

    // Lấy danh sách projectId liên quan
    const projectIds = tasks.map(task => task.projectId);
    const validProjects = await Project.find({
      _id: { $in: projectIds },
      assignedTeam: { $ne: null } // chỉ giữ lại project còn được gán cho team
    }).select('_id');

    const validProjectIds = validProjects.map(p => p._id.toString());

    // Lọc task theo project còn hợp lệ
    const filteredTasks = tasks.filter(task => validProjectIds.includes(task.projectId?.toString()));

    if (filteredTasks.length === 0) {
      return res.status(404).json({ message: "Bạn chưa được giao task nào." });
    }

    res.status(200).json({
      message: "Lấy danh sách task của bạn thành công.",
      tasks: filteredTasks.map(task => ({
        id: task._id,
        name: task.name,
        description: task.description,
        status: task.status,
        priority: task.priority,
        deadline: task.deadline,
        projectId: task.projectId
      }))
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server.", error: error.message });
  }
};

// const createReport = async (req, res) => {
//   try {
//     const { taskId, content, taskProgress, difficulties, feedback } = req.body;
//     const userId = req.user._id;

//     if (!taskId || !content || !taskProgress) {
//       return res
//         .status(400)
//         .json({ message: "Thiếu taskId, nội dung hoặc tiến độ công việc." });
//     }

//     const task = await Task.findById(taskId).populate({
//       path: 'projectId',
//       populate: {
//         path: 'assignedTeam',
//         model: 'Team',
//         populate: {
//           path: 'assignedLeader',
//           model: 'User'
//         }
//       }
//     });

//     if (!task) {
//       return res.status(404).json({ message: "Không tìm thấy công việc." });
//     }

//     if (String(task.assignedMember) !== String(userId)) {
//       return res.status(403).json({ message: "Bạn không được giao công việc này." });
//     }

//     const team = task.projectId?.assignedTeam;
//     const assignedLeader = team?.assignedLeader;

//     if (!team || !assignedLeader) {
//       return res.status(400).json({ message: "Không tìm thấy team hoặc leader." });
//     }

//     const report = new Report({
//       assignedMember: userId,
//       content,
//       difficulties,
//       taskProgress,
//       task: taskId,
//       team: team._id,
//       assignedLeader: assignedLeader._id,
//       feedback
//     });

//     await report.save();

//     // Cập nhật task.progress nếu cần
//     if (typeof taskProgress === 'number' && taskProgress >= 0 && taskProgress <= 100) {
//       task.progress = taskProgress;
//       await task.save();
//     }

//     await notifyReport({
//       userId: assignedLeader._id.toString(),
//       task,
//       report,
//       member: req.user.name || 'Thành viên'
//     });

//     res.status(201).json({
//       message: "Gửi báo cáo thành công.",
//       report
//     });

//   } catch (error) {
//     console.error("createReport error:", error);
//     res.status(500).json({ message: "Lỗi server.", error: error.message });
//   }
// };

const showAllFeedback = async (req, res) => {
  try {
    const userId = req.user._id;

    // Lấy các report của member, có feedback và task
    const reports = await Report.find({ assignedMembers: userId })
      .populate({
        path: 'feedback',
        model: 'Feedback'
      })
      .populate({
        path: 'task',
        select: 'name'
      })
      .sort({ createdAt: -1 });

    const feedbacks = reports
      .filter(r => r.feedback)
      .map(r => ({
        feedbackId: r.feedback._id,
        task: {
          taskId: r.task?._id || null,
          taskName: r.task?.name || 'Không rõ'
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
    console.error("showAllFeedback error:", error);
    res.status(500).json({ message: "Lỗi server.", error: error.message });
  }
};

const updateTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user._id;

    const allowedStatuses = ["in_progress", "completed", "cancelled", "pending", "revoked"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Trạng thái không hợp lệ." });
    }

    // Populate project → assignedTeam → assignedLeader
    const task = await Task.findById(id).populate({
      path: 'projectId',
      populate: {
        path: 'assignedTeam',
        model: 'Team',
        populate: {
          path: 'assignedLeader',
          model: 'User'
        }
      }
    });

    if (!task) {
      return res.status(404).json({ message: "Không tìm thấy task." });
    }

    // Kiểm tra quyền cập nhật task
    if (String(task.assignedMember) !== String(userId)) {
      return res.status(403).json({ message: "Bạn không có quyền cập nhật trạng thái task này." });
    }

    // Cập nhật trạng thái
    const oldStatus = task.status;
    task.status = status;
    await task.save();

    // Lấy leader từ project → team → assignedLeader
    const team = task.projectId?.assignedTeam;
    const assignedLeader = team?.assignedLeader;

    if (!assignedLeader) {
      return res.status(400).json({ message: "Không tìm thấy leader để thông báo." });
    }

    // Gửi thông báo
    await notifyStatusTask({
      userId: assignedLeader._id.toString(),
      task,
      member: req.user.name || 'Thành viên',
      oldStatus
    });

    res.status(200).json({
      message: "Cập nhật trạng thái thành công.",
      task: {
        id: task._id,
        name: task.name,
        status: task.status,
        updatedAt: task.updatedAt
      }
    });

  } catch (error) {
    console.error("updateTaskStatus error:", error);
    res.status(500).json({ message: "Lỗi server.", error: error.message });
  }
};

// ghi đề taskProgress lên
const createReport = async (req, res) => {
  try {
    const { taskId, content, taskProgress, difficulties, feedback } = req.body;
    const userId = req.user._id;

    if (!taskId || !content || taskProgress === undefined) {
      return res.status(400).json({ message: "Thiếu taskId, nội dung hoặc tiến độ công việc." });
    }

    // Xử lý giá trị taskProgress nếu nó có dấu %
    let progress = taskProgress;
    if (typeof taskProgress === "string" && taskProgress.includes("%")) {
      progress = taskProgress.replace("%", "");
      progress = parseInt(progress, 10);
    }

    if (isNaN(progress) || progress < 0 || progress > 100) {
      return res.status(400).json({ message: "Tiến độ công việc không hợp lệ." });
    }

    const task = await Task.findById(taskId).populate({
      path: 'projectId',
      populate: {
        path: 'assignedTeam',
        model: 'Team',
        populate: {
          path: 'assignedLeader',
          model: 'User'
        }
      }
    });

    if (!task) {
      return res.status(404).json({ message: "Không tìm thấy công việc." });
    }

    if (String(task.assignedMember) !== String(userId)) {
      return res.status(403).json({ message: "Bạn không được giao công việc này." });
    }

    const team = task.projectId?.assignedTeam;
    const assignedLeader = team?.assignedLeader;

    if (!team || !assignedLeader) {
      return res.status(400).json({ message: "Không tìm thấy team hoặc leader." });
    }

    const report = new Report({
      assignedMembers: userId,
      content,
      difficulties,
      taskProgress: progress, // Sử dụng giá trị đã xử lý
      task: taskId,
      team: team._id,
      assignedLeader: assignedLeader._id,
      feedback: feedback || "",
    });

    await report.save();

    // Cập nhật task.progress với giá trị progress mới từ báo cáo
    task.progress = progress; // Ghi đè lên task.progress
    await task.save();

    await notifyReport({
      userId: assignedLeader._id.toString(),
      task,
      report,
      member: req.user.name || 'Thành viên'
    });

    res.status(201).json({
      message: "Gửi báo cáo thành công.",
      report
    });

  } catch (error) {
    console.error("createReport error:", error);
    res.status(500).json({ message: "Lỗi server.", error: error.message });
  }
};

// vỉewTeam
const viewTeam = async (req, res) => {
  try {
    const { id } = req.params;

    // Lấy thông tin team và populate leader & members
    const team = await Team.findById(id)
      .populate("assignedLeader", "name email")
      .populate("assignedMembers", "name email")
      .lean();

    if (!team) {
      return res.status(404).json({ message: "Không tìm thấy team." });
    }

    // Lấy project của team này
    const projects = await Project.find({ assignedTeam: id })
      .select("name description deadline status")
      .lean();

    res.status(200).json({
      message: `Thông tin Team: ${team.name}`,
      team: {
        _id: team._id,
        name: team.name,
        description: team.description,
        assignedLeader: team.assignedLeader,
        assignedMembers: team.assignedMembers,
        projects,
      },
    });
  } catch (error) {
    console.error("Lỗi khi lấy thông tin team:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

module.exports = {
  getMyTeam,
  getMyTasks,
  createReport,
  showAllFeedback,
  updateTaskStatus,
  viewTeam
};

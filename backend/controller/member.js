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

    // Tìm tất cả task của user và populate project + team name
    const tasks = await Task.find({ assignedMember: userId })
      .populate({
        path: 'projectId',
        select: 'name status assignedTeam ',
        populate: {
          path: 'assignedTeam',
          select: 'name assignedLeader',
          populate: {
            path: 'assignedLeader',
            select: 'name' // Lấy tên của leader
          }
        }
      })
      .lean();

    if (tasks.length === 0) {
      return res.status(404).json({ message: "Bạn chưa được giao task nào." });
    }

    // Lọc project còn hợp lệ (project vẫn có assignedTeam)
    const filteredTasks = tasks.filter(
      task => task.projectId && task.projectId.assignedTeam
    );

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
        assignedAt: task.assignedAt
          ? new Date(task.assignedAt.getTime() + 7 * 60 * 60 * 1000).toISOString().replace('T', ' ').slice(0, 19)
          : null,
        project: {
          id: task.projectId._id,
          name: task.projectId.name,
          status: task.projectId.status,
          team: {
            id: task.projectId.assignedTeam._id,
            name: task.projectId.assignedTeam.name,
            assignedLeader: task.projectId.assignedTeam.assignedLeader
              ? {
                id: task.projectId.assignedTeam.assignedLeader._id,
                name: task.projectId.assignedTeam.assignedLeader.name
              }
              : null
          }
        }
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
    const { content, taskProgress, difficulties } = req.body;
    const userId = req.user._id;
    const taskId = req.params.id;

    if (!taskId || !content || taskProgress === undefined) {
      return res.status(400).json({ message: "Thiếu taskId, nội dung hoặc tiến độ công việc." });
    }

    let progress = taskProgress;
    if (typeof taskProgress === "string" && taskProgress.includes("%")) {
      progress = parseInt(taskProgress.replace("%", ""), 10);
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

    let fileUrl = null;
    if (req.file) {
      fileUrl = `/uploads/reports/${req.file.filename}`;
    }

    const report = new Report({
      assignedMembers: userId,
      content,
      difficulties,
      taskProgress: progress,
      task: taskId,
      team: team._id,
      assignedLeader: assignedLeader._id,
      file: fileUrl,
    });

    await report.save();

    await report.populate([
      { path: 'assignedLeader', select: 'name _id' },
      { path: 'assignedMembers', select: 'name _id' },
      { path: 'task', select: 'name _id' },
      { path: 'team', select: 'name _id' }
    ]);

    // ✅ Cập nhật tiến độ task theo report mới nhất (không cần so sánh với report trước)
    task.progress = progress;
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


// xem chi tiêt task
const viewTask = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    // Lấy task và populate project + team
    const task = await Task.findOne({ _id: id, assignedMember: userId })
      .populate({
        path: 'projectId',
        select: 'name assignedTeam',
        populate: {
          path: 'assignedTeam',
          select: 'name'
        }
      })
      .lean();

    if (!task) {
      return res.status(404).json({ message: "Task không tồn tại hoặc bạn không có quyền truy cập." });
    }

    // Kiểm tra project và team hợp lệ
    if (!task.projectId || !task.projectId.assignedTeam) {
      return res.status(400).json({ message: "Task không còn hợp lệ (project/team đã bị xoá hoặc huỷ liên kết)." });
    }

    // Trả về task với thời gian Việt Nam
    const assignedAtVN = task.assignedAt
      ? new Date(task.assignedAt.getTime() + 7 * 60 * 60 * 1000)
        .toISOString()
        .replace('T', ' ')
        .slice(0, 19)
      : null;

    res.status(200).json({
      message: "Lấy chi tiết task thành công.",
      task: {
        _id: task._id,
        name: task.name,
        description: task.description,
        status: task.status,
        priority: task.priority,
        deadline: task.deadline,
        assignedAt: assignedAtVN,
        project: {
          _id: task.projectId._id,
          name: task.projectId.name,
          team: {
            _id: task.projectId.assignedTeam._id,
            name: task.projectId.assignedTeam.name
          }
        }
      }
    });
  } catch (error) {
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

const showAllFeedbackTask = async (req, res) => {
  try {
    const { id } = req.params; // taskId
    const userId = req.user._id;

    // Kiểm tra taskId hợp lệ
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "taskId không hợp lệ." });
    }

    // Kiểm tra task tồn tại và user có quyền truy cập
    const task = await Task.findOne({ _id: id, assignedMember: userId });
    if (!task) {
      return res.status(404).json({
        message: "Task không tồn tại hoặc bạn không có quyền truy cập."
      });
    }

    // Lấy các report của task, có feedback
    const reports = await Report.find({ task: id })
      .populate({
        path: 'feedback',
        model: 'Feedback'
      })
      .populate({
        path: 'task',
        select: 'name'
      })
      .sort({ createdAt: -1 })
      .lean();

    // Kiểm tra reports có phải là mảng không
    if (!Array.isArray(reports)) {
      console.error("Reports is not an array:", reports);
      return res.status(500).json({ message: "Dữ liệu báo cáo không hợp lệ." });
    }

    // Lọc các report có feedback
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

    if (feedbacks.length === 0) {
      return res.status(404).json({ message: "Không có phản hồi nào cho task này." });
    }

    res.status(200).json({
      message: "Lấy danh sách phản hồi cho task thành công.",
      feedbacks
    });

  } catch (error) {
    console.error("showAllFeedbackTask error:", error);
    res.status(500).json({ message: "Lỗi server.", error: error.message });
  }
};

const getReportTask = async (req, res) => {
  try {
    const { id } = req.params; // taskId
    const userId = req.user._id;

    // Kiểm tra taskId hợp lệ
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "taskId không hợp lệ." });
    }

    // Kiểm tra task tồn tại và user có quyền truy cập
    const task = await Task.findOne({ _id: id, assignedMember: userId });
    if (!task) {
      return res.status(404).json({ 
        message: "Task không tồn tại hoặc bạn không có quyền truy cập." 
      });
    }

    // Lấy các báo cáo của task do user tạo
    const reports = await Report.find({ task: id, assignedMembers: userId })
      .populate({
        path: 'task',
        select: 'name'
      })
      .populate({
        path: 'team',
        select: 'name'
      })
      .populate({
        path: 'assignedLeader',
        select: 'name'
      })
      .sort({ createdAt: -1 })
      .lean();

    // Kiểm tra reports có phải là mảng không
    if (!Array.isArray(reports)) {
      console.error("Reports is not an array:", reports);
      return res.status(500).json({ message: "Dữ liệu báo cáo không hợp lệ." });
    }

    // Định dạng danh sách báo cáo
    const formattedReports = reports.map(report => ({
      reportId: report._id,
      task: {
        taskId: report.task?._id || null,
        taskName: report.task?.name || 'Không rõ'
      },
      team: {
        teamId: report.team?._id || null,
        teamName: report.team?.name || 'Không rõ'
      },
      assignedLeader: {
        leaderId: report.assignedLeader?._id || null,
        leaderName: report.assignedLeader?.name || 'Không rõ'
      },
      content: report.content,
      taskProgress: report.taskProgress,
      difficulties: report.difficulties,
      file: report.file || null,
      createdAt: report.createdAt
    }));

    if (formattedReports.length === 0) {
      return res.status(404).json({ message: "Bạn chưa tạo báo cáo nào cho task này." });
    }

    res.status(200).json({
      message: "Lấy danh sách báo cáo cho task thành công.",
      reports: formattedReports
    });

  } catch (error) {
    console.error("getReportTask error:", error);
    res.status(500).json({ message: "Lỗi server.", error: error.message });
  }
};

const getMemberStatistics = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id);

    // 1. Tìm tất cả team mà user là thành viên
    const teams = await Team.find({ assignedMembers: userId }).select('_id name');
    if (!teams || teams.length === 0) {
      return res.status(404).json({ message: "Bạn không tham gia team nào." });
    }

    const teamIds = teams.map(team => team._id);

    // 2. Tìm tất cả project thuộc các team này
    const projects = await Project.find({ assignedTeam: { $in: teamIds } }).select('_id name');
    const projectIds = projects.map(project => project._id);

    if (projectIds.length === 0) {
      return res.status(200).json({
        message: "Không có project nào thuộc team của bạn.",
        statistics: {
          taskStatus: {},
          reportStats: { total: 0, evaluated: 0, unevaluated: 0 },
          feedbackStats: { total: 0, averageScore: 0 },
          projectTaskCount: [],
          chartData: {
            taskStatus: { labels: [], datasets: [] },
            reportStats: { labels: [], datasets: [] },
            projectTaskCount: { labels: [], datasets: [] }
          }
        }
      });
    }

    // 3. Aggregation pipelines cho thống kê
    // Thống kê số lượng task theo trạng thái
    const taskStatusStats = await Task.aggregate([
      { $match: { assignedMember: userId, projectId: { $in: projectIds } } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          status: '$_id',
          count: 1,
          _id: 0
        }
      }
    ]);

    // Thống kê báo cáo đã và chưa được đánh giá
    const reportStats = await Report.aggregate([
      { $match: { assignedMembers: userId, team: { $in: teamIds } } },
      {
        $facet: {
          evaluated: [
            { $match: { feedback: { $ne: null } } },
            { $count: 'count' }
          ],
          unevaluated: [
            { $match: { feedback: null } },
            { $count: 'count' }
          ],
          total: [
            { $count: 'count' }
          ]
        }
      },
      {
        $project: {
          total: { $arrayElemAt: ['$total.count', 0] },
          evaluated: { $arrayElemAt: ['$evaluated.count', 0] },
          unevaluated: { $arrayElemAt: ['$unevaluated.count', 0] }
        }
      }
    ]);

    // Thống kê feedback
    const feedbackStats = await Report.aggregate([
      { $match: { assignedMembers: userId, team: { $in: teamIds }, feedback: { $ne: null } } },
      {
        $lookup: {
          from: 'feedbacks',
          localField: 'feedback',
          foreignField: '_id',
          as: 'feedback'
        }
      },
      { $unwind: '$feedback' },
      {
        $group: {
          _id: null,
          averageScore: { $avg: '$feedback.score' },
          totalFeedbacks: { $sum: 1 }
        }
      },
      {
        $project: {
          averageScore: { $round: ['$averageScore', 2] },
          totalFeedbacks: 1,
          _id: 0
        }
      }
    ]);

    // Thống kê số lượng task trong mỗi project
    const projectTaskCount = await Task.aggregate([
      { $match: { assignedMember: userId, projectId: { $in: projectIds } } },
      {
        $group: {
          _id: '$projectId',
          taskCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'projects',
          localField: '_id',
          foreignField: '_id',
          as: 'project'
        }
      },
      { $unwind: '$project' },
      {
        $project: {
          projectId: '$_id',
          projectName: '$project.name',
          taskCount: 1,
          _id: 0
        }
      }
    ]);

    // Định dạng dữ liệu thống kê taskStatus
    const taskStatusFormatted = taskStatusStats.reduce((acc, stat) => {
      acc[stat.status] = stat.count;
      return acc;
    }, { pending: 0, in_progress: 0, completed: 0, cancelled: 0 });

    // Tạo cấu hình Chart.js
    const chartData = {
      taskStatus: {
        type: 'pie',
        data: {
          labels: ['Pending', 'In Progress', 'Completed', 'Cancelled'],
          datasets: [{
            label: 'Task Status',
            data: [
              taskStatusFormatted.pending,
              taskStatusFormatted.in_progress,
              taskStatusFormatted.completed,
              taskStatusFormatted.cancelled
            ],
            backgroundColor: ['#FF6384', '#36A2EB', '#4BC0C0', '#FFCE56'],
            borderColor: ['#FF6384', '#36A2EB', '#4BC0C0', '#FFCE56'],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: 'top' },
            title: { display: true, text: 'Phân bố trạng thái task' }
          }
        }
      },
      reportStats: {
        type: 'pie',
        data: {
          labels: ['Evaluated', 'Unevaluated'],
          datasets: [{
            label: 'Report Status',
            data: [
              reportStats[0]?.evaluated || 0,
              reportStats[0]?.unevaluated || 0
            ],
            backgroundColor: ['#36A2EB', '#FF6384'],
            borderColor: ['#36A2EB', '#FF6384'],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: 'top' },
            title: { display: true, text: 'Trạng thái đánh giá báo cáo' }
          }
        }
      },
      projectTaskCount: {
        type: 'bar',
        data: {
          labels: projectTaskCount.map(project => project.projectName),
          datasets: [{
            label: 'Số lượng task',
            data: projectTaskCount.map(project => project.taskCount),
            backgroundColor: ['#36A2EB', '#FF6384', '#FFCE56', '#4BC0C0', '#9966FF'],
            borderColor: ['#36A2EB', '#FF6384', '#FFCE56', '#4BC0C0', '#9966FF'],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: 'top' },
            title: { display: true, text: 'Số lượng task trong mỗi project' }
          },
          scales: {
            y: { beginAtZero: true, title: { display: true, text: 'Số task' } },
            x: { title: { display: true, text: 'Project' } }
          }
        }
      }
    };

    // 4. Trả về kết quả thống kê
    res.status(200).json({
      message: "Thống kê thành công.",
      statistics: {
        taskStatus: taskStatusFormatted,
        reportStats: {
          total: reportStats[0]?.total || 0,
          evaluated: reportStats[0]?.evaluated || 0,
          unevaluated: reportStats[0]?.unevaluated || 0
        },
        feedbackStats: {
          total: feedbackStats[0]?.totalFeedbacks || 0,
          averageScore: feedbackStats[0]?.averageScore || 0
        },
        projectTaskCount,
        chartData
      }
    });

  } catch (error) {
    console.error("Lỗi trong getMemberStatistics:", error);
    res.status(500).json({ message: "Lỗi server.", error: error.message });
  }
};

module.exports = {
  getMyTeam,
  getMyTasks,
  createReport,
  showAllFeedback,
  updateTaskStatus,
  viewTeam,
  viewTask,
  showAllFeedbackTask,
  getReportTask,
  getMemberStatistics
};

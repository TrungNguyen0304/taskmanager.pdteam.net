const User = require("../models/user");
const Team = require("../models/team");
const Project = require("../models/project")
const { sendNotification } = require("../utils/firebase-admin");
const { getIO, getSocketIdByUserId, isUserOnline } = require("../socket/socketHandler");
const Notification = require("../models/notification")
// thông báo được mời vào taem
const notifyTeam = async ({ userId, team }) => {
  const io = getIO();
  const title = "Bạn đã được thêm vào nhóm";
  const message = `Bạn được thêm vào nhóm: ${team.name}`;
  const userIdStr = String(userId);

  try {
    // Lưu thông báo vào MongoDB
    await saveNotification({
      userId: userIdStr,
      title,
      message,
      type: "info",
      source: "system",
    });

    if (isUserOnline(userIdStr)) {
      io.to(userIdStr).emit("team-assigned", {
        title,
        message,
        id: team._id,
        name: team.name,
      });
      console.log(`Sent socket to user room: ${userIdStr}`);
    } else {
      const user = await User.findById(userIdStr);
      if (user?.fcmToken) {
        await sendNotification(user.fcmToken, title, message);
        console.log(`Sent FCM to offline user with userId: ${userIdStr}`);
      } else {
        console.log("No FCM token for user.");
      }
    }
  } catch (error) {
    console.error(`Error in notifyTeam for user ${userIdStr}:`, error.message);
  }
};

// Thông báo gán project vào team
const notifyProject = async ({ userId, project }) => {
  const io = getIO();
  const title = "Có dự án mới";
  const message = `Bạn được giao: ${project.name}`;
  const userIdStr = String(userId);

  try {
    // Lưu thông báo vào MongoDB
    await saveNotification({
      userId: userIdStr,
      title,
      message,
      type: "info",
      source: "system",
    });

    if (isUserOnline(userIdStr)) {
      io.to(userIdStr).emit("project-assigned", {
        title,
        message,
        id: project._id,
        name: project.name,
        description: project.description,
        deadline: project.deadline,
        status: project.status,
      });
      console.log(`Sent socket to user room: ${userIdStr}`);
    } else {
      const user = await User.findById(userIdStr);
      if (user?.fcmToken) {
        await sendNotification(user.fcmToken, title, message);
        console.log(`Sent FCM to offline user with userId: ${userIdStr}`);
      } else {
        console.log("No FCM token for user.");
      }
    }
  } catch (error) {
    console.error(`Error in notifyProject for user ${userIdStr}:`, error.message);
  }
};

// Thông báo thu hồi dự án
const notifyProjectRemoval = async ({ userId, project }) => {
  const io = getIO();
  const title = "Dự án đã bị thu hồi";
  const message = `Thu hồi dự án: ${project.name}`;
  const userIdStr = String(userId);

  try {
    // Lưu thông báo vào MongoDB
    await saveNotification({
      title,
      message,
      userId: userIdStr,
      title,
      message,
      type: "warning",
      source: "system",
    });

    if (isUserOnline(userIdStr)) {
      io.to(userIdStr).emit("project-removed", {
        title,
        message,
        id: project._id,
        name: project.name,
      });
      console.log(`Sent socket (project-removed) to user room: ${userIdStr}`);
    } else {
      const user = await User.findById(userIdStr);
      if (user?.fcmToken) {
        await sendNotification(user.fcmToken, title, message);
        console.log(`Sent FCM (project removal) to userId: ${userIdStr}`);
      } else {
        console.log("No FCM token for user.");
      }
    }
  } catch (error) {
    console.error(`Error in notifyProjectRemoval for user ${userIdStr}:`, error.message);
  }
};

// Thông báo cho member được gán task
const notifyTask = async ({ userId, task }) => {
  const io = getIO();
  const title = "Bạn mới được giao task";
  const message = `Nhiệm vụ của bạn: ${task.name}`;
  const userIdStr = String(userId);

  try {
    // Lưu thông báo vào MongoDB
    await saveNotification({
      userId: userIdStr,
      title,
      message,
      type: "task",
      source: "system",
    });

    if (isUserOnline(userIdStr)) {
      io.to(userIdStr).emit("task-assigned", {
        title,
        message,
        id: task._id,
        name: task.name,
      });
      console.log(`Sent socket to user room: ${userIdStr}`);
    } else {
      const user = await User.findById(userIdStr);
      if (user?.fcmToken) {
        await sendNotification(user.fcmToken, title, message);
        console.log(`Sent FCM to offline user with userId: ${userIdStr}`);
      } else {
        console.log("No FCM token for user.");
      }
    }
  } catch (error) {
    console.error(`Error in notifyTask for user ${userIdStr}:`, error.message);
  }
};

// Thông báo thu hồi task
const notifyTaskRemoval = async ({ userId, task }) => {
  const io = getIO();
  const title = "Nhiệm vụ đã bị thu hồi";
  const message = `Thu hồi nhiệm vụ: ${task.name}`;
  const userIdStr = String(userId);

  try {
    // Lưu thông báo vào MongoDB
    await saveNotification({
      title,
      message,
      userId: userIdStr,
      title,
      message,
      type: "warning",
      source: "system",
    });

    if (isUserOnline(userIdStr)) {
      io.to(userIdStr).emit("task-removed", {
        title,
        message,
        id: task._id,
        name: task.name,
      });
      console.log(`Sent socket (task-removed) to user room: ${userIdStr}`);
    } else {
      const user = await User.findById(userIdStr);
      if (user?.fcmToken) {
        await sendNotification(user.fcmToken, title, message);
        console.log(`Sent FCM (task removal) to userId: ${userIdStr}`);
      } else {
        console.log("No FCM token for user.");
      }
    }
  } catch (error) {
    console.error(`Error in notifyTaskRemoval for user ${userIdStr}:`, error.message);
  }
};

// Thông báo khi member gửi báo cáo
const notifyReport = async ({ userId, task, report, member }) => {
  const io = getIO();
  const title = "Báo cáo công việc mới";
  const message = `Thành viên ${member} đã gửi báo cáo cho task: ${task.name}`;
  const userIdStr = String(userId);

  try {
    // Lưu thông báo vào MongoDB
    await saveNotification({
      title,
      message,
      userId: userIdStr,
      title,
      message,
      type: "info",
      source: "system",
    });

    if (isUserOnline(userIdStr)) {
      io.to(userIdStr).emit("report-submitted", {
        title,
        message,
        reportId: report._id,
        taskId: task._id,
        taskName: task.name,
        member,
        submittedAt: report.createdAt,
      });
      console.log(`Sent socket to leader room: ${userIdStr}`);
    } else {
      const user = await User.findById(userIdStr);
      if (user?.fcmToken) {
        await sendNotification(user.fcmToken, title, message);
        console.log(`Sent FCM to offline leader with userId: ${userIdStr}`);
      } else {
        console.log("No FCM token for leader.");
      }
    }
  } catch (error) {
    console.error(`Error in notifyReport for user ${userIdStr}:`, error.message);
  }
};

// Thông báo khi leader đánh giá báo cáo
const notifyEvaluateLeader = async ({ userId, feedback, report }) => {
  const io = getIO();
  const title = "Báo cáo của bạn đã được đánh giá";
  const message = `Bạn nhận được đánh giá: ${feedback.score}/10 - ${feedback.comment}`;
  const userIdStr = String(userId);

  try {
    // Lưu thông báo vào MongoDB
    await saveNotification({
      title,
      message,
      userId: userIdStr,
      title,
      message,
      type: "info",
      source: "system",
    });

    if (isUserOnline(userIdStr)) {
      io.to(userIdStr).emit("report-evaluated", {
        title,
        message,
        reportId: report._id,
        feedbackId: feedback._id,
        score: feedback.score,
        comment: feedback.comment,
        evaluatedAt: feedback.createdAt,
      });
      console.log(`Sent socket to member room: ${userIdStr}`);
    } else {
      const user = await User.findById(userIdStr);
      if (user?.fcmToken) {
        await sendNotification(user.fcmToken, title, message);
        console.log(`Sent FCM to offline member with userId: ${userIdStr}`);
      } else {
        console.log("No FCM token for member.");
      }
    }
  } catch (error) {
    console.error(`Error in notifyEvaluateLeader for user ${userIdStr}:`, error.message);
  }
};

// Thông báo khi member cập nhật trạng thái task
const notifyStatusTask = async ({ userId, task, member, oldStatus }) => {
  const io = getIO();
  const title = "Trạng thái nhiệm vụ";
  const message = `Thành viên ${member} đã thay đổi trạng thái từ ${oldStatus} thành ${task.status}`;
  const userIdStr = String(userId);

  try {
    // Lưu thông báo vào MongoDB
    await saveNotification({
      userId: userIdStr,
      title,
      message,
      type: "info",
      source: "system",
    });

    if (isUserOnline(userIdStr)) {
      io.to(userIdStr).emit("report-submitted", {
        title,
        message,
        taskId: task._id,
        taskName: task.name,
        taskStatus: task.status,
        member,
        oldStatus,
        submittedAt: new Date(),
      });
      console.log(`Sent socket to leader room: ${userIdStr}`);
    } else {
      const user = await User.findById(userIdStr);
      if (user?.fcmToken) {
        await sendNotification(user.fcmToken, title, message);
        console.log(`Sent FCM to offline leader with userId: ${userIdStr}`);
      } else {
        console.log("No FCM token for leader.");
      }
    }
  } catch (error) {
    console.error(`Error in notifyStatusTask for user ${userIdStr}:`, error.message);
  }
};

// Thông báo khi báo cáo cho công ty
const notifyReportCompany = async ({ userId, project, report, leader }) => {
  const io = getIO();
  const title = "Báo cáo công việc mới";
  const message = `Thành viên ${leader} đã gửi báo cáo cho project: ${project.name}`;
  const userIdStr = String(userId);

  try {
    // Lưu thông báo vào MongoDB
    await saveNotification({
      userId: userIdStr,
      title,
      message,
      type: "info",
      source: "system",
    });

    if (isUserOnline(userIdStr)) {
      io.to(userIdStr).emit("report-submitted", {
        title,
        message,
        reportId: report._id,
        projectId: project._id,
        projectName: project.name,
        leader,
        submittedAt: report.createdAt,
      });
      console.log(`Sent socket to leader room: ${userIdStr}`);
    } else {
      const user = await User.findById(userIdStr);
      if (user?.fcmToken) {
        await sendNotification(user.fcmToken, title, message);
        console.log(`Sent FCM to offline leader with userId: ${userIdStr}`);
      } else {
        console.log("No FCM token for leader.");
      }
    }
  } catch (error) {
    console.error(`Error in notifyReportCompany for user ${userIdStr}:`, error.message);
  }
};

// Thông báo khi công ty đánh giá báo cáo
const notifyEvaluateCompany = async ({ userId, feedback, report }) => {
  const io = getIO();
  const title = "Báo cáo của bạn đã được đánh giá";
  const message = `Bạn nhận được đánh giá: ${feedback.score}/10 - ${feedback.comment}`;
  const userIdStr = String(userId);

  try {
    // Lưu thông báo vào MongoDB
    await saveNotification({
      userId: userIdStr,
      title,
      message,
      type: "info",
      source: "system",
    });

    if (isUserOnline(userIdStr)) {
      io.to(userIdStr).emit("report-evaluated", {
        title,
        message,
        reportId: report._id,
        feedbackId: feedback._id,
        score: feedback.score,
        comment: feedback.comment,
        evaluatedAt: feedback.createdAt,
      });
      console.log(`Sent socket to member room: ${userIdStr}`);
    } else {
      const user = await User.findById(userIdStr);
      if (user?.fcmToken) {
        await sendNotification(user.fcmToken, title, message);
        console.log(`Sent FCM to offline member with userId: ${userIdStr}`);
      } else {
        console.log("No FCM token for member.");
      }
    }
  } catch (error) {
    console.error(`Error in notifyEvaluateCompany for user ${userIdStr}:`, error.message);
  }
};

// Thông báo khi task trễ deadline
const notifyTaskOverdue = async ({ userId, task }) => {
  const io = getIO();
  const title = "Task trễ deadline";
  const message = `Task "${task.name}" của bạn đã trễ deadline!`;
  const userIdStr = String(userId);

  try {
    // Lưu thông báo vào MongoDB
    await saveNotification({
      userId: userIdStr,
      title,
      message,
      type: "warning",
      source: "system",
    });

    if (isUserOnline(userIdStr)) {
      io.to(userIdStr).emit("task-overdue", {
        title,
        message,
        id: task._id,
        name: task.name,
        deadline: task.deadline,
        status: task.status,
        message,
      });
      console.log(`Sent socket notification to user: ${userIdStr}`);
    } else {
      const user = await User.findById(userIdStr);
      if (user?.fcmToken) {
        await sendNotification(user.fcmToken, title, message);
        console.log(`Sent FCM notification to offline user: ${userIdStr}`);
      } else {
        console.log(`No FCM token found for user: ${userIdStr}`);
      }
    }
  } catch (error) {
    console.error(`Error in notifyTaskOverdue for user ${userIdStr}:`, error.message);
  }
};

// Thông báo khi dự án trễ deadline
const notifyProjectOverdue = async ({ project }) => {
  const io = getIO();
  const title = "Dự án trễ hạn chót";
  const message = `Dự án "${project.name}" đã trễ hạn chót!`;

  try {
    const team = await Team.findById(project.assignedTeam);
    if (!team || !team.assignedLeader) {
      console.log(`Không tìm thấy Team hoặc leader cho dự án: ${project._id}`);
      return;
    }

    const leaderId = String(team.assignedLeader);
    if (!leaderId || leaderId === "null" || leaderId === "undefined") {
      console.log(`Không có leader hợp lệ để thông báo cho dự án: ${project._id}`);
      return;
    }

    // Lưu thông báo vào MongoDB
    await saveNotification({
      userId: leaderId,
      title,
      message,
      type: "warning",
      source: "system",
    });

    if (isUserOnline(leaderId)) {
      io.to(leaderId).emit("project-overdue", {
        title,
        message,
        id: project._id,
        name: project.name,
        deadline: project.deadline,
        status: project.status,
        message,
      });
      console.log(`Sent socket notification to leader: ${leaderId}`);
    } else {
      const user = await User.findById(leaderId);
      if (user?.fcmToken) {
        await sendNotification(user.fcmToken, title, message);
        console.log(`Sent FCM notification to offline leader: ${leaderId}`);
      } else {
        console.log(`No FCM token found for leader: ${leaderId}`);
      }
    }
  } catch (error) {
    console.error(`Error in notifyProjectOverdue for project ${project._id}:`, error.message);
  }
};

const saveNotification = async ({ userId, title, message, type, source }) => {
  try {
    const notif = new Notification({
      userId,
      title,
      message,
      type,
      source,
      timestamp: new Date(),
      isRead: false,
    });
    await notif.save();
    return notif;
  } catch (error) {
    console.error("Failed to save notification:", error);
    throw error; // để lỗi được bắt ở notifyProjectRemoval
  }
};

const getNotifications = async (req, res) => {
  const { userId } = req.params;
  const authenticatedUserId = req.user._id;

  if (userId !== authenticatedUserId) {
    return res.status(403).json({ error: 'Bạn không có quyền xem thông báo này' });
  }

  try {
    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50);
    res.status(200).json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error.message);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

// Đánh dấu thông báo đã đọc
const markNotificationAsRead = async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  try {
    const notification = await Notification.findById(id);

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    if (notification.userId.toString() !== userId) {
      return res.status(403).json({ error: 'Bạn không có quyền cập nhật thông báo này' });
    }

    notification.isRead = true;
    await notification.save();

    res.status(200).json(notification);
  } catch (error) {
    console.error('Error marking notification as read:', error.message);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
};

// Xóa thông báo
const deleteNotification = async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  try {
    const notification = await Notification.findById(id);

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    if (notification.userId.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'Bạn không có quyền xóa thông báo này' });
    }

    await Notification.findByIdAndDelete(id);

    res.status(200).json({ message: 'Xóa thành công' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
};

// thong bao khi tha doi trang thai project
const notifyStatusProject = async ({ project, oldStatus }) => {
  const io = getIO();
  const title = "Trạng thái dự án đã thay đổi";
  const message = `Công ty đã thay đổi trạng thái dự án "${project.name}" từ ${oldStatus} thành ${project.status}`;

  try {
    const team = await Team.findById(project.assignedTeam);
    if (!team || !team.assignedLeader) {
      console.log(`Không tìm thấy Team hoặc leader cho dự án: ${project._id}`);
      return;
    }

    const leaderId = String(team.assignedLeader);
    if (!leaderId || leaderId === "null" || leaderId === "undefined") {
      console.log(`Không có leader hợp lệ để thông báo cho dự án: ${project._id}`);
      return;
    }

    // Lưu thông báo vào MongoDB
    await saveNotification({
      userId: leaderId,
      title,
      message,
      type: "info",
      source: "system",
    });

    if (isUserOnline(leaderId)) {
      io.to(leaderId).emit("project-status-updated", {
        title,
        message,
        projectId: project._id,
        projectName: project.name,
        projectStatus: project.status,
        oldStatus,
        submittedAt: new Date(),
      });
      console.log(`Sent socket to leader room: ${leaderId}`);
    } else {
      const user = await User.findById(leaderId);
      if (user?.fcmToken) {
        await sendNotification(user.fcmToken, title, message);
        console.log(`Sent FCM to offline leader with userId: ${leaderId}`);
      } else {
        console.log("No FCM token for leader.");
      }
    }
  } catch (error) {
    console.error(`Error in notifyStatusProject for project ${project._id}:`, error.message);
  }
};


module.exports = {
  notifyTeam,
  notifyProject,
  notifyProjectRemoval,
  notifyTask,
  notifyTaskRemoval,
  notifyReport,
  notifyEvaluateLeader,
  notifyStatusTask,
  notifyReportCompany,
  notifyEvaluateCompany,
  notifyTaskOverdue,
  notifyProjectOverdue,
  getNotifications,
  deleteNotification,
  markNotificationAsRead,
  notifyStatusProject

};
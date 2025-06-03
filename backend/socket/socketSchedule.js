const cron = require("node-cron");
const { notifyTaskOverdue, notifyProjectOverdue} = require("../controller/notification");
const Task = require("../models/task");
const Project = require("../models/project")
function startScheduleCheck() {
    cron.schedule("* * * * *", async () => {
        console.log("Running cron job at", new Date());
        const now = new Date();

        try {
            const overdueTasks = await Task.find({
                status: { $ne: "completed" },
                isCompleted: 0,
                deadline: { $lt: now },
                isOverdueNotified: { $ne: 1 },
                assignedMember: { $ne: null }
            });
            for (const task of overdueTasks) {
                await notifyTaskOverdue({ userId: String(task.assignedMember), task });
                task.isOverdueNotified = 1;
                await task.save();
            }
            // Xử lý thông báo project quá hạn
            const overdueProjects = await Project.find({
                status: { $ne: "completed" }, 
                isCompleted: 0,
                deadline: { $lt: now }, 
                isOverdueNotified: { $ne: 1 }, 
                assignedTeam: { $ne: null } 
            });
            for (const project of overdueProjects) {
               await notifyProjectOverdue({ project });
                project.isOverdueNotified = 1;
                await project.save();
            }
        } catch (err) {
            console.error(" Error fetching overdue tasks:", err);
        }
    });
}

module.exports = { startScheduleCheck };
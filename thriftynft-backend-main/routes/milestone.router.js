module.exports = app => {
    const Milestone = require("../app/controllers/milestone.controller.js");
    app.get("/milestones", Milestone.getMilestones);
    app.post("/addMilestone", Milestone.addMilestone);
    app.put("/updateMilestone", Milestone.updateMilestone);
};
module.exports = app => {
    const Dispute = require("../app/controllers/dispute.controller.js");
    app.get("/disputes", Dispute.getDisputes);
    app.post("/addDispute", Dispute.addDispute);
    app.put("/updateDispute", Dispute.updateDispute);
};
module.exports = app => {
    const Log = require("../app/controllers/trading.controller.js");
    app.get("/getLogs", Log.getLogs);
    app.post("/addLog", Log.addLog);
    app.post("/updateLog", Log.updateLog);
    app.post("/deleteNFNTlog", Log.deleteNFNTlog);
  };
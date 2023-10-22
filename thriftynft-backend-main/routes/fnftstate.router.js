module.exports = app => {
    const FNFTstate = require("../app/controllers/fnftstate.controller.js");
    app.get("/getFNFTstate", FNFTstate.getFNFTstate);
    app.post("/UpdateFNFTstate", FNFTstate.updateFNFTstate);
    app.post("/AddFNFTstate", FNFTstate.addFNFTstate);
    app.post("/Booking", FNFTstate.Booking);
    app.post("/CancelFNFTstate", FNFTstate.cancelFNFTstate);
    app.get("/getFNFTPuchase", FNFTstate.getFNFTPuchase);
    app.get("/getFNFTList", FNFTstate.getFNFTList);
  };
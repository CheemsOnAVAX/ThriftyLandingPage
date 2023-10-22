module.exports = app => {
    const Auction = require("../app/controllers/auction.controller.js");
    app.post("/addAuctionList", Auction.addAuctionList);
    app.post("/cancelBid", Auction.cancelBid);
    app.get("/findMaxPrice", Auction.findMaxPrice);
  };
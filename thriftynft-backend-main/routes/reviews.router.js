module.exports = app => {
    const Collection = require("../app/controllers/reviews.controller.js");
    app.get("/reviews", Collection.getReviews);
    app.get("/getReviewsByMaker", Collection.getReviewsByMaker);
    app.post("/addReview", Collection.addReview);
    app.post("/feedbacks", Collection.addFeedback);
};
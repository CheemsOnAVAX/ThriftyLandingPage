const express = require('express');
const cors = require('cors');
require('dotenv').config();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const socket = require('socket.io');
const { without } = require('lodash');
var cookieParser = require('cookie-parser');

//var logger = require('morgan');
//const fileUpload = require('express-fileupload');
const app = express();
console.warn(process.env.MONGO_URL);
const setupSocket = require('./socket');

mongoose
  .connect(process.env.MONGO_URL, { useNewUrlParser: true })
  .then(() => {
    app.use(cors());

    app.use(bodyParser.json({ limit: '500mb' }));
    app.use(bodyParser.urlencoded({ limit: '500mb', extended: true }));

    app.use(bodyParser.json({ limit: '500mb' }));
    app.use(bodyParser.urlencoded({ limit: '500mb', extended: true }));

    app.get('/', (req, res) => {
      res.json({ message: 'Welcome to cheemsx-api application.' });
    });

    require('./routes/hash.routes.js')(app);
    require('./routes/user.router.js')(app);
    require('./routes/collection.router.js')(app);
    require('./routes/item.router.js')(app);
    require('./routes/putonsale.router.js')(app);
    require('./routes/tradingLog.router.js')(app);
    require('./routes/auction.router.js')(app);
    require('./routes/reviews.router.js')(app);
    require('./routes/question.router.js')(app);
    require('./routes/message.router.js')(app);
    require('./routes/dispute.router.js')(app);
    require('./routes/milestone.router.js')(app);
    require('./routes/fnftstate.router.js')(app);
    require('./routes/gift.router.js')(app);
    require('./routes/chatMessage.router.js')(app);
    require('./routes/conversation.router.js')(app);
    require('./routes/privateFile.router.js')(app);
    require('./routes/sampleImages.router.js')(app);
    require('./routes/category.router.js')(app);
    require('./routes/admin.router.js')(app);
    require('./routes/publicProfile.router.js')(app);
    require('./routes/activity.router.js')(app);
    require('./routes/store.router.js')(app);
    require('./routes/post.router')(app);
    require('./routes/socialPost.router')(app);
    require('./routes/follower.router')(app);
    require('./routes/socialChat.router')(app);

    const PORT = process.env.PORT || 8080;
    const server = app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}.`);
    });
    const io = setupSocket(server);
  })
  .catch((e) => {
    console.log(e);
    process.exit(0);
  });

// simple route

// set port, listen for requests

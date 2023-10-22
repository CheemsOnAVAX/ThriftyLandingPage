const io = require('../socket');
const User = require('../models/user');
async function sendSocketNotification(user = null, message, type = 'unknown') {
  try {
    const chatSocket = global.chatSocket;
    if (
      type === 'gift' ||
      type === 'buyPublicNft' ||
      type === 'bookNft' ||
      type === 'addAuction' ||
      type === 'addQuestionNft' ||
      type === 'addFeedbackNft' ||
      type === 'addAnswerNft' ||
      type === 'addedToWishlist' ||
      type === 'storeMemberJoinRequest' ||
      type === 'storeMemberJoinRequestApproved' ||
      type === 'importantServiceNft' ||
      type === 'claimGift' ||
      type === 'expiredGift'
    ) {
      const receiver = user;
      let userId;
      console.log(receiver.address);
      if (user.address) {
        const _user = await User.findOne({
          address: receiver.address.toLowerCase(),
        });
        userId = _user._id.toString();
      } else {
        console.log({ receiver });
        const socialValues = Object.values(receiver).map(
          (value) => new RegExp(`^${value}$`, 'i')
        );

        const _user = await User.findOne({
          $or: [
            { 'socials.facebook': { $in: socialValues } },
            { 'socials.twitter': { $in: socialValues } },
            { 'socials.email': { $in: socialValues } },
            { 'socials.reddit': { $in: socialValues } },
            // Add more fields as needed
          ],
        });
        userId = _user._id.toString();
      }
      console.log({ userId }, global.onlineUsers);
      const sendUserSocket = global.onlineUsers.get(userId);
      console.log({ sendUserSocket });
      if (sendUserSocket) {
        chatSocket.to(sendUserSocket).emit('notification', { message, type });
      }
    }

    if (type === 'newFeaturedNft') {
      const allOnlineUserVal = global.onlineUsers.values();
      for (let i = 0; i < global.onlineUsers.size; i++) {
        const socketId = allOnlineUserVal.next().value;
        console.log({ socketId });
        chatSocket.to(socketId).emit('notification', { message, type });
      }
    }
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
  sendSocketNotification,
};

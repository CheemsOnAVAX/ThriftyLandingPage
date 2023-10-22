const crypto = require('../../utils/crypto');
const Messages = require('../../models/chatMessage');
const Conversation = require('../../models/conversation');

exports.getChatMessages = async (req, res, next) => {
  try {
    const user = req.user;
    const { conversationId, page = 1, limit = 10 } = req.body;
    ///find by conversation id and decrypt message
    let data = await Messages.find({
      conversationId,
    })
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit || 0)
      .limit(limit || 10);
    data = data.map((item) => {
      const message = crypto.decrypt(item.message.text);
      item.message.text = message;
      const senderObj = Object.fromEntries(item.sender);
      const userSocialObj = Object.fromEntries(user.socials);
      const senderKey = Object.keys(senderObj)[0];
      const senderValue = senderObj[senderKey];

      if (
        senderObj[senderKey.toLowerCase()] ===
          userSocialObj[senderKey.toLowerCase()] ||
        senderObj[senderKey.toLowerCase()] === user.address.toLowerCase()
      ) {
        item.sender = {
          ...user,
        };
      }
      return item;
    });

    const count = await Messages.count({
      conversationId,
    });

    res.json({ data, count, currentPageNumber: page });
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: err.message });
  }
};

exports.addChatMessage = async (req, res, next) => {
  try {
    const { conversationId, message, user } = req.body;
    const data = await Messages.create({
      message: { text: crypto.encrypt(message) },
      conversationId,
      sender: user,
    });
    //update conversation id with updatedAt
    const updateConversation = await Conversation.findOneAndUpdate(
      { _id: conversationId },
      { updatedAt: Date.now() },
      { new: true }
    );

    if (data) return res.json({ data, updateConversation });
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: err.message });
  }
};

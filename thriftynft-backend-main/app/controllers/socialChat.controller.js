const SocialConversation = require('../../models/socialConversation');
const SocialChatMessage = require('../../models/socialChatMessage');
const User = require('../../models/user');
const crypto = require('../../utils/crypto');

exports.addSocialConversation = async (req, res, next) => {
  const user = req.user;
  const { participants, groupName } = req.body;
  let isGroupConversation = participants.length > 1 ? true : false;

  try {
    if (!isGroupConversation) {
      const hasConversation = await SocialConversation.findOne({
        participants: {
          $eq: [user._id, participants[0]],
        },
      });
      if (hasConversation) {
        //update updatedAt
        const updateConversation = await SocialConversation.findOneAndUpdate(
          { _id: hasConversation._id },
          { updatedAt: Date.now() }
        );
        return res.status(200).json({
          success: true,
          data: updateConversation,
        });
      } else {
        const conversation = await SocialConversation.create({
          participants: [user._id, participants[0]],
        });
        return res.status(200).json({
          success: true,
          data: conversation,
        });
      }
    } else {
      const conversation = await SocialConversation.create({
        participants: [...participants, user._id],
        isGroupConversation: true,
        groupName,
      });
      return res.status(200).json({
        success: true,
        data: conversation,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getConversation = async (req, res, next) => {
  const page = req.query.page || 1;
  const limit = req.query.limit || 10;
  const user = req.user;

  try {
    const conversations = await SocialConversation.find({
      participants: {
        $in: [user._id],
      },
    })
      //participants is array, populate it
      .populate('participants', 'name avatar _id')
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    const count = await SocialConversation.countDocuments({
      participants: {
        $in: [user._id],
      },
    });
    return res.status(200).json({
      success: true,
      data: conversations,
      count,
      currentPageNumber: page,
      hasNextPage: limit * page < count,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.addChatMessage = async (req, res, next) => {
  const user = req.user;
  const { conversationId, text } = req.body;
  try {
    const conversation = await SocialConversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found',
      });
    }
    const newMessage = await SocialChatMessage.create({
      conversationId,
      message: { text: crypto.encrypt(text) },
      sender: user._id,
    });
    const updateConversation = await SocialConversation.findOneAndUpdate(
      { _id: conversationId },
      { updatedAt: Date.now() },
      { new: true }
    );
    return res.status(200).json({
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getChatMessage = async (req, res, next) => {
  const { conversationId, page = 1, limit = 10 } = req.query;

  try {
    let messages = await SocialChatMessage.find({
      conversationId,
    })
      .populate('sender', 'name avatar _id')
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit || 0)
      .limit(limit || 10);

    messages = messages.map((item) => {
      const message = crypto.decrypt(item.message.text);
      item.message.text = message;
      return item;
    });
    const count = await SocialChatMessage.countDocuments({
      conversationId,
    });
    return res.status(200).json({
      success: true,
      data: messages,
      count,
      currentPageNumber: page,
      hasNextPage: limit * page < count,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

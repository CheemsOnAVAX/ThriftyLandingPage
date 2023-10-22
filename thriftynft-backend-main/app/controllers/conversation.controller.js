const { ObjectId } = require('mongodb');
const Conversation = require('../../models/conversation');
const { default: axios } = require('axios');
const User = require('../../models/user');

exports.getConversation = async (req, res, next) => {
  try {
    const {
      limit = 10,
      page = 1,
      isGroupConversation = false,
      admin = false,
    } = req.body;
    const user = req.user;
    const socials = [];
    let conversation = {};
    const isHasValue = Object.keys(user.socials).length > 0;
    if (isHasValue) {
      const _socials = user.socials;
      const socialsObj = Object.fromEntries(_socials);
      for (const [key, value] of Object.entries(socialsObj)) {
        socials.push({ [key.toLowerCase()]: value.toLowerCase() });
      }
      socials.push({ address: user.address.toLowerCase() });
    }
    socials.push({ address: user.address.toLowerCase() });
    let query = {};
    query = {
      participants: {
        $elemMatch: {
          $in: socials,
        },
      },
    };

    if (admin) {
      const allAdmin = await User.find({
        accessLevel: 1,
        _id: { $ne: user._id },
      });
      const adminSocials = [];
      allAdmin.forEach((admin) => {
        adminSocials.push({ address: admin.address.toLowerCase() });
        const _socials = admin.socials;
        const socialsObj = Object.fromEntries(_socials);
        for (const [key, value] of Object.entries(socialsObj)) {
          adminSocials.push({ [key.toLowerCase()]: value.toLowerCase() });
        }
      });

      query = {
        $and: [
          {
            participants: {
              $elemMatch: {
                $in: socials,
              },
            },
          },
          {
            participants: {
              $elemMatch: {
                $in: adminSocials,
              },
            },
          },
        ],
      };
    }
    const data = await Conversation.find(query)
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit || 0)
      .limit(limit || 10);
    const count = await Conversation.countDocuments(query);
    conversation.data = data;
    conversation.count = count;
    conversation.currentPageNumber = page;
    res.json(conversation);
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: err.message });
  }
};

//retrieve last 10 unique conversations with different users

function convertObjectToLowercase(obj) {
  const convertedObj = {};

  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      const lowercaseKey = key.toLowerCase();
      const lowercaseValue =
        typeof obj[key] === 'string' ? obj[key].toLowerCase() : obj[key];
      convertedObj[lowercaseKey] = lowercaseValue;
    }
  }

  return convertedObj;
}

exports.addConversation = async (req, res, next) => {
  try {
    let { from, to, isGroupConversation = false } = req.body;
    if (!from || !to) return res.json({ msg: 'Invalid data' });
    const _from = convertObjectToLowercase(from);
    const _to = convertObjectToLowercase(to);
    const user = req.user;
    if (user.socials.length > 0) {
      const socials = user.socials;
      const type = _from.split(':')[0];
      const value = _from.split(':')[1];
      if (socials[type] !== value) return res.json({ msg: 'Unauthorized' });
    }
    const hasConversation = await Conversation.findOne({
      participants: { $eq: [_from, _to] },
      isGroupConversation,
    });
    if (hasConversation) {
      //update conversation id with updatedAt
      const updateConversation = await Conversation.findOneAndUpdate(
        { _id: hasConversation._id },
        { updatedAt: Date.now() }
      );
      if (updateConversation)
        return res.json({ conversation: updateConversation });
    } else {
      const conversation = await Conversation.create({
        participants: [_from, _to],
      });
      if (conversation) return res.json({ conversation });
    }

    // else return res.json({ msg: 'Failed to add message to the database' });
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: err.message });
  }
};

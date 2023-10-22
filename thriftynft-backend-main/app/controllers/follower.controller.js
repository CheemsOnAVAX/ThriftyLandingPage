const Follower = require('../../models/Follower.js');
const User = require('../../models/user.js');

exports.sendFriendRequest = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = req.user;
    let follower = await Follower.findOne({
      userId: userId,
    });
    let follower2 = await Follower.findOne({
      userId: user._id,
    });
    if (!follower) {
      follower = new Follower({
        userId: userId,
        requestList: [user._id],
      });
    } else {
      if (follower.requestList.includes(userId)) {
        return res.status(400).json({ message: 'Request already sent' });
      }
      if (follower.friendList.includes(userId)) {
        return res.status(400).json({ message: 'Already friends' });
      }
      if (follower.requestList.length > 0) {
        follower.requestList.push(user._id);
      } else {
        follower.requestList = [user._id];
      }
    }

    if (!follower2) {
      follower2 = new Follower({
        userId: user._id,
        sentRequestList: [userId],
      });
    } else {
      follower2.sentRequestList.push(userId);
    }
    await follower.save();
    await follower2.save();
    return res.status(200).json({ message: 'Request sent successfully' });
  } catch (error) {
    console.log(error, 'sendFriendRequest');
    return res.status(500).json({ message: error.message });
  }
};

exports.acceptFriendRequest = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = req.user;
    const follower = await Follower.findOne({
      userId: user._id,
    });

    const follower2 = await Follower.findOne({
      userId: userId,
    });

    if (!follower) {
      return res.status(400).json({ message: 'No request found' });
    }
    if (!follower?.requestList?.includes(userId)) {
      return res.status(400).json({ message: 'No request found' });
    }
    if (follower?.friendList?.includes(userId)) {
      return res.status(400).json({ message: 'Already friends' });
    }
    follower.requestList = follower.requestList.filter(
      (id) => id.toString() !== userId.toString()
    );
    follower2.sentRequestList = follower2.sentRequestList.filter(
      (id) => id.toString() !== user._id.toString()
    );
    follower2.friendList.push(user._id);
    await follower2.save();
    follower.friendList.push(userId);
    await follower.save();
    return res.status(200).json({ message: 'Request accepted successfully' });
  } catch (error) {
    console.log(error, 'acceptFriendRequest');
    return res.status(500).json({ message: error.message });
  }
};

exports.cancelFriendRequest = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = req.user;
    const follower = await Follower.findOne({
      userId: user._id,
    });

    const follower2 = await Follower.findOne({
      userId: userId,
    });

    if (!follower) {
      return res.status(400).json({ message: 'No request found' });
    }
    if (!follower.requestList.includes(userId)) {
      return res.status(400).json({ message: 'No request found' });
    }
    follower.requestList = follower.requestList.filter(
      (id) => id.toString() !== userId.toString()
    );
    follower2.sentRequestList = follower2.sentRequestList.filter(
      (id) => id.toString() !== user._id.toString()
    );
    await follower2.save();
    await follower.save();
    return res.status(200).json({ message: 'Request cancelled successfully' });
  } catch (error) {
    console.log(error, 'cancelFriendRequest');
    return res.status(500).json({ message: error.message });
  }
};

exports.getRequestList = async (req, res) => {
  const page = req.query.page || 1;
  const limit = req.query.limit || 20;

  try {
    const user = req.user;
    const follower = await Follower.findOne({
      userId: user._id,
    })
      .populate({
        path: 'requestList',
        select: 'name userRealName avatar address',
        options: {
          limit,
          skip: (page - 1) * limit,
        },
      })
      .lean();

    if (!follower) {
      return res.status(400).json({ message: 'No request found' });
    }
    const total = await Follower.countDocuments({
      userId: user._id,
    });
    return res.status(200).json({ total, page, data: follower.requestList });
  } catch (error) {
    console.log(error, 'getRequestList');
    return res.status(500).json({ message: error.message });
  }
};

exports.getFriendList = async (req, res) => {
  const page = req.query.page || 1;
  const limit = req.query.limit || 20;

  try {
    const user = req.user;
    const follower = await Follower.findOne({
      userId: user._id,
    })
      .populate({
        path: 'friendList',
        select: 'name userRealName avatar address',
        options: {
          limit,
          skip: (page - 1) * limit,
        },
      })
      .lean();

    if (!follower) {
      return res.status(400).json({ message: 'No friends found' });
    }
    const total = await Follower.countDocuments({
      userId: user._id,
    });
    return res.status(200).json({ total, page, data: follower.friendList });
  } catch (error) {
    console.log(error, 'getFriendList');
    return res.status(500).json({ message: error.message });
  }
};

exports.getSuggestedFriends = async (req, res) => {
  const page = req.query.page || 1;
  const limit = req.query.limit || 20;

  try {
    const user = req.user;
    const follower = await Follower.findOne({
      userId: user._id,
    }).lean();

    if (!follower) {
      const users = await User.find({
        _id: { $ne: user._id },
      })
        .select('name userRealName avatar address')
        .limit(limit)
        .skip((page - 1) * limit)
        .lean();
      const total = await User.countDocuments();
      return res.status(200).json({ total, page, data: users });
    }
    const friendList = follower.friendList;
    const requestList = follower.requestList;
    const ignoreList = follower.suggestionIgnoreList;
    const sentRequestList = follower.sentRequestList;
    const all = [
      ...friendList,
      ...requestList,
      user._id,
      ...ignoreList,
      ...sentRequestList,
    ];
    const users = await User.find({
      _id: { $nin: all },
    })
      .select('name userRealName avatar address')
      .limit(limit)
      .skip((page - 1) * limit)
      .lean();
    const total = await User.countDocuments({
      _id: { $nin: all },
    });
    return res.status(200).json({ total, page, data: users });
  } catch (error) {
    console.log(error, 'getSuggestedFriends');
    return res.status(500).json({ message: error.message });
  }
};

exports.addToSuggestionIgnoreList = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = req.user;
    const follower = await Follower.findOne({
      userId: user._id,
    });

    if (!follower) {
      const ignoreList = new Follower({
        userId: user._id,
        suggestionIgnoreList: [userId],
      });
      await ignoreList.save();
      return res.status(200).json({ message: 'Added to ignore list' });
    }
    if (follower.suggestionIgnoreList.includes(userId)) {
      return res.status(400).json({ message: 'Already ignored' });
    }
    follower.suggestionIgnoreList.push(userId);
    await follower.save();
    return res.status(200).json({ message: 'Added to ignore list' });
  } catch (error) {
    console.log(error, 'addToSuggestionIgnoreList');
    return res.status(500).json({ message: error.message });
  }
};

exports.unfriend = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = req.user;
    const follower = await Follower.findOne({
      userId: user._id,
    });

    const follower2 = await Follower.findOne({
      userId: userId,
    });

    if (!follower) {
      return res.status(400).json({ message: 'No friend found' });
    }
    if (!follower.friendList.includes(userId)) {
      return res.status(400).json({ message: 'No friend found' });
    }
    follower.friendList = follower.friendList.filter(
      (id) => id.toString() !== userId.toString()
    );
    follower2.friendList = follower2.friendList.filter(
      (id) => id.toString() !== user._id.toString()
    );
    await follower2.save();
    await follower.save();
    return res.status(200).json({ message: 'Unfriended successfully' });
  } catch (error) {
    console.log(error, 'unfriend');
    return res.status(500).json({ message: error.message });
  }
};

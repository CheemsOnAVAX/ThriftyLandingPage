const crypto = require('../../utils/crypto');
const Activity = require('../../models/Activity.js');
const User = require('../../models/user');
const {
  sendSocketNotification,
} = require('../../utils/sendSocketNotification');

const handleAddActivity = async (obj, user) => {
  const receiver = obj.receiver;
  try {
    if (receiver) {
      let receiverUser;
      if (receiver.address) {
        receiverUser = await User.findOne({
          address: receiver.address.toLowerCase(),
        });
      } else {
        const socialValues = Object.values(receiver).map(
          (value) => new RegExp(`^${value}$`, 'i')
        );
        receiverUser = await User.findOne({
          $or: [
            { 'socials.facebook': { $in: socialValues } },
            { 'socials.twitter': { $in: socialValues } },
            { 'socials.email': { $in: socialValues } },
            { 'socials.reddit': { $in: socialValues } },
          ],
        });
      }
      if (receiverUser) {
        if (!receiverUser.notificationType.includes(obj.activityType)) {
          return true;
        }
      }
    }
  } catch (error) {
    console.log(error);
  }
  if (!user.notificationType.includes(obj.activityType)) {
    return true;
  }
  try {
    const result = await Activity.create({
      ...obj,
    });
    if (result) {
      const activities = {
        gift: 'Someone sent you a gift!',
        buyPublicNft: 'Someone bought your NFT',
        bookNft: 'Someone booked your NFT',
        addAuction: 'Someone added your NFT to auction',
        addQuestionNft: 'Someone Asked a question on your NFT',
        addFeedbackNft: `Someone ${
          obj?.feedbackType === 'positive' ? 'liked' : 'disliked'
        } your question`,
        addAnswerNft: 'Someone answered your question',
        addedToWishlist: `Someone ${
          obj?.isWishListed ? 'added' : 'removed'
        } your NFT ${obj?.isWishListed ? 'to' : 'from'} wishlist`,
        storeMemberJoinRequest: 'Someone request to join your store',
        storeMemberJoinRequestApproved: `Your request to join store has been ${
          obj?.store?.isStoreApproved ? 'approved' : 'rejected'
        }`,
        importantServiceNft:
          'You have important notification in your service dashboard!',
        claimGift: 'Someone claimed your gift card!',
        newFeaturedNft: 'New Featured NFT is live. Check this out.',
        expiredGift:
          'No one claimed your gift card! Please claim your fund back.',
      };

      if (obj.activityType in activities) {
        sendSocketNotification(
          obj?.receiver || null,
          activities[obj.activityType],
          obj.activityType
        );
      }
    }
    return true;
  } catch (e) {
    console.log(e);
    return true;
  }
};

exports.addActivity = async (req, res) => {
  try {
    const user = req.user;
    const obj = {
      ...req.body,
      createdBy: user._id,
    };
    const result = await handleAddActivity(obj, req.user);
    res
      .status(200)
      .send({ message: 'Activity added successfully', data: result });
  } catch (e) {
    console.log(e);
    res.status(500).send({ message: e || 'Something went wrong' });
  }
};

exports.getActivity = async (req, res) => {
  try {
    let activityType = req.query.activityType || 'all';
    const page = req.query.page || 1;
    const limit = req.query.limit || 5;
    const skip = (page - 1) * limit;
    const user = req.user;

    if (activityType === 'all') {
      activityType = null;
    }
    console.log({ activityType });
    const query = {
      $and: [
        activityType ? { activityType } : {},
        {
          $expr: {
            $or: [
              { $eq: ['$isAllReceiver', true] },
              {
                $and: [
                  { $isArray: ['$sender'] },
                  { $ne: ['$sender', null] },
                  {
                    $setIsSubset: [
                      {
                        $map: {
                          input: {
                            $objectToArray: { $ifNull: ['$sender', {}] },
                          },
                          as: 'senderItem',
                          in: { $toLower: '$$senderItem.v' },
                        },
                      },
                      {
                        $map: {
                          input: {
                            $objectToArray: { $ifNull: [user.socials, {}] },
                          },
                          as: 'userSocialsItem',
                          in: { $toLower: '$$userSocialsItem.v' },
                        },
                      },
                    ],
                  },
                ],
              },
              {
                $and: [
                  { $isArray: ['$receiver'] },
                  { $ne: ['$receiver', null] },
                  {
                    $setIsSubset: [
                      {
                        $map: {
                          input: {
                            $objectToArray: { $ifNull: ['$receiver', {}] },
                          },
                          as: 'receiverItem',
                          in: { $toLower: '$$receiverItem.v' },
                        },
                      },
                      {
                        $map: {
                          input: {
                            $objectToArray: { $ifNull: [user.socials, {}] },
                          },
                          as: 'userSocialsItem',
                          in: { $toLower: '$$userSocialsItem.v' },
                        },
                      },
                    ],
                  },
                ],
              },
              {
                $in: [
                  { $toLower: user.address },
                  {
                    $map: {
                      input: {
                        $objectToArray: { $ifNull: ['$receiver', {}] },
                      },
                      as: 'receiverItem',
                      in: { $toLower: '$$receiverItem.v' },
                    },
                  },
                ],
              },
              {
                $in: [
                  { $toLower: user.address },
                  {
                    $map: {
                      input: {
                        $objectToArray: { $ifNull: ['$sender', {}] },
                      },
                      as: 'senderItem',
                      in: { $toLower: '$$senderItem.v' },
                    },
                  },
                ],
              },
            ],
          },
        },
      ],
    };

    let result = await Activity.find(query)
      .populate('chatMessageId giftId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    //decrypted message
    result = result.map((item) => {
      if (item.chatMessageId) {
        const message = crypto.decrypt(item.chatMessageId.message.text);
        item.chatMessageId.message.text = message.toString();
      }
      return item;
    });
    const total = await Activity.countDocuments(query);
    res.status(200).send({
      message: 'Activity fetched successfully',
      data: result,
      total,
      page,
    });
  } catch (e) {
    console.log(e);
    res.status(500).send({ message: e || 'Something went wrong' });
  }
};

exports.activityRead = async (req, res) => {
  const user = req.user;
  try {
    const query = {
      isRead: false,
    };

    if (user.socials) {
      query.$or = [];
      query.$and = [];

      if (user.socials.facebook) {
        query.$or.push({ 'receiver.facebook': user.socials.facebook });
        query.$or.push({ 'receiver.facebook': user.socials.facebook });
      }
      if (user.socials.twitter) {
        query.$or.push({ 'receiver.twitter': user.socials.twitter });
      }
      if (user.socials.reddit) {
        query.$or.push({ 'receiver.reddit': user.socials.reddit });
      }
      if (user.socials.email) {
        query.$or.push({ 'receiver.email': user.socials.email });
      }
    }

    if (user.address) {
      query.$or.push({ 'receiver.address': user.address });
    }

    query.$or.push({ isAllReceiver: true });

    query.$and.push({ activityType: 'gift' });
    query.$and.push({ 'sender.address': user.address });
    query.$and.push({ isRead: false });
    if (user.socials.facebook) {
      query.$and.push({ 'receiver.facebook': user.socials.facebook });
    }
    if (user.socials.twitter) {
      query.$and.push({ 'receiver.twitter': user.socials.twitter });
    }
    if (user.socials.reddit) {
      query.$and.push({ 'receiver.reddit': user.socials.reddit });
    }
    if (user.socials.email) {
      query.$and.push({ 'receiver.email': user.socials.email });
    }

    const activity = await Activity.updateMany(query, { isRead: true });
    res.status(200).send({ message: 'Activity read successfully' });
  } catch (e) {
    console.log(e);
    res.status(500).send({ message: e || 'Something went wrong' });
  }
};

exports.handleAddActivity = handleAddActivity;

const GIFT = require('../../models/Gift');
const User = require('../../models/user');
const ethers = require('ethers');
const { Gift } = require('../../contract/address');
const GiftAbi = require('../../contract/GiftAbi.json');
const Activity = require('../../models/Activity');
const { handleAddActivity } = require('./activity.controller');
exports.addGift = async (req, res) => {
  const tokenID = req.body.tokenID;
  const sendsocial = req.body.sendsocial;
  const recvsocial = req.body.recvsocial;
  const maker = req.body.maker;
  const recipient = req.body.recipient;
  const expdate = req.body.expdate;
  const price = req.body.price;
  const coinType = req.body.coinType;
  const currentTime = new Date();
  const val = currentTime.toLocaleString();
  const createdate = val;
  const state = true;
  const sentFrom = req.body.sentFrom;
  // console.log('----addGift------', req.body);

  try {
    const result = await GIFT.findOneAndUpdate(
      {
        tokenID: tokenID,
        maker: maker,
      },
      {
        tokenID: tokenID,
        sendsocial: sendsocial,
        recvsocial: recvsocial,
        recipient: recipient,
        price: price,
        coinType: coinType,
        expdate: expdate,
        createdate: createdate,
        state: state,
        sentFrom: sentFrom,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.send(result);
  } catch (e) {
    res.status(500).send({ message: err || 'Something went wrong' });
  }
};

exports.updateGift = async (req, res) => {
  const tokenID = req.body.tokenID;
  try {
    const resOne = await GIFT.findOne({ tokenID: tokenID });
    resOne.state = false;
    const result = await resOne.save();
    res.send(result);
  } catch (e) {
    console.error('updateGift fail', e);
    res.status(500).send({ message: err || 'Something went wrong' });
  }
};

exports.getReceivedGift = async (req, res) => {
  const user = req.user;
  const page = req.query.page || 1;
  const limit = req.query.limit || 5;
  const currentTime = new Date();
  // console.log('getGift', user)
  try {
    // console.log(user.socials);
    const filter = {
      $or: [
        { recipient: user.address },
        {
          $expr: {
            $and: [
              { $ne: ['$recvsocial', {}] },
              {
                $setIsSubset: [
                  {
                    $map: {
                      input: { $objectToArray: '$recvsocial' },
                      as: 'recvsocialItem',
                      in: { $toLower: '$$recvsocialItem.v' },
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
        },
      ],
    };
    const result = await GIFT.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    const total = await GIFT.countDocuments(filter);
    for (var i = 0; i < result.length; i++) {
      const expdate = new Date(result[i]['createdAt']);
      if (currentTime - expdate > result[i]['expdate'] * 1000 * 24 * 3600) {
        result[i]['state'] = false;
        result[i]['expdate'] = -1;
      }
    }
    // console.log('result', result)
    res.status(200).send({
      data: result,
      total: total,
      page: page,
    });
  } catch (e) {
    console.log(e, 'getGift error');
    res.status(500).send({
      message: e || 'Something went wrong!',
    });
  }
};

exports.getSentGift = async (req, res) => {
  const user = req.user;
  const page = req.query.page || 1;
  const limit = req.query.limit || 5;
  const currentTime = new Date();
  // console.log('getGift', user)
  try {
    const filter = {
      $or: [
        { maker: user.address },
        {
          $expr: {
            $and: [
              { $ne: ['$recvsocial', {}] },
              {
                $map: {
                  input: { $objectToArray: '$sendsocial' },
                  as: 'sendsocialItem',
                  in: { $toLower: '$$sendsocialItem.v' },
                },
              },
              {
                $map: {
                  input: { $objectToArray: { $ifNull: [user.socials, {}] } },
                  as: 'userSocialsItem',
                  in: { $toLower: '$$userSocialsItem.v' },
                },
              },
            ],
          },
        },
      ],
    };
    const result = await GIFT.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    const total = await GIFT.countDocuments(filter);
    for (var i = 0; i < result.length; i++) {
      const expdate = new Date(result[i]['createdAt']);
      if (currentTime - expdate > result[i]['expdate'] * 1000 * 24 * 3600) {
        result[i]['state'] = false;
        result[i]['expdate'] = -1;
      }
    }
    // console.log('result', result)
    res.status(200).send({
      data: result,
      total: total,
      page: page,
    });
  } catch (e) {
    console.log(e, 'getGift error');
    res.status(500).send({
      message: e || 'Something went wrong!',
    });
  }
};

exports.getSocialGift = async (req, res) => {
  const tokenId = req.query.tokenId;

  const currentTime = new Date();
  // console.log('getGift', user)
  try {
    const result = await GIFT.find({ tokenID: tokenId });
    // console.log({ result });
    for (var i = 0; i < result.length; i++) {
      const expdate = new Date(result[i]['createdate']);
      if (currentTime - expdate > result[i]['expdate'] * 1000 * 24 * 3600) {
        result[i]['state'] = false;
        result[i]['expdate'] = -1;
      }
    }
    // console.log('result', result);
    res.send(result);
  } catch (e) {
    res.status(500).send({
      message: e || 'Something went wrong!',
    });
  }
};

exports.cancelGift = async (req, res) => {
  const tokenID = req.body.tokenID;
  try {
    const gift = await GIFT.findOne({ tokenID: tokenID });
    const result = await GIFT.findOneAndDelete({ tokenID: tokenID });
    const activity = await Activity.findOneAndDelete({
      giftId: gift._id,
    });
    res.send(result);
  } catch (e) {
    console.error('cancelFNFTstate fail', e);
    res.status(500).send({ message: err || 'Something went wrong' });
  }
};

exports.findAddressBySocial = async (req, res) => {
  const key = req.query.key;
  const value = req.query.social;
  // console.log('key = ', key, 'value = ', value);
  try {
    const result = await User.find({
      [`socials.${key}`]: { $regex: `\b${value}\b/i` },
    });
    res.send(result);
  } catch (e) {
    console.error('findAddressBySocial fail', e);
    res.status(500).send({ message: err || 'Something went wrong' });
  }
};

exports.claimGift = async (req, res) => {
  const address = req.userAddress;
  const tokenID = req.body.tokenID;
  const pattern = req.body.pattern || [];
  const social = req.body.social || [];
  try {
    const token = await GIFT.findOne({ tokenID: tokenID }).lean();
    const user = await User.findOne({ address: address }).lean();
    if (token.recipient)
      if (token.recipient !== address)
        return res
          .status(500)
          .send({ message: 'You are not the recipient of this gift' });
      else {
        const receiveSocial = token.recvsocial;
        const tokenSocialKey = Object.keys(receiveSocial);
        const tokenSocialValue = Object.values(receiveSocial);
        if (user.socials[tokenSocialKey[0]] !== tokenSocialValue[0])
          return res
            .status(500)
            .send({ message: 'You are not the recipient of this gift' });
      }
  } catch (error) {
    return res.status(500).send({ message: error || 'Something went wrong' });
  }

  var customHttpProvider = new ethers.providers.JsonRpcProvider(
    process.env.PROVIDER
  );
  const singer = new ethers.Wallet(
    process.env.GIFT_CARD_SECURE_PRIVATE_KEY,
    customHttpProvider
  );

  try {
    const giftfactory = new ethers.Contract(Gift, GiftAbi, singer);
    let tx = await giftfactory.claimGift(tokenID, pattern, social, address);
    tx = await tx.wait();
    res.status(200).send({ tx });
  } catch (e) {
    console.error('Claiming fail', e);
    res.status(500).send({ message: e || 'Something went wrong' });
  }
};

exports.checkExpiredGift = async (req, res, next) => {
  const user = req.user;
  const currentTime = new Date();
  // console.log('getGift', user)
  const filter = {
    $and: [
      {
        $or: [
          { maker: user.address },
          {
            $expr: {
              $and: [
                { $ne: ['$recvsocial', {}] },
                {
                  $map: {
                    input: { $objectToArray: '$sendsocial' },
                    as: 'sendsocialItem',
                    in: { $toLower: '$$sendsocialItem.v' },
                  },
                },
                {
                  $map: {
                    input: { $objectToArray: { $ifNull: [user.socials, {}] } },
                    as: 'userSocialsItem',
                    in: { $toLower: '$$userSocialsItem.v' },
                  },
                },
              ],
            },
          },
        ],
      },
      { state: true },
    ],
  };
  const gifts = await GIFT.find(filter);
  let expiredGift = undefined;
  for (var i = 0; i < gifts.length; i++) {
    const expdate = new Date(gifts[i]['createdAt']);
    //current time and expdate is in days

    const daysDiff = (currentTime - expdate) / (1000 * 24 * 3600);
    if (daysDiff > gifts[i]['expdate']) {
      expiredGift = gifts[i];
      break;
    }
  }
  if (expiredGift) {
    const activity = await Activity.findOne({
      tokenId: expiredGift.tokenID,
      activityType: 'expiredGift',
    });
    if (activity) {
      return res.status(200).send({ message: 'You have an expired gift' });
    } else {
      try {
        const obj = {
          activityType: 'expiredGift',
          receiver: { address: expiredGift.maker },
          tokenId: expiredGift.tokenID,
          giftId: expiredGift._id,
          giftAmount: expiredGift.price,
        };
        await handleAddActivity(obj, req.user);
        return res.status(200).send({ message: 'You have an expired gift' });
      } catch (error) {
        return res.status(200).send({ message: 'You have an expired gift' });
      }
    }
  }

  return res.status(200).send({ message: 'You have no expired gift' });
};

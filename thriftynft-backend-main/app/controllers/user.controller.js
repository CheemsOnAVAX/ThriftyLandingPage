const request = require('request');
const User = require('../../models/user');
const twitterConfig = require('../../utils/twitter-config');
const axios = require('axios');
const Conversation = require('../../models/conversation');
const socialNftAbi = require('../../utils/socialNftAbi');
const { v4: uuidv4 } = require('uuid');
const short = require('short-uuid');

const { ethers } = require('ethers');
const { encrypt, decrypt } = require('../../utils/crypto');
const {
  decryptWalletWithSigner,
  generateHashAndSignature,
} = require('../../utils/socialHelper');
const Web3Token = require('web3-token');
// Retrieve all Customers from the database.
exports.getUserInfo = async (req, res) => {
  const address = req.userAddress;
  if (!address) return res.status(400).send({ message: 'Address is required' });
  try {
    let user = await User.findOne({ address: address });
    if (!user) return res.status(400).send({ message: 'User not found' });

    user.lastActive = Date.now();
    await user.save();
    //console.log(result);
    user.password = '';
    user.encryptedJson = '';
    res.send(user);
  } catch (e) {
    //console.log('=something went wrong ', e);
    res.status(500).send({
      message: e || 'Something went wrong!',
    });
  }
};

exports.findUserBySocial = async (req, res) => {
  const _social = req.body.social;
  try {
    if (_social.address) {
      const user = await User.findOne({
        address: _social.address,
      });
      return res.status(200).send(user);
    } else {
      const socialValues = Object.values(_social).map(
        (value) => new RegExp(`^${value}$`, 'i')
      );

      const user = await User.findOne({
        $or: [
          { 'socials.facebook': { $in: socialValues } },
          { 'socials.twitter': { $in: socialValues } },
          { 'socials.email': { $in: socialValues } },
          { 'socials.reddit': { $in: socialValues } },
          // Add more fields as needed
        ],
      });
      user.password = '';
      user.encryptedJson = '';
      return res.status(200).send(user);
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: error || 'Something went wrong' });
  }
};

exports.getTopUserList = async (req, res) => {
  try {
    const result = await User.find({}).sort({ followers: -1 }).limit(10);
    //console.log('sorting==========================', result);
    res.send(result);
  } catch (e) {
    //console.log('=something went wrong ', e);
    res.status(500).send({ message: err || 'Something went wrong' });
  }
};

exports.RegisterUser = async (req, res) => {
  const address = req.userAddress;
  const referralToken = req.body.referralToken;
  if (!address) return res.status(400).send({ message: 'Address is required' });
  const name = req.body.name;
  const bio = req.body.bio;
  const avatar = req.body.avatar ? [req.body.avatar] : [];
  const defaultHandler = req.body.defaultHandler;
  const userRealName = req.body.userRealName;
  const gender = req.body.gender;
  const userBanner = req.body.userBanner ? [req.body.userBanner] : [];

  try {
    let user = await User.findOne({ address: address });
    if (!user && !referralToken)
      return res.status(404).send({ message: 'User not found!' });
    if (referralToken && !name)
      return res.status(400).send({ message: 'Name is required!' });

    if (!referralToken && user) {
      if (name) {
        //check unique name
        const findName = await User.findOne({ name: name.trim() });
        if (findName)
          return res.status(400).send({ message: 'Name already exist!' });
        user.name = name;
      }
      if (bio) user.bio = bio;
      if (avatar) user.avatar = avatar;
      if (defaultHandler) user.defaultHandler = defaultHandler;
      await user.save();
      return res.send(user);
    }
    if (referralToken && !user) {
      const referralUser = await User.findOne({ referralToken: referralToken });
      if (!referralUser)
        return res.status(404).send({ message: 'Referral user not found' });
      if (name) {
        //check unique name
        const findName = await User.findOne({ name: name.trim() });
        if (findName)
          return res.status(400).send({ message: 'Name already exist!' });
      }
      user = new User({
        address: address,
        name: name,
        bio: bio,
        avatar: avatar,
        defaultHandler: defaultHandler,
        referredBy: referralUser._id,
        userRealName,
        gender,
        userBanner,
      });
      await user.save();
      referralUser.referralCount = referralUser.referralCount + 1;
      await referralUser.save();
      return res.send(user);
    }
  } catch (e) {
    console.error('Create user fail', e);
    res.status(500).send({ message: e || 'Something went wrong' });
  }
};

exports.getTwitterAccessToken = async (req, res) => {
  try {
    request.post(
      {
        url: 'https://api.twitter.com/oauth/request_token',
        oauth: {
          oauth_callback: `${process.env.NEXT_PUBLIC_WEBSITE_URL}/profile`,
          consumer_key: twitterConfig.consumerKey,
          consumer_secret: twitterConfig.consumerSecret,
        },
      },
      function (err, r, body) {
        if (err) {
          return res.send(500, { message: err.message });
        }

        var jsonStr =
          '{ "' + body.replace(/&/g, '", "').replace(/=/g, '": "') + '"}';
        res.send(JSON.parse(jsonStr));
      }
    );
  } catch (error) {
    //console.log(error);
    res.status(500).send({ message: error || 'Something went wrong' });
  }
};

exports.twitterAuthVerifier = async (req, res, next) => {
  try {
    request.post(
      {
        url: `https://api.twitter.com/oauth/access_token?oauth_verifier`,
        oauth: {
          consumer_key: twitterConfig.consumerKey,
          consumer_secret: twitterConfig.consumerSecret,
          token: req.query.oauth_token,
        },
        form: { oauth_verifier: req.query.oauth_verifier },
      },
      function (err, r, body) {
        if (err) {
          return res.send(500, { message: err.message });
        }
        const bodyString =
          '{ "' + body.replace(/&/g, '", "').replace(/=/g, '": "') + '"}';
        const parsedBody = JSON.parse(bodyString);
        res.status(200).json({ parsedBody });
      }
    );
  } catch (error) {
    res.status(500).send({ message: error || 'Something went wrong' });
  }
};

exports.getRedditUser = async (req, res) => {
  try {
    const data = await axios.get('https://oauth.reddit.com/api/v1/me', {
      headers: {
        Authorization: `Bearer ${req.body.access_token}`,
        content_type: 'application/json',
      },
    });
    //console.log(data.data);
    res.status(200).json({ data: data.data });
  } catch (error) {
    //console.log(error);
    res.status(500).send({ message: error || 'Something went wrong' });
  }
};

exports.searchUser = async (req, res) => {
  const input_data = req.query.data;
  const page = req.query.page - 1 || 0;
  const limit = req.query.limit || 10;
  const userId = req.query._id;
  try {
    const data = await User.find({
      $or: [
        { name: { $regex: input_data, $options: 'i' } },
        { 'socials.email': { $regex: input_data, $options: 'i' } },
        { 'socials.reddit': { $regex: input_data, $options: 'i' } },
        { 'socials.twitter': { $regex: input_data, $options: 'i' } },
        { 'socials.facebook': { $regex: input_data, $options: 'i' } },
        { address: { $regex: input_data, $options: 'i' } },
      ],
    })
      .where({ _id: { $ne: userId } })
      .limit(limit)
      .skip(limit * page);
    const count = await User.countDocuments({
      $or: [
        { name: { $regex: input_data, $options: 'i' } },
        { 'socials.email': { $regex: input_data, $options: 'i' } },
        { 'socials.reddit': { $regex: input_data, $options: 'i' } },
        { 'socials.twitter': { $regex: input_data, $options: 'i' } },
        { 'socials.facebook': { $regex: input_data, $options: 'i' } },
        { address: { $regex: input_data, $options: 'i' } },
      ],
    }).where({ _id: { $ne: userId } });
    res.status(200).json({ data: data, count: count });
  } catch (err) {
    console.log('Something went wrong ', err);
    res.status(500).send({
      message: err || 'Something went wrong!',
    });
  }
};
async function saveSocialInfo(res, address, key, val) {
  const user = await User.findOne({ address: address });
  if (!user) return res.status(400).send({ message: 'User not found' });
  const result = await User.findOneAndUpdate(
    { address: address },
    { $set: { [`socials.${key}`]: val } },
    { isSocialVerified: true }
  );
  return res.status(200).send(result);
}

async function checkSocialVerified(type, value, address) {
  try {
    const dummyUser = await User.findOne({
      [`socials.${type.toLowerCase()}`]: {
        $regex: '^' + value + '\\b',
        $options: 'i',
      },
    });
    if (dummyUser) {
      dummyUser.socials[type.toLowerCase()] = '';
      await dummyUser.save();
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: error || 'Something went wrong' });
  }
}

exports.verifySocialToken = async (req, res) => {
  try {
    const { social, access_token, id } = req.body;
    const address = req.userAddress;

    if (social === 'google') {
      const data = await axios.get(
        `https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${access_token}`
      );
      if (data.data && data.data.email) {
        await checkSocialVerified('email', data?.data?.email, address);
        saveSocialInfo(res, address, 'email', data?.data?.email);
      } else res.status(500).send({ message: 'Something went wrong' });
    }

    if (social === 'twitter') {
      const data = await axios.get(`https://api.twitter.com/2/users/me`, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });
      if (data.data && data.data.data) {
        await checkSocialVerified('twitter', data?.data.data.username, address);
        saveSocialInfo(res, address, 'twitter', data?.data.data.username);
      } else res.status(500).send({ message: 'Something went wrong' });
    }

    if (social === 'facebook') {
      const data = await axios.get(
        `https://graph.facebook.com/${id}?fields=id,name,email&access_token=${access_token}`
      );
      if (data.data && data.data.email) {
        await checkSocialVerified('facebook', data?.data?.email, address);
        saveSocialInfo(res, address, 'facebook', data?.data?.email);
      } else res.status(500).send({ message: 'Something went wrong' });
    }

    if (social === 'reddit') {
      const data = await axios.get(`https://oauth.reddit.com/api/v1/me`, {
        headers: {
          Authorization: `Bearer ${access_token}`,
          content_type: 'application/json',
        },
      });
      if (data.data && data.data.name) {
        await checkSocialVerified('reddit', data?.data?.name, address);
        saveSocialInfo(res, address, 'reddit', data?.data?.name);
      } else res.status(500).send({ message: 'Something went wrong' });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: error || 'Something went wrong' });
  }
};

exports.generateReferralToken = async (req, res) => {
  const user = req.user;

  if (user.referralToken)
    return res.status(200).send({ referralToken: user.referralToken });

  const referralToken = short.generate();
  const result = await User.findOneAndUpdate(
    { address: user.address },
    { $set: { referralToken: referralToken } },
    { new: true }
  );
  return res.status(200).send({ referralToken: result.referralToken });
};

exports.getMyReferralUsers = async (req, res) => {
  const user = req.user;
  const page = req.query.page - 1 || 0;
  const limit = req.query.limit || 10;

  try {
    const data = await User.find({ referredBy: user._id })
      .select('name _id createdAt avatar')
      .limit(limit)
      .skip(limit * page)
      .sort({ createdAt: -1 });
    const count = await User.countDocuments({ referredBy: user._id });
    res.status(200).json({ data: data, count: count });
  } catch (err) {
    console.log('Something went wrong ', err);
    res.status(500).send({
      message: err || 'Something went wrong!',
    });
  }
};

exports.customizeNotification = async (req, res) => {
  const user = req.user;
  const { notificationType, isEnable } = req.body;
  try {
    if (isEnable) {
      if (!user.notificationType.includes(notificationType)) {
        user.notificationType.push(notificationType);
      }
    } else {
      if (user.notificationType.includes(notificationType)) {
        user.notificationType = user.notificationType.filter(
          (item) => item !== notificationType
        );
      }
    }
    await user.save();
    res.status(200).json(user);
  } catch (err) {
    console.log('Something went wrong ', err);
    res.status(500).send({
      message: err || 'Something went wrong!',
    });
  }
};

const checkSocial = async (provider, access_token) => {
  try {
    // if (provider === 'google') {
    //   const data = await axios.get(
    //     `https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${access_token}`
    //   );
    //   if (data.data && data.data.email) {
    //     await checkSocialVerified('email', data?.data?.email, address);
    //     saveSocialInfo(res, address, 'email', data?.data?.email);
    //   } else res.status(500).send({ message: 'Something went wrong' });
    // }

    if (provider === 'twitter') {
      const data = await axios.get(`https://api.twitter.com/2/users/me`, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });
      if (data.data && data.data.data) {
        return {
          name: data?.data?.data?.username + '@X',
          userRealName: data?.data?.data?.name,
        };
      } else
        res
          .status(500)
          .send({ message: 'Your social access token is invalid' });
    }

    // if (provider === 'facebook') {
    //   const data = await axios.get(
    //     `https://graph.facebook.com/${id}?fields=id,name,email&access_token=${access_token}`
    //   );
    //   if (data.data && data.data.email) {
    //     await checkSocialVerified('facebook', data?.data?.email, address);
    //     saveSocialInfo(res, address, 'facebook', data?.data?.email);
    //   } else res.status(500).send({ message: 'Something went wrong' });
    // }

    if (provider === 'reddit') {
      const data = await axios.get(`https://oauth.reddit.com/api/v1/me`, {
        headers: {
          Authorization: `Bearer ${access_token}`,
          content_type: 'application/json',
        },
      });
      if (data.data && data.data.name) {
        return data?.data.name + '@RT';
      } else return null;
    }
  } catch (error) {
    console.log(error);
    return null;
  }
};

exports.registerSocialUser = async (req, res) => {
  const {
    name,
    password,
    encryptedJson,
    socialAccessToken,
    invitationCode,
    metamaskWalletAddress,
    isMintable,
    socialProvider,
    avatar,
  } = req.body;
  const address = req.userAddress;

  try {
    let _user = await User.findOne({ referralToken: invitationCode });
    if (!_user)
      return res.status(400).send({ message: 'Invalid invitation code!' });
    const { name: _name, userRealName } = await checkSocial(
      socialProvider,
      socialAccessToken
    );
    if (_name !== name)
      return res.status(400).send({ message: 'Invalid name!' });
    //find user address of name
    _user = null;
    _user = await User.findOne({ address: address, name: name });
    if (_user) return res.status(400).send({ message: 'User already exist' });
    if (isMintable) {
      try {
        var customHttpProvider = new ethers.providers.JsonRpcProvider(
          process.env.PROVIDER
        );
        const signer = await decryptWalletWithSigner(
          encryptedJson,
          password,
          customHttpProvider
        );
        const socialNft = new ethers.Contract(
          process.env.SOCIAL_NFT_ADDRESS,
          socialNftAbi,
          signer
        );
        const tokenId = await socialNft._tokenIds();
        const { hash, signature } = await generateHashAndSignature(
          address,
          Date.now().toString() / 1000,
          Number(tokenId) + 1
        );
        const tx = await socialNft.selfMint(
          name,
          address,
          'NO URL',
          hash,
          signature
        );
        const receipt = await tx.wait();
        if (receipt) {
          const referralUser = await User.findOne({
            referralToken: invitationCode,
          });

          let user = await new User({
            name,
            password: encrypt(password),
            encryptedJson: encrypt(encryptedJson),
            metamaskWalletAddress,
            isMintedNft: true,
            address,
            nftTokenId: receipt?.events[0]?.args?.tokenId?.toString(),
            avatar,
            userRealName,
            referredBy: referralUser._id,
          });

          await user.save();
          referralUser.referralCount = referralUser.referralCount + 1;
          await referralUser.save();
          //remove user password and encryptedJson
          user.password = '';
          user.encryptedJson = '';
          res.status(200).json(user);
        }
      } catch (error) {
        console.log(error);
        return res
          .status(500)
          .send({ message: error || 'Something went wrong' });
      }
    } else {
      const referralUser = await User.findOne({
        referralToken: invitationCode,
      });

      let user = await new User({
        name,
        address,
        password: encrypt(password),
        encryptedJson: encrypt(encryptedJson),
        metamaskWalletAddress,
        avatar,
        userRealName,
        referredBy: referralUser._id,
      });

      await user.save();
      //remove user password and encryptedJson
      referralUser.referralCount = referralUser.referralCount + 1;
      await referralUser.save();
      user.password = '';
      user.encryptedJson = '';
      res.status(200).json(user);
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: error || 'Something went wrong' });
  }
};

exports.checkUserName = async (req, res) => {
  const { name } = req.body;
  try {
    const user = await User.findOne({ name: name });
    if (user) return res.status(400).send({ message: 'Name already exist!' });
    res.status(200).json({ message: 'ok' });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: error || 'Something went wrong' });
  }
};

exports.checkInvitationCode = async (req, res) => {
  const { invitationCode } = req.body;
  try {
    const _invitationCode = await User.findOne({
      referralToken: invitationCode,
    });
    if (!_invitationCode)
      return res.status(400).send({ message: 'Invalid invitation code!' });
    res.status(200).json({ message: 'ok' });
  } catch (error) {
    res.status(500).send({ message: error || 'Something went wrong' });
  }
};

exports.socialLogin = async (req, res) => {
  const { name, password } = req.body;
  try {
    const user = await User.findOne({ name: name });
    if (!user) return res.status(400).send({ message: 'User not found!' });
    const _password = decrypt(user.password).toString();
    if (_password !== password)
      return res.status(400).send({ message: 'Invalid password!' });
    var customHttpProvider = new ethers.providers.JsonRpcProvider(
      process.env.PROVIDER
    );
    const signer = await decryptWalletWithSigner(
      decrypt(user.encryptedJson).toString(),
      password,
      customHttpProvider
    );
    const token = await Web3Token.sign(
      async (msg) => await signer.signMessage(msg),
      '15d'
    );
    user.password = '';
    user.encryptedJson = '';
    res.status(200).json({ user, token });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: error || 'User not found!' });
  }
};

exports.socialLoginWithSocial = async (req, res) => {
  const { socialProvider, socialAccessToken } = req.body;
  try {
    let { name: _name } = await checkSocial(socialProvider, socialAccessToken);
    if (!_name) return res.status(400).send({ message: 'User not found!' });

    const user = await User.findOne({ name: _name });
    if (!user) return res.status(400).send({ message: 'User not found!' });
    var customHttpProvider = new ethers.providers.JsonRpcProvider(
      process.env.PROVIDER
    );
    const signer = await decryptWalletWithSigner(
      decrypt(user.encryptedJson).toString(),
      decrypt(user.password).toString(),
      customHttpProvider
    );
    const token = await Web3Token.sign(
      async (msg) => await signer.signMessage(msg),
      '15d'
    );
    user.password = '';
    user.encryptedJson = '';
    res.status(200).json({ user, token });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: error || 'User not found!' });
  }
};

exports.getPrivateKey = async (req, res) => {
  const user = req.user;
  try {
    var customHttpProvider = new ethers.providers.JsonRpcProvider(
      process.env.PROVIDER
    );
    if (!user.encryptedJson)
      return res.status(400).send({ message: 'User not found!' });

    const signer = await decryptWalletWithSigner(
      decrypt(user.encryptedJson).toString(),
      decrypt(user.password).toString(),
      customHttpProvider
    );
    const privateKey = signer.privateKey;
    res.status(200).json({ privateKey });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: error || 'User not found!' });
  }
};

exports.getEncryptedJson = async (req, res) => {
  const user = req.user;
  try {
    if (!user.encryptedJson)
      return res.status(400).send({ message: 'User not found!' });
    const encryptedJson = decrypt(user.encryptedJson).toString();
    res.status(200).json({ encryptedJson });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: error || 'User not found!' });
  }
};

exports.getPublicUserInfo = async (req, res) => {
  const name = req.query.name;
  try {
    // find user by name and consider case insensitive
    const user = await User.findOne({
      name: { $regex: name, $options: 'i' },
    });

    if (!user) return res.status(400).send({ message: 'User not found!' });
    user.password = '';
    user.encryptedJson = '';
    res.status(200).json(user);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: error || 'User not found!' });
  }
};

exports.searchSocialUsers = async (req, res) => {
  const page = req.query.page - 1 || 0;
  const limit = req.query.limit || 10;
  const userIdOrNameOrUserRealName = req.query.name || null;
  const userId = req.user._id;
  try {
    if (!userIdOrNameOrUserRealName || userIdOrNameOrUserRealName === '') {
      const data = await User.find({})
        .where({ _id: { $ne: userId } })
        .select('name _id  avatar userRealName')
        .limit(limit)
        .skip(limit * page)
        .sort({ createdAt: -1 });
      const count = await User.countDocuments({}).where({
        _id: { $ne: userId },
      });
      return res
        .status(200)
        .json({ data: data, count: count, currentPage: page + 1 });
    }
    const data = await User.find({
      $or: [
        { name: { $regex: userIdOrNameOrUserRealName, $options: 'i' } },
        { userRealName: { $regex: userIdOrNameOrUserRealName, $options: 'i' } },
      ],
    })
      .where({ _id: { $ne: userId } })
      .select('name _id  avatar userRealName')
      .limit(limit)
      .skip(limit * page)
      .sort({ createdAt: -1 });
    const count = await User.countDocuments({
      $or: [
        { name: { $regex: userIdOrNameOrUserRealName, $options: 'i' } },
        { userRealName: { $regex: userIdOrNameOrUserRealName, $options: 'i' } },
      ],
    }).where({ _id: { $ne: userId } });
    res.status(200).json({ data: data, count: count, currentPage: page + 1 });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: error || 'User not found!' });
  }
};

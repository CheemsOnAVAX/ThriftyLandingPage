const Web3Token = require('web3-token');
const User = require('../models/user');
const getUserAddress = async function getUserAddress(req, res, next) {
  try {
    const bearerToken = req.headers['authorization'];
    const token = bearerToken.split(' ')[1];
    let address;
    try {
      const data = await Web3Token.verify(token);
      address = data.address;
    } catch (error) {
      return res.status(401).send({ message: 'Unauthorized' });
    }
    if (!address) return res.status(401).send({ message: 'Unauthorized' });
    req.userAddress = address;
    next();
  } catch (error) {
    console.log(error);
    res.status(401).send({ message: 'Unauthorized' });
  }
};

const getUser = async function getUser(req, res, next) {
  try {
    const bearerToken = req.headers['authorization'];
    const token = bearerToken?.split(' ')[1];
    if (!token) return res.status(401).send({ message: 'Unauthorized' });
    let address;
    try {
      const data = await Web3Token.verify(token);
      address = data.address;
    } catch (error) {
      return res.status(401).send({ message: 'Unauthorized' });
    }
    if (!address) return res.status(401).send({ message: 'Unauthorized' });
    const user = await User.findOne({ address: address });
    if (!user) return res.status(401).send({ message: 'Unauthorized' });
    req.user = user;
    next();
  } catch (error) {
    console.log(error);
    res.status(401).send({ message: 'Unauthorized' });
  }
};

const getUserAddressNoAuth = async function (req, res, next) {
  const bearerToken = req.headers['authorization'];
  const token =
    bearerToken !== undefined ? bearerToken.split(' ')[1] : undefined;
  if (token !== undefined) {
    let address;
    try {
      const data = await Web3Token.verify(token);
      address = data.address;
    } catch (error) {
      req.userAddress = '';
      req.user = '';
    }
    req.userAddress = address;
  } else {
    req.userAddress = '';
    req.user = '';
  }
  next();
};

const getUserAddressNoAuthUser = async function (req, res, next) {
  const bearerToken = req.headers['authorization'];
  const token =
    bearerToken !== undefined ? bearerToken.split(' ')[1] : undefined;
  if (token !== undefined) {
    let address;
    try {
      const data = await Web3Token.verify(token);
      address = data.address;
    } catch (error) {
      req.userAddress = '';
      req.user = '';
    }
    const user = await User.findOne({ address: address });
    req.user = user;
  } else {
    req.userAddress = '';
    req.user = '';
  }
  next();
};

module.exports = {
  getUserAddress,
  getUser,
  getUserAddressNoAuth,
  getUserAddressNoAuthUser,
};

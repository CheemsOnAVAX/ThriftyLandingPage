const axios = require('axios');
const crypto = require('../../utils/crypto');
const PrivateFile = require('../../models/PrivateFile');
const Crypto = require('crypto');

const isOwner = (user, _privateFile) => {
  const privateFile = _privateFile.toObject();
  let socials = { address: user.address.toLowerCase() };

  const isHasValue = Object.keys(user.socials).length > 0;
  if (isHasValue) {
    const _socials = user.socials;
    const socialsObj = Object.fromEntries(_socials);
    for (const [key, value] of Object.entries(socialsObj)) {
      socials = {
        ...socials,
        [key.toLowerCase()]: value.toLowerCase(),
      };
    }
  }
  // console.log({ socials });
  const arrayLength =
    privateFile.createdBy.length > privateFile.sharedWith.length
      ? privateFile.createdBy.length
      : privateFile.sharedWith.length;
  for (let i = 0; i < arrayLength; i++) {
    if (privateFile.sharedWith[i]) {
      const [firstKey] = privateFile.sharedWith[i].keys();
      const [firstValue] = privateFile.sharedWith[i].values();
      if (socials[firstKey] === firstValue) {
        return true;
      }
    }
    if (privateFile.createdBy[i]) {
      const [firstKey] = privateFile.createdBy[i].keys();
      const [firstValue] = privateFile.createdBy[i].values();
      if (socials[firstKey] === firstValue) {
        return true;
      }
    }
  }
  return false;
};

exports.createNewPrivateFile = (req, res) => {
  const { link, name, size, type, ext, isIpfsLink } = req.body;
  const user = req.user.toObject();
  const key = user.defaultHandler;
  const value = key === 'address' ? user.address : user.socials.get(key);
  if (!key || !value) {
    return res.status(500).send({
      message: 'Please add your default handler first',
    });
  }
  const createdBy = [
    {
      [key.toLowerCase()]: value.toLowerCase(),
    },
  ];
  const newPrivateFile = new PrivateFile({
    link,
    name,
    size,
    type,
    ext,
    createdBy,
    isIpfsLink,
  });
  newPrivateFile
    .save()
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || 'Some error occurred while creating the PrivateFile.',
      });
    });
};

exports.sharePrivateFile = async (req, res) => {
  try {
    const { fileId, social } = req.body;
    const privateFile = await PrivateFile.findById(fileId);
    if (!privateFile) {
      return res.status(404).send({
        message: 'PrivateFile not found with id ' + fileId,
      });
    }
    if (!isOwner(req.user, privateFile)) {
      return res.status(500).send({
        message: 'You are not the owner of this file',
      });
    }
    for (let i = 0; i < privateFile.sharedWith.length; i++) {
      const [firstKey] = privateFile.sharedWith[i].keys();
      const [firstValue] = privateFile.sharedWith[i].values();
      if (
        social.key.toLowerCase() === firstKey.toLowerCase() &&
        social.value.toLowerCase() === firstValue.toLowerCase()
      ) {
        return res.status(500).send({
          message: 'This file is already shared with this user',
        });
      }
    }

    privateFile.sharedWith.push({
      [social.key.toLowerCase()]: social.value.toLowerCase(),
    });
    const updatedPrivateFile = await privateFile.save();
    res.status(200).send(updatedPrivateFile);
  } catch (error) {
    res.status(500).send({
      message:
        error.message || 'Some error occurred while creating the PrivateFile.',
    });
  }
};

exports.getPrivateFiles = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const filter = req.query.filter || 'all';
    const short = req.query.short || 'all';
    const user = req.user;

    const socials = [];
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
    if (filter === 'all') {
      query = {
        $or: [
          {
            createdBy: {
              $elemMatch: {
                $in: socials,
              },
            },
          },
          {
            sharedWith: {
              $elemMatch: {
                $in: socials,
              },
            },
          },
        ],
      };

      if (short !== 'all') {
        query = {
          ...query,
          type: short,
        };
      }
    }

    if (filter === 'sent') {
      query = {
        createdBy: {
          $elemMatch: {
            $in: socials,
          },
        },
      };
      if (short !== 'all') {
        query = {
          ...query,
          type: short,
        };
      }
    }

    if (filter === 'received') {
      query = {
        sharedWith: {
          $elemMatch: {
            $in: socials,
          },
        },
      };
      if (short !== 'all') {
        query = {
          ...query,
          type: short,
        };
      }
    }

    const privateFiles = await PrivateFile.find(query)
      .skip((page - 1) * limit || 0)
      .limit(limit)
      .sort({ createdAt: -1 });
    const count = await PrivateFile.countDocuments(query);
    res.status(200).send({
      data: privateFiles,
      count,
      currentPage: page,
    });
  } catch (error) {
    res.status(500).send({
      message:
        error.message || 'Some error occurred while creating the PrivateFile.',
    });
  }
};

function decrypt(encryptedText) {
  const [ivHex, encrypted] = encryptedText.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = Crypto.createDecipheriv(
    'aes-256-cbc',
    'vOVH6sdmpNWjRRIqCc7rdxs01lwHzfr3',
    iv
  );
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

exports.getDecryptedFile = async (req, res) => {
  const fileId = req.query.id;
  if (!fileId) {
    return res.status(400).send({
      message: 'File id is required',
    });
  }
  const user = req.user;
  const privateFile = await PrivateFile.findById(fileId);
  if (!privateFile) {
    return res.status(404).send({
      message: 'PrivateFile not found with id ' + fileId,
    });
  }

  if (isOwner(user, privateFile)) {
    try {
      const link = privateFile.link.replace(
        'ipfs://',
        'https://nftstorage.link/ipfs/'
      );
      const { data } = await axios.get(link);
      let _data = Buffer.from(data, 'base64');
      _data = JSON.parse(_data);
      const decryptedData = decrypt(_data.content);
      const _privateFile = {};
      Object.assign(_privateFile, privateFile.toObject());
      _privateFile.decryptedContent = decryptedData;
      res.status(200).send(_privateFile);
    } catch (error) {
      console.log(error);
      res.status(500).send({
        message: 'Something went wrong',
      });
    }
  } else {
    res.status(500).send({
      message: 'Unauthorized',
    });
  }
};

exports.deletePrivateFile = async (req, res) => {
  const fileId = req.query.fileId;
  if (!fileId) {
    return res.status(400).send({
      message: 'File id is required',
    });
  }
  const user = req.user;
  const privateFile = await PrivateFile.findById(fileId);
  if (!isOwner(user, privateFile)) {
    return res.status(500).send({
      message: 'Unauthorized',
    });
  }

  if (
    privateFile.createdBy.length === 1 &&
    privateFile.sharedWith.length === 0
  ) {
    await PrivateFile.findByIdAndDelete(fileId);
    return res.status(200).send({
      message: 'File deleted successfully',
    });
  }
  let socials = { address: user.address.toLowerCase() };
  const isHasValue = Object.keys(user.socials).length > 0;
  if (isHasValue) {
    const _socials = user.socials;
    const socialsObj = Object.fromEntries(_socials);
    for (const [key, value] of Object.entries(socialsObj)) {
      socials = {
        ...socials,
        [key.toLowerCase()]: value.toLowerCase(),
      };
    }
  }

  const [firstKey] = privateFile.createdBy[0].keys();
  const [firstValue] = privateFile.createdBy[0].values();
  if (socials[firstKey.toLowerCase()] === firstValue.toLowerCase()) {
    await PrivateFile.findByIdAndDelete(fileId);
    return res.status(200).send({
      message: 'File deleted successfully',
    });
  }

  for (let i = 0; i < privateFile.sharedWith.length; i++) {
    const [firstKey] = privateFile.sharedWith[i].keys();
    const [firstValue] = privateFile.sharedWith[i].values();
    if (socials[firstKey.toLowerCase()] === firstValue.toLowerCase()) {
      privateFile.sharedWith.splice(i, 1);
      await privateFile.save();
      return res.status(200).send({
        message: 'File deleted successfully',
      });
    }
  }
  res.status(500).send({
    message: 'Unauthorized',
  });
};

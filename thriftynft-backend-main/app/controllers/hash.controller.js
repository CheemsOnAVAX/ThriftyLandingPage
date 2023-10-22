const { encrypt, decrypt } = require('../../utils/crypto');
const crypto = require('crypto');

// Retrieve all Customers from the database.
exports.encrypt = (req, res) => {
  const enc = encrypt(req.file.buffer);
  res.send(enc);
};

exports.decrypt = (req, res) => {
  const data = req.body.data;
  const dec = decrypt(data);
  res.send(dec);
};

exports.encryptString = (req, res) => {
  try {
    const data = req.body.data;
    const iv = crypto.randomBytes(16); // Generate a random IV
    const cipher = crypto.createCipheriv(
      'aes-256-cbc',
      'vOVH6sdmpNWjRRIqCc7rdxs01lwHzfr3',
      iv
    );
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const finalEncrypted = `${iv.toString('hex')}:${encrypted}`;
    res.send(finalEncrypted);
  } catch (error) {
    res.status(500).send({
      message:
        error.message || 'Some error occurred while creating the PrivateFile.',
    });
  }
};

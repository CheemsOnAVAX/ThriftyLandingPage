const crypto = require('crypto');

const algorithm = 'aes-256-ctr';
const secretKey = process.env.GIFT_CARD_SECURE_PRIVATE_KEY;

const key = crypto.createHash('md5').update(secretKey).digest('hex');
const iv = crypto.createHash('md5').update('Test').digest();

const encrypt = (text) => {
  text = text.toString('base64');
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
  return encrypted.toString('binary');
  // return encrypted;
};

const decrypt = (hash) => {
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  // const decrpyted = Buffer.concat([decipher.update(hash), decipher.final()]);
  const decrpyted = Buffer.concat([
    decipher.update(Buffer.from(hash, 'binary')),
    decipher.final(),
  ]);
  return decrpyted;
};

module.exports = {
  encrypt,
  decrypt,
};

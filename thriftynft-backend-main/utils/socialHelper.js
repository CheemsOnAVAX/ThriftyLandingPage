const EthCrypto = require('eth-crypto');
const { ethers } = require('ethers');

const decryptWalletWithSigner = async (encryptedJson, password, provider) => {
  //Decrypted JSON file to get Wallet instance
  try {
    wallet = await ethers.Wallet.fromEncryptedJson(encryptedJson, password);
    const signer = wallet.connect(provider);
    return signer;
  } catch (err) {
    console.log(`decryption error: ${err.message}`);
    return null;
  }
};

const generateHashAndSignature = async (address, timestamp, tokenId) => {
  const message = EthCrypto.hash.keccak256([
    {
      type: 'string',
      value: `${tokenId} ${address} ${timestamp}`,
    },
  ]);

  const signature = EthCrypto.sign(
    '0x' + process.env.SOCIAL_NFT_PRIVATE_KEY,
    message
  );
  return {
    hash: message,
    signature: signature,
  };
};

module.exports = { decryptWalletWithSigner, generateHashAndSignature };

const crypt = require('crypto');
const fs = require('fs');

function genKeyPair() {
  const keyPairRefreshToken = crypt.generateKeyPairSync('rsa', {
    modulusLength: 4096,
    publicKeyEncoding: {
      type: 'pkcs1',
      format: 'pem',
    },
    privateKeyEncoding: {
      type: 'pkcs1',
      format: 'pem',
    },
  });
  fs.writeFileSync(__dirname + '/../keys/refresh_public.pem', keyPairRefreshToken.publicKey);
  fs.writeFileSync(__dirname + '/../keys/refresh_private.pem', keyPairRefreshToken.privateKey);

  const keyPairAccessToken = crypt.generateKeyPairSync('rsa', {
    modulusLength: 4096,
    publicKeyEncoding: {
      type: 'pkcs1',
      format: 'pem',
    },
    privateKeyEncoding: {
      type: 'pkcs1',
      format: 'pem',
    },
  });
  fs.writeFileSync(__dirname + '/../keys/access_public.pem', keyPairAccessToken.publicKey);
  fs.writeFileSync(__dirname + '/../keys/access_private.pem', keyPairAccessToken.privateKey);
}

genKeyPair();

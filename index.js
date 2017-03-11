"use strict";
let Hashcash = function() {};

if (typeof(window) === "undefined") {
  let crypto = require('crypto');
  Hashcash.prototype.getHash = function (string, callback) {
    callback(crypto.createHash("sha1").update(string).digest());
  };
} else {
  Hashcash.prototype.getHash = function (string, callback) {
    window.crypto.subtle.digest('SHA-1', new window.TextEncoder('utf-8').encode(string))
    .then(function (hash) {
      callback(hash);
    });
  };
}

Hashcash.prototype.checkToken = function (token, callback) {
  let tokenArray;
  let tokenString;
  if (typeof(token) == "string") {
    tokenArray = this._tokenArrayFromString(token);
    tokenString = token;
  }
  else {
    tokenArray = token;
    tokenString = this._tokenStringFromArray(tokenArray);
  }
  this._validateTokenArray(tokenArray);

  let difficulty = this._tokenDifficulty(tokenArray);
  this.getHash(tokenString, function (hash) {
    let valid = true;
    let hashArray = Array.from(new Uint8Array(hash));
    let numNullBytes = Math.floor(difficulty / 8);
    for (let i = 0; i < numNullBytes; i++) {
      if (hashArray[i] !== 0) {
        valid = false;
        break;
      }

    }
    let numNullBits = difficulty - 8 * numNullBytes;

    valid = valid && (hashArray[numNullBytes] < Math.pow(2, 8 - numNullBits));

    callback(valid);
  });
};

Hashcash.prototype.generateToken = function (challenge, difficulty) {
  
};

Hashcash.prototype._validateTokenArray = function (tokenArray) {
  let invalid = new Error("Invalid token format");
  if (!Array.isArray(tokenArray)) {
    throw invalid;
  }
  if (tokenArray.length != 7) {
    throw invalid;
  }
  if (tokenArray[0] != 1) {
    throw new Error("Unsupported token version");
  }
  //TODO check date is recent
  return true;
};

Hashcash.prototype._tokenDifficulty = function (tokenArray) {
  return tokenArray[1];
};

Hashcash.prototype._tokenArrayFromString = function (tokenString) {
  let token = tokenString.split(":");
  //TODO do some type conversions e.g. date parsing?
  return token;
};

Hashcash.prototype._tokenStringFromArray = function (tokenArray) {
  let token = tokenArray.join(":");
  //TODO do some type conversions e.g. date parsing?
  return token;
};

module.exports = new Hashcash();
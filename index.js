"use strict";
let Hashcash = function() {};
let sha = require('sha.js');

Hashcash.prototype.checkToken = function (token) {
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
  return this._checkToken(tokenArray);
};

Hashcash.prototype._checkToken = function (tokenArray) {
  let difficulty = this._tokenDifficulty(tokenArray);
  let hash = sha("sha1").update(this._tokenStringFromArray(tokenArray)).digest();
  
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
  valid = valid && (hashArray[numNullBytes] <= Math.pow(2, 8 - numNullBits));

  return valid;
};

Hashcash.prototype.generateToken = function (challenge, difficulty) {
  let counter = 0;
  let tokenArray = [
      "1",
      difficulty,
      this._dateToString(new Date()),
      challenge,
      "",
      this._randomString(),
      0
    ];
    
    while (!this._checkToken(tokenArray)) {
      tokenArray[6] = (++counter).toString(36);
    }
    
    return this._tokenStringFromArray(tokenArray);
};

Hashcash.prototype._generateToken = function (token, callback) {
  let counter = token[6];
  token[6] = counter.toString(36);
  let self = this;
  while (!this.checkToken(token)) {
    token[6] = (counter + 1).toString(36);
    setTimeout(() => self._generateToken(token, callback), 0);
  }
};

Hashcash.prototype._randomString = function() {
  return Math.floor((Math.random() * Math.pow(2, 20))).toString(36);

};

Hashcash.prototype._dateToString = function (date) {
  let year = date.getFullYear().toString().substring(2);
  let month = date.getMonth().toString();
  month = ("00"+month).substring(month.length); // pad to 2 characters
  let day = date.getDate().toString();
  day = ("00"+day).substring(day.length); // pad to 2 characters
  let hours = date.getHours().toString();
  hours = ("00"+hours).substring(hours.length); // pad to 2 characters
  let minutes = date.getMinutes().toString();
  minutes = ("00"+minutes).substring(minutes.length); // pad to 2 characters
  let seconds = date.getSeconds().toString();
  seconds = ("00"+seconds).substring(seconds.length); // pad to 2 characters
  
  return year + month + day + hours + minutes + seconds;
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
"use strict"

var hashcash = require('../');
var assert = require('assert');

var exampleToken = "1:20:1303030600:adam@cypherspace.org::McMybZIhxKXu57jd:ckvi";
var exampleTokenArray = ["1", "20", "1303030600", "adam@cypherspace.org", "", "McMybZIhxKXu57jd", "ckvi"];
var invalidToken = "1:20:1303030600:adam@cypherspace.org::McMybZIhxKXu57jd:INVALID";

describe("hashcash", function() {
  describe("_tokenArrayFromString", function() {
    it("converts token string to array representation", function() {
      let tokenArray = hashcash._tokenArrayFromString(exampleToken);
      let expectedArray = ["1", "20", "1303030600", "adam@cypherspace.org", "", "McMybZIhxKXu57jd", "ckvi"];
      assert.deepEqual(tokenArray, expectedArray);
    });
  });
  
  describe("_validateToken", function() {
    it("accepts valid tokens in array representation", function() {
      let tokenArray = ["1", "20", "1303030600", "adam@cypherspace.org", "", "McMybZIhxKXu57jd", "ckvi"];
      assert.doesNotThrow(() => hashcash._validateTokenArray(tokenArray));
    });
    it("rejects tokens with not enough fields", function() {
      let tokenArray = ["1", "20", "1303030600", "adam@cypherspace.org", "", "McMybZIhxKXu57jd"];
      assert.throws(() => hashcash._validateTokenArray(tokenArray));
    });
    it("rejects tokens with too many fields", function() {
      let tokenArray = ["1", "20", "1303030600", "adam@cypherspace.org", "", "McMybZIhxKXu57jd", "ckvi", "another"];
      assert.throws(() => hashcash._validateTokenArray(tokenArray));
    });
    it("rejects tokens with incompatible version", function() {
      let tokenArray = ["2", "20", "1303030600", "adam@cypherspace.org", "", "McMybZIhxKXu57jd", "ckvi"];
      assert.throws(() => hashcash._validateTokenArray(tokenArray));
    });
    it("rejects non-arrays", function() {
      assert.throws(() => hashcash._validateTokenArray({}));
    });
  });
  
  describe("checkToken", function() {
    it("accepts valid token string", function(done) {
      hashcash.checkToken(exampleToken, (valid) => {assert.equal(valid, true); done()});
    });
    it("accepts valid token array", function(done) {
      hashcash.checkToken(exampleTokenArray, (valid) => {assert.equal(valid, true); done()});
    })
    it("rejects invalid token", function(done) {
      hashcash.checkToken(invalidToken, (valid) => {assert.equal(valid, false); done()});
    });
  })
});
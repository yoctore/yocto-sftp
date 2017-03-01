var sftp = require('../src/')();
var assert = require('assert');
var _      = require('lodash');
var utils  = require('yocto-utils');
var should = require('chai').should();

sftp.logger.disableConsole();

var config = {
  host    : "10.10.10.10",
  port    : 22,
  user    : "test",
  password : "pwd",
  algorithms: {
    serverHostKey: [ 'ssh-rsa', 'ssh-dss' ],
  },
   agent: process.env.SSH_AUTH_SOCK
};

describe('[ yocto-ssftp ] - test with predefined value', function() {

  // test an valid config
  describe('Load() use correct data for schema ', function() {
    it('An success promise should be return', function (done) {
      sftp.load(config, 'load').then(function (value) {
        assert(true);
        done();
      }).catch(function (error) {
        // reject error
        done(error);
      });
    });
  });

  // test an in valid config
  describe('Load() use wrong data for schema ', function() {
    it('An Failed promise should be return', function (done) {
      sftp.load({ port : 'dedede' }, 'load').then(function (value) {
        // reject error
        done(error);
      }).catch(function (error) {
        assert(true);
        done();
      });
    });
  });
});

'use strict';

var logger        = require('yocto-logger');
var _             = require('lodash');
var Q             = require('q');

/**
 *
 * Utility tool that create an ftp client
 *
 * @date : 06/12/2016
 * @author : Cédric BALARD <cedric@yocto.re>
 * @copyright : Yocto SAS, All right reserved
 *
 * @class sftp
 */
function Sftp (l) {

  /**
  * Default logger instance
  *
  * @property logger
  * @type Object
  */
  this.logger           = l;

  /**
  * The config to write file
  *
  * @property logger
  * @type Object
  */
  this.config           = {};

  // Require modules
  this.schema = require('./modules/schema')(l);
  this.sftp   = require('./modules/sftp')(l);
}

/**
 * Method that load config for this module
 *
 * @param  {Object} data the data used for configuration
 * @return {Object} promise of this method
 */
Sftp.prototype.load = function (data) {
  // create async process
  var deferred  = Q.defer();

  // validate load config
  this.schema.validate(data, 'load').then(function (value) {
    // set config
    this.config = value;

    this.logger.info('[ sftp.load ] - config load with success');
    // schema load success
    deferred.resolve(value);
  }.bind(this)).catch(function (error) {
    // log
    this.logger.error('[ sftp.load ] - error when loading module');
    // reject error
    deferred.reject(error);
  }.bind(this));

  // return result of control flow
  return deferred.promise;
};

/**
 * Method that connect to the sftp server and retrieve the SSH2 instance
 *
 * @return {Object} the promise of methods
 */
Sftp.prototype.connect = function () {
  // return promise of method
  return this.sftp.connect(this.config);
};

/**
 * Method to close the client connection
 *
 * @param {Object} client the client to close
 * @return {Object} the promise of methods
 */
Sftp.prototype.end = function (client) {
  // return promise of method
  return this.sftp.end(client);
};

/**
 * Method to list folder of an directory on ftp server
 *
 * @param  {Object} remotePathDir the path of folder to list
 * @return {Object} the promise of methods
 */
Sftp.prototype.ls = function (remotePathDir) {
  // return promise
  return this.sftp.ls(this.config, remotePathDir);
};

/**
 * Method to check if an file exist in an folder
 *
 * @param  {Object} remotePathFile the path of the file to check if exits
 * @return {Object} the promise of methods
 */
Sftp.prototype.fileExist = function (remotePathFile) {
  // return promise of method
  return this.sftp.fileExist(this.config, remotePathFile);
};

/**
 * Method to remove an existing file on ftp server
 *
 * @param  {Object} localPathFile the path of the file to upload
 * @param  {Object} remotePathFile the path of the file to remove
 * @return {Object} the promise of methods
 */
Sftp.prototype.put = function (localPathFile, remotePathFile) {
  // return promise of method
  return this.sftp.put(this.config, localPathFile, remotePathFile);
};

/**
 * Method that upload an file on server
 *
 * @param  {Object} remotePathFile the path of the file on remote server
 * @return {Object} the promise of methods
 */
Sftp.prototype.delete = function (remotePathFile) {
  // return promise of method
  return this.sftp.delete(this.config, remotePathFile);
};

/**
 * Copy one file from the remote machine to the local machine
 *
 * @param  {Object} localPathFile the path of the file downloaded
 * @param  {Object} remotePathFile the path of th file to download
 * @return {Object} the promise of methods
 */
Sftp.prototype.get = function (localPathFile, remotePathFile) {
  // return promise of method
  return this.sftp.get(this.config, localPathFile, remotePathFile);
};

/**
 * Method to handle the creating folder into sftp
 * Parent folder can be created like *mkdirp* command
 *
 * @param  {Object} path the path to create
 * @param  {Boolean} parent indicate if parent folder should be created
 * @return {Object} the promise of methods
 */
Sftp.prototype.mkdir = function (path, parent) {

  parent = parent || false;
  // return promise of method
  return this.sftp.mkdir(this.config, path, parent);
};

// Default export
module.exports = function (l) {
  // is a valid logger ?
  if (_.isUndefined(l) || _.isNull(l)) {
    logger.warning('[ sftp.constructor ] - Invalid logger given. Use internal logger');
    // assign
    l = logger;
  }
  // default statement
  return new (Sftp)(l);
};

'use strict';

var logger        = require('yocto-logger');
var _             = require('lodash');
var utils         = require('yocto-utils');
var Q             = require('q');
var fs            = require('fs');
var ClientSSH     = require('ssh2').Client;
var path          = require('path');

/**
 *
 * Utility tool to automaticly generate sitemap
 *
 * @date : 06/12/2016
 * @author : Cédric BALARD <cedric@yocto.re>
 * @copyright : Yocto SAS, All right reserved
 *
 * @module SitemapGenerator
 */
function Sftp (l) {

  this.logger = l;
}

/**
 * Method that connect to the sftp server
 *
 * @param  {Object} config the config to connect
 * @return {Object} promise of this method
 */
Sftp.prototype.connect = function (config) {
  // create async process
  var deferred  = Q.defer();

  // create new client ftp
  var client = new ClientSSH();

  this.logger.debug('[ Sftp.connect ] - connecting to server ...');
  // listener for when client will be connected
  client.on('ready', function () {
    // log
    this.logger.debug('[ Sftp.connect.ready ] - connect successful to server');

    // create sftp connection
    client.sftp(function (error, sftp) {
      // check if an error occured
      if (error) {
        this.logger.error('[ Sftp.connect.sftp ] - connection establish to server, but sftp ' +
        'connection can\'t be established, details : ', utils.obj.inspect(error));
      }

      this.logger.info('[ Sftp.connect.sftp ] - connect successful to SFTP server');

      // resolve ssh client and sftp client
      deferred.resolve({
        client  : client,
        sftp    : sftp
      });
    }.bind(this));
  }.bind(this));

  // listener in error case
  client.on('error', function (error) {
    // an error occured
    this.logger.error('[ Sftp.connect.error ] - an error occured ', utils.obj.inspect(error));
    // reject error
    deferred.reject(error);
  }.bind(this));

  // connect
  client.connect(config);

  // return result of control flow
  return deferred.promise;
};

/**
 * Close the connection to the sftp server
 *
 * @param  {Object} client the client instance
 * @return {Object} promise of this method
 */
Sftp.prototype.end = function (client) {

  // create async process
  var deferred  = Q.defer();

  try {

    this.logger.debug('[ Sftp.end ] - try to close the connection');
    // try to close the connection
    client.client.end();
    this.logger.debug('[ Sftp.end ] - the connction was ended');

    // resolve success
    deferred.resolve(true);
  } catch (error) {

    this.logger.error('[ Sftp.end ] - an error occured when end the conection, more details : ',
    utils.obj.inspect(error));
    // an error occured so reject proise
    deferred.reject(error);
  }

  // return result of control flow
  return deferred.promise;
};

/**
 * Method to list folder of an directory on ftp server
 *
 * @param  {Object} config the config to connect
 * @param  {Object} remotePathDir the path of folder to list
 * @return {Object} promise of this method
 */
Sftp.prototype.ls = function (config, remotePathDir) {

  // create async process
  var deferred  = Q.defer();
  // normalize the path
  remotePathDir = path.normalize(remotePathDir);
  // connect to the ftp
  this.connect(config).then(function (client) {

    this.logger.debug('[ Sftp.ls ] - list file in folder : ', remotePathDir);
    // retrieve the list
    client.sftp.readdir(remotePathDir, function (error, list) {
      // check if an error occured
      if (error) {
        this.logger.error('[ Sftp.ls ] - an error occured when execute the list command, more ' +
        'details : ', utils.obj.inspect(error));

        // reject error
        deferred.reject(error);
      }
      this.logger.debug('[ Sftp.ls ] - list file command success');
      // resolve the file
      deferred.resolve(list);
      // close the connection
      this.end(client);
    }.bind(this));
  }.bind(this)).catch(function (error) {
    // reject the error
    deferred.reject(error);
  });

  // return result of control flow
  return deferred.promise;
};

/**
 * Method to check if an file exist in an folder
 *
 * @param  {Object} config the config to connect
 * @param  {Object} remotePathFile the path of the file to check if exits
 * @return {Object} promise of this method
 */
Sftp.prototype.fileExist = function (config, remotePathFile) {

  // create async process
  var deferred  = Q.defer();
  // normalize the path
  remotePathFile = path.normalize(remotePathFile);

  this.logger.info('[ Sftp.fileExist ] - check if the file exist : ', remotePathFile);

  // connect to the ftp
  this.ls(config, path.dirname(remotePathFile)).then(function (list) {
    // find in the list folder if file exist
    var file = _.find(list, { filename : path.basename(remotePathFile) });
    // check if an file are found
    if (_.isUndefined(file)) {
      this.logger.warning('[ Sftp.fileExist ] - the file < ' + remotePathFile +
      ' > don\'t exist on ftp');
      // reject promise
      return deferred.reject('the file < ' + remotePathFile + ' > don\'t exist on ftp');
    }

    this.logger.info('[ Sftp.fileExist ] - the file < ' + remotePathFile + ' > exist on server');

    // the file exist, resolve it
    deferred.resolve(file);
  }.bind(this)).catch(function (error) {
    // reject the error
    deferred.reject(error);
  });

  // return result of control flow
  return deferred.promise;
};

/**
 * Method that upload an file on server
 *
 * @param  {Object} config the config to connect
 * @param  {Object} localPathFile the path of the file to upload
 * @param  {Object} remotePathFile the path of the file on remote server
 * @return {Object} promise of this method
 */
Sftp.prototype.put = function (config, localPathFile, remotePathFile) {

  // create async process
  var deferred  = Q.defer();

  localPathFile   = path.normalize(localPathFile);
  remotePathFile  = path.normalize(remotePathFile);

  // connect to the ftp
  this.connect(config).then(function (client) {

    this.logger.debug('[ Sftp.put ] - try to put the file < ' + localPathFile + ' > to < ' +
    remotePathFile + '>');

    // create stream content
    var readStream = fs.createReadStream(localPathFile);
    var writeStream = client.sftp.createWriteStream(remotePathFile);

    // Listen when transfer was done
    writeStream.on('close', function () {
      this.logger.info('[ Sftp.put ] - the file was correctly uploaed on path : < ' +
      remotePathFile + ' >');
      // success so resolve promise
      deferred.resolve(true);
      // close connection
      this.end(client);
    }.bind(this));

    // Listen if an error occuded during transfer
    writeStream.on('error', function (error) {
      this.logger.error('[ Sftp.put.ws ] - an error occured, more details : ',
      utils.obj.inspect(error));
      // reject error
      deferred.reject(error);
      // close connection
      this.end(client);
    }.bind(this));

    // Listen if an error occuded with local file
    readStream.on('error', function (error) {
      this.logger.error('[ Sftp.put.rs ] - an error occured, more details : ',
      utils.obj.inspect(error));
      // reject error
      deferred.reject(error);
      // close connection
      this.end(client);
    }.bind(this));

    // initiate transfer of file
    readStream.pipe(writeStream);
  }.bind(this)).catch(function (error) {
    // reject the error
    deferred.reject(error);
  });

  // return result of control flow
  return deferred.promise;
};

/**
 * Method to remove an existing file on ftp server
 *
 * @param  {Object} config the config to connect
 * @param  {Object} remotePathFile the path of the file to remove
 * @return {Object} promise of this method
*/
Sftp.prototype.delete = function (config, remotePathFile) {

  // create async process
  var deferred  = Q.defer();

  remotePathFile  = path.normalize(remotePathFile);

  // connect to the ftp
  this.connect(config).then(function (client) {

    this.logger.debug('[ Sftp.delete ] - delete the file < ' + remotePathFile + ' >');
    // remove the file
    client.sftp.unlink(remotePathFile, function (error) {
      // check if an error occured
      if (error) {
        this.logger.error('[ Sftp.delete ] - an error occured, more details : ' +
        utils.obj.inspect(error));
        // reject error
        deferred.reject(error);
      } else {
        this.logger.info('[ Sftp.delete ] - the file was deleted < ' + remotePathFile + ' >');
        // resolve the promise
        deferred.resolve(true);
      }

      // close the connection
      this.end(client);
    }.bind(this));
  }.bind(this)).catch(function (error) {
    // reject the error
    deferred.reject(error);
  });

  // return result of control flow
  return deferred.promise;
};

/**
 * Copy one file from the remote machine to the local machine
 *
 * @param  {Object} config the config to connect
 * @param  {Object} localPathFile the path of the file downloaded
 * @param  {Object} remotePathFile the path of th file to download
 * @return {Object} promise of this method
 */
Sftp.prototype.get = function (config, localPathFile, remotePathFile) {

  // create async process
  var deferred  = Q.defer();

  localPathFile   = path.normalize(localPathFile);
  remotePathFile  = path.normalize(remotePathFile);

  // connect to the ftp
  this.connect(config).then(function (client) {

    this.logger.debug('[ Sftp.get ] - try to download the file < ' + remotePathFile + ' > on ' +
    'remote to < ' + localPathFile + '>');

    // download the file
    client.sftp.fastGet(remotePathFile, localPathFile, {}, function (error) {
      // check if an error occured
      if (error) {
        this.logger.error('[ Sftp.get ] - an error occured, more details : ' +
        utils.obj.inspect(error));
        // reject the error
        deferred.reject(error);
      } else {
        this.logger.info('[ Sftp.get ] - the file was correctly downloaded to path < ' +
        localPathFile + ' >');
        // resolve the promise
        deferred.resolve(true);
      }

      // close the lien connection
      this.end(client);
    }.bind(this));
  }.bind(this)).catch(function (error) {
    // reject the error
    deferred.reject(error);
  });

  // return result of process
  return deferred.promise;
};

// Default export
module.exports = function (l) {
  // is a valid logger ?
  if (_.isUndefined(l) || _.isNull(l)) {
    logger.warning('[ Sftp.constructor ] - Invalid logger given. Use internal logger');
    // assign
    l = logger;
  }
  // default statement
  return new (Sftp)(l);
};

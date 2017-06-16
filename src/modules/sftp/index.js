'use strict';

var logger        = require('yocto-logger');
var _             = require('lodash');
var utils         = require('yocto-utils');
var Q             = require('q');
var fs            = require('fs');
var ClientSSH     = require('ssh2').Client;
var path          = require('path');
var async         = require('async');

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
  // set logger
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
 * If client exist use it and don't make an new connection
 *
 * @param  {Object} config the config to connect
 * @param  {Object} remotePathDir the path of folder to list
 * @param  {Object} client the sftp client if already connected
 * @return {Object} promise of this method
 */
Sftp.prototype.ls = function (config, remotePathDir, client) {

  client = client || false;
  // indicate if client was used
  var usedClient = false;
  var result = [];
  // create async process
  var deferred  = Q.defer();
  // normalize the path
  remotePathDir = path.normalize(remotePathDir);

  // control flow
  async.series([
    // check if already connect or should connect
    function (done) {
      // already connected ?
      if (client) {
        // set that client used already euxt
        usedClient = true;
        // end
        return done();
      }

      // connect to the ftp
      this.connect(config).then(function (c) {
        // set clent
        client = c;
        done();
      }.bind(this)).catch(function (error) {
        // reject the error
        done(error);
      });
    }.bind(this),
    // process
    function (done) {
      this.logger.debug('[ Sftp.ls ] - list file in folder : ', remotePathDir);
      // retrieve the list
      client.sftp.readdir(remotePathDir, function (error, list) {
        // check if an error occured
        if (error) {
          this.logger.error('[ Sftp.ls ] - an error occured when execute the list command, more ' +
          'details : ', utils.obj.inspect(error));

          // reject error
          return done(error);
        }
        this.logger.debug('[ Sftp.ls ] - list file command success');
        // resolve the file
        result = list;
        // success
        done();
      }.bind(this));
    }.bind(this)
  ], function (error) {
    // check if client was used
    if (!usedClient) {
      // close the connection because client was not used
      this.end(client);
    }

    // check error
    if (error) {
      // reject error
      return deferred.reject(error);
    }
    // success
    deferred.resolve(result);
  }.bind(this));

  // return result of control flow
  return deferred.promise;
};

/**
 * Method to check if an file exist in an folder
 *
 * @param  {Object} config the config to connect
 * @param  {Object} remotePathFile the path of the file to check if exits
 * @param  {Object} client the sftp client if already connected
 * @return {Object} promise of this method
 */
Sftp.prototype.fileExist = function (config, remotePathFile, client) {

  // create async process
  var deferred  = Q.defer();
  // normalize the path
  remotePathFile = path.normalize(remotePathFile);

  this.logger.info('[ Sftp.fileExist ] - check if the file exist : ', remotePathFile);

  // connect to the ftp
  this.ls(config, path.dirname(remotePathFile), client).then(function (list) {
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

/**
* Method to create folder into sftp
*
* @param  {Object} client the sftp client
* @param  {Object} path the path to create
* @return {Object} promise of this method
 */
Sftp.prototype.createFolder = function (client, path) {
  // create async process
  var deferred  = Q.defer();

  // check if folder already exist
  this.fileExist(null, path, client).then(function () {
    // folder not created bevause exist
    deferred.resolve(false);
  }.bind(this)).catch(function () {
    // create folder
    client.sftp.mkdir(path, function (error) {
      // check if an error occured
      if (error) {
        // reject error
        return deferred.reject(error);
      }
      // resolve the file
      deferred.resolve(path);
    }.bind(this));
  }.bind(this));
  // return result of process
  return deferred.promise;
};

/**
 * Method to handle the creating folder into sftp
 * Parent folder can be created like *mkdirp* command
 *
 * @param  {Object} config the config to connect
 * @param  {String} pathFolder folder to create
 * @param  {Boolean} parent indicate if parent folder should be created
 * @return {Object} promise of this method
 */
Sftp.prototype.mkdir = function (config, pathFolder, parent) {

  // create async process
  var deferred  = Q.defer();
  // normalize the path
  pathFolder = path.normalize(pathFolder);

  // folder to create, by default only one
  var folderToCreate = [ pathFolder ];

  // check if should create parent folder
  if (parent) {
    // parent folder should be created
    var pathTmp = '';
    // split each folder to create subfolder
    folderToCreate = (_.map(_.compact(_.split(pathFolder, '/')), function (p) {
      // return path to create
      return pathTmp += ('/' + p);
    }));
  }

  // connect to the ftp
  this.connect(config).then(function (client) {
    // control flow to create all folder in array
    async.eachSeries(folderToCreate, function (f, nextFolder) {
      this.logger.debug('[ Sftp.mkdir ] - create folder : ', f);
      // create folder
      this.createFolder(client, f).then(function (folderCreated) {

        // success
        this.logger.debug('[ Sftp.mkdir ] - ' + (!folderCreated ?
        ' folder already exist for path : ' : ' folder was created : ') + f);
        // create next folder
        nextFolder();
      }.bind(this)).catch(function (error) {
        // failed
        this.logger.error('[ Sftp.createFolder ] - an error occured , more ' +
        'details : ', utils.obj.inspect(error));
        // error
        nextFolder(error);
      }.bind(this));
    }.bind(this), function (error) {
      // close connection
      this.end(client);
      // check if has error
      if (error) {
        // reject error
        return deferred.reject(error);
      }

      this.logger.info('[ Sftp.mkdir ] - the folder was correctly created : ', pathFolder);
      // success
      deferred.resolve(pathFolder);
    }.bind(this));
  }.bind(this)).catch(function (error) {
    // reject the error
    deferred.reject(error);
  });

  // return result of control flow
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

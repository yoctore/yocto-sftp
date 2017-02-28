'use strict';

var logger = require('yocto-logger');
var _      = require('lodash');
var utils  = require('yocto-utils');
var Q      = require('q');
var joi    = require('joi');

/**
 *
 * Utility tool to automaticly generate sitemap
 *
 * @date : 2017/02/28
 * @author : Cédric BALARD <cedric@yocto.re>
 * @copyright : Yocto SAS, All right reserved
 *
 * @module Schema
 */
function Schema (l) {

  /**
  * Default logger instance
  *
  * @property logger
  * @type Object
  */
  this.logger = l;
}

/**
 * Method that use joi to validate an object with it schema
 *
 * @param  {Object} data the data to check
 * @param  {Object} schemaName the name of the schema to use
 * @return {Object} promise of this method
 */
Schema.prototype.validate = function (data, schemaName) {
  // create async process
  var deferred  = Q.defer();

  this.logger.debug('[ Schema.validate ] - validate schema for schemaName = ' + schemaName);
  // make joi validation
  var result = joi.validate(data, this.getSchema(schemaName));

  // check if joi validation failed
  if (_.isEmpty(result.error)) {

    // success
    deferred.resolve(result.value);
  } else {

    // Log error
    this.logger.error('[ Schema.validate ] - joi validation failed, details : ' +
    utils.obj.inspect(result.error));

    // reject error
    deferred.reject(result.error);
  }

  // return result of control flow
  return deferred.promise;
};

/**
 * Method that retrieve an schema
 *
 * @param  {String} schemaName the name of schema
 * @return {Object} return the joi object
 */
Schema.prototype.getSchema = function (schemaName) {

  // All schemas
  var schemas = {
    load  : joi.object().required().keys({
      host       : joi.string().optional().default('localhost'),
      port       : joi.number().integer().default(22),
      user       : joi.string().optional(),
      password   : joi.string().optional(),
      alogrithms : joi.object().optional(),
      agent      : joi.string().optional()
    }).unknown()
  };

  // return this schema
  return schemas[schemaName];
};

// Default export
module.exports = function (l) {
  // is a valid logger ?
  if (_.isUndefined(l) || _.isNull(l)) {
    logger.warning('[ Schema.constructor ] - Invalid logger given. Use internal logger');
    // assign
    l = logger;
  }
  // default statement
  return new (Schema)(l);
};

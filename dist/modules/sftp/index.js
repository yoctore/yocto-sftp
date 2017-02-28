/* yocto-sftp -  - V0.1.0 */
"use strict";function Sftp(a){this.logger=a}var logger=require("yocto-logger"),_=require("lodash"),utils=require("yocto-utils"),Q=require("q"),fs=require("fs"),ClientSSH=require("ssh2").Client,path=require("path");Sftp.prototype.connect=function(a){var b=Q.defer(),c=new ClientSSH;return this.logger.debug("[ Sftp.connect ] - connecting to server ..."),c.on("ready",function(){this.logger.debug("[ Sftp.connect.ready ] - connect successful to server"),c.sftp(function(a,d){a&&this.logger.error("[ Sftp.connect.sftp ] - connection establish to server, but sftp connection can't be established, details : ",utils.obj.inspect(a)),this.logger.info("[ Sftp.connect.sftp ] - connect successful to SFTP server"),b.resolve({client:c,sftp:d})}.bind(this))}.bind(this)),c.on("error",function(a){this.logger.error("[ Sftp.connect.error ] - an error occured ",utils.obj.inspect(a)),b.reject(a)}.bind(this)),c.connect(a),b.promise},Sftp.prototype.end=function(a){var b=Q.defer();try{this.logger.debug("[ Sftp.end ] - try to close the connection"),a.client.end(),this.logger.debug("[ Sftp.end ] - the connction was ended"),b.resolve(!0)}catch(a){this.logger.error("[ Sftp.end ] - an error occured when end the conection, more details : ",utils.obj.inspect(a)),b.reject(a)}return b.promise},Sftp.prototype.ls=function(a,b){var c=Q.defer();return b=path.normalize(b),this.connect(a).then(function(a){this.logger.debug("[ Sftp.ls ] - list file in folder : ",b),a.sftp.readdir(b,function(b,d){b&&(this.logger.error("[ Sftp.ls ] - an error occured when execute the list command, more details : ",utils.obj.inspect(b)),c.reject(b)),this.logger.debug("[ Sftp.ls ] - list file command success"),c.resolve(d),this.end(a)}.bind(this))}.bind(this)).catch(function(a){c.reject(a)}),c.promise},Sftp.prototype.fileExist=function(a,b){var c=Q.defer();return b=path.normalize(b),this.logger.info("[ Sftp.fileExist ] - check if the file exist : ",b),this.ls(a,path.dirname(b)).then(function(a){var d=_.find(a,{filename:path.basename(b)});return _.isUndefined(d)?(this.logger.warning("[ Sftp.fileExist ] - the file < "+b+" > don't exist on ftp"),c.reject("the file < "+b+" > don't exist on ftp")):(this.logger.info("[ Sftp.fileExist ] - the file < "+b+" > exist on server"),void c.resolve(d))}.bind(this)).catch(function(a){c.reject(a)}),c.promise},Sftp.prototype.put=function(a,b,c){var d=Q.defer();return b=path.normalize(b),c=path.normalize(c),this.connect(a).then(function(a){this.logger.debug("[ Sftp.put ] - try to put the file < "+b+" > to < "+c+">");var e=fs.createReadStream(b),f=a.sftp.createWriteStream(c);f.on("close",function(){this.logger.info("[ Sftp.put ] - the file was correctly uploaed on path : < "+c+" >"),d.resolve(!0),this.end(a)}.bind(this)),f.on("error",function(b){this.logger.error("[ Sftp.put.ws ] - an error occured, more details : ",utils.obj.inspect(b)),d.reject(b),this.end(a)}.bind(this)),e.on("error",function(b){this.logger.error("[ Sftp.put.rs ] - an error occured, more details : ",utils.obj.inspect(b)),d.reject(b),this.end(a)}.bind(this)),e.pipe(f)}.bind(this)).catch(function(a){d.reject(a)}),d.promise},Sftp.prototype.delete=function(a,b){var c=Q.defer();return b=path.normalize(b),this.connect(a).then(function(a){this.logger.debug("[ Sftp.delete ] - delete the file < "+b+" >"),a.sftp.unlink(b,function(d){d?(this.logger.error("[ Sftp.delete ] - an error occured, more details : "+utils.obj.inspect(d)),c.reject(d)):(this.logger.info("[ Sftp.delete ] - the file was deleted < "+b+" >"),c.resolve(!0)),this.end(a)}.bind(this))}.bind(this)).catch(function(a){c.reject(a)}),c.promise},Sftp.prototype.get=function(a,b,c){var d=Q.defer();return b=path.normalize(b),c=path.normalize(c),this.connect(a).then(function(a){this.logger.debug("[ Sftp.get ] - try to download the file < "+c+" > on remote to < "+b+">"),a.sftp.fastGet(c,b,{},function(c){c?(this.logger.error("[ Sftp.get ] - an error occured, more details : "+utils.obj.inspect(c)),d.reject(c)):(this.logger.info("[ Sftp.get ] - the file was correctly downloaded to path < "+b+" >"),d.resolve(!0)),this.end(a)}.bind(this))}.bind(this)).catch(function(a){d.reject(a)}),d.promise},module.exports=function(a){return(_.isUndefined(a)||_.isNull(a))&&(logger.warning("[ Sftp.constructor ] - Invalid logger given. Use internal logger"),a=logger),new Sftp(a)};
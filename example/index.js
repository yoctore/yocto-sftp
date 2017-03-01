var logger    = require('yocto-logger');
var sftp      = require('../src/')(logger);

var config = {
  host    : "10.10.10.10",
  port    : 22,
  user        : "toto",
  password    : "tata",
  algorithms  : {
    serverHostKey: [ 'ssh-rsa', 'ssh-dss' ],
  },
   agent: process.env.SSH_AUTH_SOCK
};

// path dir to list
var pathDir = '/toto/';

// // connect
// sftp.load(config).then(function () {
//   console.log('\n --> config success ... ');
//
//   sftp.connect().then(function(client) {
//     console.log('\n --> connect success ');
//
//     setTimeout(function () {
//       console.log('\n --> end client connection ...');
//       sftp.end(client);
//     }, 2000);
//   }).catch(function (error) {
//     console.log('\n --> connect failed ', error);
//   });
// }).catch(function (error) {
//   console.log('\n --> error : ', error);
// });

// // connect
// sftp.load(config).then(function () {
//   console.log('\n --> config success ... ');
//
//   sftp.ls(pathDir).then(function (list) {
//     console.log('\n --> ls success \n', list);
//
//   }).catch(function (error) {
//     console.log('\n --> ls failed ', error);
//   });
// }).catch(function (error) {
//   console.log('\n --> error : ', error);
// });

// var pathFile = '/toto/test1.png';
//
// // connect
// sftp.load(config).then(function () {
//   console.log('\n --> config success ... ');
//
//   sftp.fileExist(pathFile).then(function (list) {
//     console.log('\n --> ls success \n', list);
//
//   }).catch(function (error) {
//     console.log('\n --> ls failed ', error);
//   });
// }).catch(function (error) {
//   console.log('\n --> error : ', error);
// });

// var localPathFile   = 'totog';
// var remotePathFile  =  '/toto/test2.png';
//
// // connect
// sftp.load(config).then(function () {
//   console.log('\n --> config success ... ');
//
//   sftp.put(localPathFile, remotePathFile).then(function (list) {
//     console.log('\n --> ls success \n', list);
//
//   }).catch(function (error) {
//     console.log('\n --> ls failed ', error);
//   });
// }).catch(function (error) {
//   console.log('\n --> error : ', error);
// });

// var remotePathFile  =  '/toto/test2.png';
//
// // remove
// sftp.load(config).then(function () {
//   console.log('\n --> config success ... ');
//
//   sftp.delete(remotePathFile).then(function (list) {
//     console.log('\n --> ls success \n', list);
//
//   }).catch(function (error) {
//     console.log('\n --> ls failed ', error);
//   });
// }).catch(function (error) {
//   console.log('\n --> error : ', error);
// });

// var localPathFile   = '/toto';
// var remotePathFile  =  '/toto/test1.png';
//
// // connect
// sftp.load(config).then(function () {
//   console.log('\n --> config success ... ');
//
//   sftp.get(localPathFile, remotePathFile).then(function (list) {
//     console.log('\n --> ls success \n', list);
//
//   }).catch(function (error) {
//     console.log('\n --> ls failed ', error);
//   });
// }).catch(function (error) {
//   console.log('\n --> error : ', error);
// });

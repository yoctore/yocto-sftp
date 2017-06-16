[![NPM](https://nodei.co/npm/yocto-sftp.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/yocto-sftp/)

![alt text](https://david-dm.org/yoctore/yocto-sftp.svg "Dependencies Status")
[![Code Climate](https://codeclimate.com/github/yoctore/yocto-sftp/badges/gpa.svg)](https://codeclimate.com/github/yoctore/yocto-sftp)
[![Test Coverage](https://codeclimate.com/github/yoctore/yocto-sftp/badges/coverage.svg)](https://codeclimate.com/github/yoctore/yocto-sftp/coverage)
[![Issue Count](https://codeclimate.com/github/yoctore/yocto-sftp/badges/issue_count.svg)](https://codeclimate.com/github/yoctore/yocto-sftp)
[![Build Status](https://travis-ci.org/yoctore/yocto-sftp.svg?branch=master)](https://travis-ci.org/yoctore/yocto-sftp)

## Overview

This module is a part of yocto node modules for NodeJS.

Please see [our NPM repository](https://www.npmjs.com/~yocto) for complete list of available tools (completed day after day).

This module provide a simple sitemap generator based [sitemap-generator](https://www.npmjs.com/package/sitemap-generator).

## Motivation

Create an simple module that create a sftp client with SSH2 library.

## Specification

This is an wrapper of SSH2 library.
All methods handle automatic connect and close process to the ftp server.

### Ftp method implemented
  - get
  - delete
  - put
  - ls
  - mkdir (with mkdirp)


## Usage

### Basic configuration

> Configure module, configuration object will be check by an Joi schema

```javascript
var logger    = require('yocto-logger');
var sftp      = require('yocto-sftp')(logger);

var config = {
  host        : "10.10.10.10",
  port        : 22,
  user        : "test",
  password    : "pwd",
  algorithms  : {
    serverHostKey: [ 'ssh-rsa', 'ssh-dss' ],
  },
  agent       : process.env.SSH_AUTH_SOCK
};


// path dir to list
var pathDir = '/jumbodrive.re/ads/';

// connect
sftp.load(config).then(function () {
  console.log('\n --> config success ... ');
  // connect to client
  sftp.connect().then(function(client) {
    // the client is :
    // {  
    //    // ssh2 instance
    //    client : client,
    //    // sftp instance
    //    sftp   : sftp
    // }
    console.log('\n --> connect success ');

    setTimeout(function () {
      console.log('\n --> end client connection ...');
      // manually close the connect
      sftp.end(client);
    }, 2000);
  }).catch(function (error) {
    console.log('\n --> connect failed ', error);
  });
}).catch(function (error) {
  console.log('\n --> error : ', error);
});

```

### Get an document

> This method download an file from sftp server

```javascript

var localPathFile   = '/toto';
var remotePathFile  =  '/tata';

// connect
sftp.load(config).then(function () {
  console.log('\n --> config success ... ');

  sftp.get(localPathFile, remotePathFile).then(function (list) {
    console.log('\n --> ls success \n', list);

  }).catch(function (error) {
    console.log('\n --> ls failed ', error);
  });
}).catch(function (error) {
  console.log('\n --> error : ', error);
});

```

### List directory

> This method return an array of files description from ftp server

```javascript

var remotePathFOlder  =  '/tata/';

// connect
sftp.load(config).then(function () {
  console.log('\n --> config success ... ');

  sftp.ls(remotePathFOlder).then(function (list) {
    console.log('\n --> ls success \n', list);

  }).catch(function (error) {
    console.log('\n --> ls failed ', error);
  });
}).catch(function (error) {
  console.log('\n --> error : ', error);
});

```

### Delete an document

> This method remove an file in sftp server

```javascript

var remotePathFile  =  '/tata.png';

// connect
sftp.load(config).then(function () {
  console.log('\n --> config success ... ');

  sftp.delete(remotePathFile).then(function (list) {
    console.log('\n --> ls success \n', list);

  }).catch(function (error) {
    console.log('\n --> ls failed ', error);
  });
}).catch(function (error) {
  console.log('\n --> error : ', error);
});

```

### Put an document

> This method upload an file in sftp server

```javascript

var localPathFile   = '/toto';
var remotePathFile  =  '/tata';

// connect
sftp.load(config).then(function () {
  console.log('\n --> config success ... ');

  sftp.put(localPathFile, remotePathFile).then(function (list) {
    console.log('\n --> ls success \n', list);

  }).catch(function (error) {
    console.log('\n --> ls failed ', error);
  });
}).catch(function (error) {
  console.log('\n --> error : ', error);
});

```

### Check if an file exit on ftp server

> This Check if an file exit on ftp server

```javascript

var remotePathFile  =  '/tata';

// connect
sftp.load(config).then(function () {
  console.log('\n --> config success ... ');

  sftp.fileExist(remotePathFile).then(function (list) {
    console.log('\n --> ls success \n', list);

  }).catch(function (error) {
    console.log('\n --> ls failed ', error);
  });
}).catch(function (error) {
  console.log('\n --> error : ', error);
});

```

### Create folder and its own parent if speciefied

> This Create folder into sftp

```javascript

var remotePathFOlder  =  '/toto/tata/titi/tutu';
// If true parent folder will be created otherwise none
var createParent = true;

// connect
sftp.load(config).then(function () {
  console.log('\n --> config success ... ');

  sftp.mkdir(remotePathFile, createParent).then(function (list) {
    console.log('\n --> create success \n', list);

  }).catch(function (error) {
    console.log('\n --> create failed ', error);
  });
}).catch(function (error) {
  console.log('\n --> error : ', error);
});

```

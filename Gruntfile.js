'use strict';

module.exports = function (grunt) {
  // init config
  grunt.initConfig({
    // default package
    pkg       : grunt.file.readJSON('package.json'),

    // hint our app
    yoctohint : {
      options  : {},
      all      : [ 'src/***', 'Gruntfile.js' ]
    },

    // Uglify our app
    uglify    : {
      options : {
        banner  : '/* <%= pkg.name %> - <%= pkg.description %> - V<%= pkg.version %> */\n'
      },
      api     : {
        files : [ {
          expand  : true,
          cwd     : 'src',
          src     : '**/*.js',
          dest    : 'dist'
        } ]
      }
    },

    // test our app
    mochacli  : {
      options : {
        'reporter'       : 'spec',
        'inline-diffs'   : false,
        'no-exit'        : true,
        'force'          : false,
        'check-leaks'    : true,
        'bail'           : false
      },
      all     : [ 'tests/unit/*.js' ]
    },
    mochaTest :  {
      unit  : {
        options : {
          reporter          : 'spec',
          quiet             : false, // Optionally suppress output to standard out (defaults to false)
          clearRequireCache : false, // Optionally clear the require cache before running tests (defaults to false)
          noFail            : false // Optionally set to not fail on failed tests (will still fail on other errors)
        },
        src     : [ 'test/*.js' ]
      }
    }
  });

  // load tasks
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('yocto-hint');

  // register tasks
  grunt.registerTask('hint', [ 'yoctohint' ]);
  grunt.registerTask('test', 'mochaTest');
  grunt.registerTask('build', [ 'yoctohint', 'uglify' ]);
  grunt.registerTask('default', [ 'build', 'test' ]);
};

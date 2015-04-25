module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    concat: {
      options: {
        // define a string to put between each file in the concatenated output
        separator: ';'
        // ,
        // ignores: [
        //   'public/dist/**/*.js'
        // ]
      },
      dist: {
        // the files to concatenate
        src: ['public/**/*.js'],
        // the location of the resulting JS file
        dest: 'public/dist/<%= pkg.name %>.js'
      }
    },

    mochaTest: {
      test: {

        options: {
          reporter: 'spec',
          force: 'true'
        },
        src: ['test/**/*.js']
      }
    },

    nodemon: {
      dev: {
        script: 'server.js'
      }
    },

    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n',
        ignores: [
          'public/lib/**/*.js',
          'public/dist/**/*.js'
        ]
      },
      dist: {
        files: {
          'public/dist/<%= pkg.name %>.min.js': ['<%= concat.dist.dest %>']
        }
      }
    },

    jshint: {
      files: ['Gruntfile.js', 'public/**/*.js', 'test/**/*.js', 'app/**/*.js'],
      options: {
        force: 'true',
        jshintrc: '.jshintrc',
        ignores: [
          'public/lib/**/*.js',
          'public/dist/**/*.js'
        ]
      }
    },

    cssmin: {
      target: {
        files: [{
          expand: true,
          cwd: 'public/',
          src: ['*.css', '!*.min.css'],
          dest: 'public/dist',
          ext: '.min.css'
        }]
      }
    },

    watch: {
      scripts: {
        files: [
          'public/client/**/*.js',
          'public/lib/**/*.js',
        ],
        tasks: [
          'concat',
          'uglify'
        ]
      },
      css: {
        files: 'public/*.css',
        tasks: ['cssmin']
      }
    },

    shell: {

        target: {
            command: 'git push azure master'
        }
        //probably something goes in here

    },
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-nodemon');

  grunt.registerTask('server-dev', function (target) {
    // Running nodejs in a different process and displaying output on the main console
    var nodemon = grunt.util.spawn({
         cmd: 'grunt',
         grunt: true,
         args: 'nodemon'
    });
    nodemon.stdout.pipe(process.stdout);
    nodemon.stderr.pipe(process.stderr);

    grunt.task.run([ 'watch' ]);
  });

  ////////////////////////////////////////////////////
  // Main grunt tasks
  ////////////////////////////////////////////////////

  grunt.registerTask('test', [
    'mochaTest'
  ]);

  grunt.registerTask('build', [
    //something goes in here
    'concat',
    'uglify',
    'cssmin',
    'mochaTest',
    'shell'

  ]);

  // grunt.registerTask('upload', function(n) {
  //   if(grunt.option('prod')) {
  //     // add your production server task here
  //   } else {
  //     grunt.task.run([ 'server-dev' ]);
  //   }
  // });

  grunt.registerTask('deploy', function(n) {
    // add your deploy tasks here
    if(grunt.option('prod')) {
      grunt.task.run([ 'build' ]);


    } else {
      grunt.task.run([ 'server-dev' ]);
    }
  } );
// grunt.registerTask('deploy', [
// +    // add your deploy tasks here
// +  ]);


};

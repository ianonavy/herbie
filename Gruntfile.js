module.exports = function(grunt) {

  grunt.initConfig({
    nodewebkit: {
      options: {
        version: '0.11.2',
        buildDir: './build', // Where the build version of my node-webkit app is saved
        platforms: ['linux'] // These are the platforms that we want to build
      },
      src: ['./**/*'] // Your node-webkit app
    },
  });

  grunt.loadNpmTasks('grunt-node-webkit-builder');
  grunt.registerTask('default', ['nodewebkit']);

};
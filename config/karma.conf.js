module.exports = function(config) {
  config.set({
    basePath : '../',

    files: [
      'public/angular-*/angular.js',
      'public/angular-*/angular-*.js',
      'public/devnull.js',
      'test/unit/**/*.js'
    ],

    exclude: [
      'public/angular-*/angular-loader.js',
      'public/angular-*/*.min.js',
      'public/angular-*/angular-scenario.js'
    ],

    autoWatch: true,

    frameworks: ['jasmine'],

    plugins: [
      'karma-junit-reporter',
      'karma-chrome-launcher',
      'karma-firefox-launcher',
      'karma-script-launcher',
      'karma-jasmine'
    ],

    junitReporter: {
      outputFile: 'test_out/unit.xml',
      suite: 'unit'
    }
  });
}

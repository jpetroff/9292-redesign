global.__src = __dirname
global.__production = false
global.__injection = false
global.__secure = false

var gulp = require('gulp')

require('./.build/gulp-build')
require('./.build/gulp-server')
require('./.build/gulp-pages')

gulp.task('start', ['build','server'])
gulp.task('build', ['js-libs', 'js-build', 'less', 'pages', 'assets'])


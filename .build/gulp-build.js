var gulp = require('gulp')
var source = require('vinyl-source-stream')
var uglify = require('gulp-uglify')
var rename = require('gulp-rename')
var concat = require('gulp-concat')
var LessAutoprefix = require('less-plugin-autoprefix')
var sourcemaps = require('gulp-sourcemaps')
var less = require('gulp-less')
var cache = require('gulp-cached')
var vueSplit = require('gulp-vuesplit').default
var order = require('gulp-order')
var remember = require('gulp-remember')
var vueExtract = require('./gulp-vue-extract')
var wrapjs = require('./gulp-jswrapper')
var print = require('gulp-print')

var autoprefix = new LessAutoprefix({ browsers: ['last 2 versions']})

gulp.task('js-libs', function(){
	var base = './src/libs/js/'

	gulp.src([
			base + 'underscore-min.js',
			base + 'vue.min.js',
			// base + 'vuelidate.min.js',
			// base + 'validators.min.js',
			base + 'hammer.min.js',
			base + 'vue-touch.min.js'
		])
		.pipe(concat('libs.js'))
		.pipe(gulp.dest('./public/js'))

});

gulp.task('js-build', function(){
	gulp.src(['src/js/*.js', 'src/components/*.vue'])
		.pipe(vueExtract({
			type:'script',
			storeTemplate: 'inline'
		}))
		.pipe(cache('js-build'))
		.pipe(print())
		.pipe(wrapjs())
		.pipe(remember('js-build'))
		.pipe(order([
			'js/preamble.js',
			'components/*.js',
			'js/init.js',
			'js/main.js'
		], {base: './src'}))
		.pipe(concat('app.js'))
		.pipe(gulp.dest('public/js'))

});

gulp.task('less', function(){
	gulp.src(['src/less/**/*.less', 'src/components/*.vue', 'src/libs/css/normalize.css'])
		.pipe(cache('less'))
		.pipe(print())
		.pipe(vueExtract({
			type:'style'
		}))
		.pipe(sourcemaps.init())
		.pipe(less({
			paths: ['.'],
			plugins: [autoprefix]
		}))
		.pipe(remember('less'))
		.pipe(order([
			'libs/css/normalize.css',
			'components/*.less',
			'less/**/*.less'
		],{base: './src'}))
		.pipe(concat('main.css'))
		.pipe(sourcemaps.write())
		.pipe(gulp.dest('./public/css'));
})

gulp.task('assets', function() {
	gulp.src('assets/**/*.*')
		.pipe(cache('assets'))
		.pipe(gulp.dest('./public'))
})



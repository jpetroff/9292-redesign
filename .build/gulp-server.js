var gulp = require('gulp')
var express = require('express')
var livereload = require('livereload')
var path = require('path')
var https = require('https')
var fs = require('fs')
var requestify = require('requestify')

var changeLog = function(watcher, name) {
	watcher.on('change', function(ev) {
		console.log('['+name+'] → File '+path.basename(ev.path)+' was '+ev.type)
	})
}

gulp.task('server', function() {
	var lr = livereload.createServer()
	lr.watch(__src + '/public')

	var wJSLibs = gulp.watch('./src/libs/js/*.js', ['js-libs'])
	changeLog(wJSLibs, 'js-libs')

	var wJSBuild = gulp.watch(['./src/js/**/*.js', './src/**/*.vue'], ['js-build'])
	changeLog(wJSBuild, 'js-build')

	var wLess = gulp.watch(['./src/less/**/*.less', './src/**/*.vue'], ['less'])
	changeLog(wLess, 'less')

	var wPages = gulp.watch('./src/pages/*.html', ['pages'])
	changeLog(wPages, 'pages')

	var wAssets = gulp.watch('./assets/*.*', ['assets'])
	changeLog(wAssets, 'assets')

	var app = express();

	app.use(express.static('./public'))

	app.get('/', function(req, res) {
		res.sendFile(__src + '/public/pages/index.html')
	})

	app.get('/api/:data', function(req, res) {
		var apiRequest = req.originalUrl.replace('/api/','');
		console.log(apiRequest);
		requestify.get('https://api.9292.nl/0.1/'+apiRequest).then(function(data) {
			console.log('received');
			res.setHeader('Access-Control-Allow-Origin', '*');
			res.setHeader('Content-Type', 'application/json');
			if (!data.body) console.log('ERROR EMPTY DATA');
			res.send(data.body);
		}, function(err){
			console.log(err);

		});
	})

	if (__secure) {
		app = https.createServer({
			cert: fs.readFileSync(__src+'/server.crt').toString(),
			key: fs.readFileSync(__src+'/server.key').toString(),
			passphrase: 'localhost'
		}, app).listen('8000', '0.0.0.0', function() {
			console.log('express has took off')
		})
	} else {
		app.listen('8000', '0.0.0.0', function() {
			console.log('express has took off')
		})
	}
})
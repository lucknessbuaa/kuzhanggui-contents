var fs = require('fs');
var gulp = require('gulp');
var util = require('gulp-util');
var changed = require('gulp-changed');
var imagemin = require('gulp-imagemin');
var nodemon = require('gulp-nodemon');
var tinypng = require('gulp-tinypng');
var sass = require('gulp-sass');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var base64 = require('gulp-base64');
var browserify = require('browserify');
var source = require('vinyl-source-stream')
var stringify = require('stringify');
var CombinedStream = require('combined-stream');

try {
    var notify = require('display-notification');
} catch (e) {
    var notify = function() {};
}

function browserifyStream(entry) {
    var b = browserify(entry);
    b.transform({
        global: true
    }, 'brfs')
    b.transform({
        global: true
    }, 'browserify-shim')
    return b.bundle();
}

function onError(fn) {
    return function(err) {
        util.log(err);
        notify({
            title: 'Error',
            subtitle: 'fail to compiling scripts',
            text: err,
            sound: 'Bottle'
        });

        if (fn) {
            fn.call(err);
        }
    }
}

gulp.task('scripts', function() {
    var stream = CombinedStream.create();
    stream.append(fs.createReadStream('assets/components/jquery/jquery.js'));
    stream.append(fs.createReadStream('assets/components/bootstrap/dist/js/bootstrap.js'));
    stream.append(browserifyStream('./browser/contents.js'));
    return stream.pipe(fs.createWriteStream('assets/js/contents.js'))
});

/*
gulp.task('sass', function() {
    return gulp.src("scss/*.scss")
        .pipe(sass({
            errLogToConsole: true
        }))
        .pipe(base64({
            baseDir: 'public/css',
            maxImageSize: 48 * 1024 // 48k
        }))
        .pipe(gulp.dest("public/css"));
});

gulp.task('image-png', function() {
    return gulp.src("images/*.png")
        .pipe(changed('public/img'))
        .pipe(tinypng('9kl3nT2f8qC-AaApBVXDeQt-37ArLMNs'))
        .on('error', console.error)
        .pipe(gulp.dest("public/img"));
});

gulp.task('image-other', function() {
    return gulp.src("images/*.{jpg,jpeg,gif}")
        .pipe(changed('public/img'))
        .pipe(imagemin({
            progressive: true
        }))
        .pipe(gulp.dest("public/img"));
});

gulp.task("watch-scripts", function() {
    gulp.watch(["public/index.js", "package.json"], ["scripts"]);
});

gulp.task("watch-images", function() {
    gulp.watch("images/*", ["image-png", "image-other"]);
});

gulp.task("watch-sass", function() {
    gulp.watch(["scss/*", "img/*"], ["sass"]);
});

gulp.task("watch", ["watch-sass", "watch-images", "watch-scripts"]);
*/

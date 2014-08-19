var gulp = require("gulp");
var less = require("gulp-less");
var async = require("async");
var rjs = require("requirejs");
var _ = require("underscore");

var pkgs = require("./pkg");
pkgs.baseUrl = './assets';

gulp.task("less", function() {
    return gulp.src("assets/less/*.less")
        .pipe(less({
            compress: true,
            paths: ["assets", "assets/components", "assets/less"]
        }))
        .on("error", console.error)
        .pipe(gulp.dest("assets/css"));
});

gulp.task('rjs', function() {
    async.eachSeries(['js/shake/index', 'js/shake/lottery','js/shake/rank'], function(pkg, cb) {
        console.log(pkg);
        rjs.optimize(_.extend(pkgs, {
            name: pkg,
            optimize: "none",
            out: 'assets/' + pkg + ".bundle.js"
        }), function() {
            console.log(pkg, "done!");
            cb();
        }, function(err) {
            console.log(pkg, "error!");
            console.log(err);
            cb(err);
        });
    }, function(err) {
        callback(err);
    });
});

gulp.task("watch-less", function() {
    return gulp.watch("assets/less/**/*.less", ["less"]);
});

gulp.task("watch", ["watch-less"]);

var gulp = require('gulp');
var gutil = require('gulp-util');
var browserSync = require('browser-sync');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');

var sass = require('gulp-sass');
var browserify = require('browserify');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var cdnizer = require('gulp-cdnizer');


gulp.task('js', async function () {
    var b = browserify(
        ['static/web/js/app.js', 'static/web/js/controllers.js', 'static/web/js/services.js'],
        {
            debug: true,
            // => true for discify: './node_modules/disc/bin/discify static/web/js/windmobile.js > discify.html'
            fullPaths: false
        }
    );

    return b.bundle()
        // http://stackoverflow.com/questions/23161387/catching-browserify-parse-error-standalone-option
        .on('error', function (err) {
            gutil.log(err);
            this.emit('end');
        })
        .pipe(source('windmobile.js'))
        .pipe(buffer())
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(gutil.env.production ? uglify() : gutil.noop())
        .on('error', gutil.log)
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('static/web/js/'));
});

gulp.task('sass', async function () {
    gulp.src('src/scss/*.*')
        .pipe(sourcemaps.init())
        .pipe(sass({
            outputStyle: 'compressed'
        }).on('error', sass.logError))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('static/web/css/'));
});

gulp.task('html', async function () {
    gulp.src('src/html/**/*.html')
        .pipe(gutil.env.production ?
            cdnizer({
                defaultCDNBase: '//files-windsmobi.netdna-ssl.com',
                allowRev: true,
                allowMin: true,
                files: [
                    '/static/web/js/windmobile.js',
                    '/static/web/css/windmobile.css',
                    '/static/web/manifest.json',
                    '/static/web/img/*.*'
                ]
            }) :
            gutil.noop())
        .pipe(gulp.dest('static/web/'));
});

gulp.task('server', function (done) {
    browserSync.init({
        server: {
            baseDir: "./",
            index: "/static/web/stations.html"
        }
    });
    gulp.watch("static/web/css/**", browserSync.reload);
    //  gulp.watch("template/assets/scss/**/*.scss", browserSync.reload);
    gulp.watch("static/web/js/**", browserSync.reload);
    gulp.watch("static/web/**",browserSync.reload);
    done();
});

function reload(done) {
    server.reload();
    done();
  }

gulp.task('default', gulp.series('js', 'sass', 'html','server'));

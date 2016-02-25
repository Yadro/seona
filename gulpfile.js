var gulp = require('gulp');
var ts = require('gulp-typescript');
var sourcemaps = require('gulp-sourcemaps');
var project = ts.createProject('./tsconfig.json', {
    typescript: require('typescript')
});

gulp.task('compile', function () {
    var result = gulp.src('src/**/*.{ts,tsx}')
        .pipe(sourcemaps.init())
        .pipe(ts(project));

    return result.js
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('build'));
});

gulp.task('copy', function () {
    return gulp.src('src/**/*.js')
        .pipe(gulp.dest('build'));
});

gulp.task('default', ['compile', 'copy'], function() {
    gulp.watch('src/**/*.{ts,tsx}', function() {
        gulp.run('compile');
    });
    gulp.watch('src/**/*.js', function() {
        gulp.run('copy');
    });
});

var gulp = require('gulp');
var typescript = require('typescript');
var ts = require('gulp-typescript');
var project = ts.createProject('./tsconfig.json', {typescript: typescript});

gulp.task('compile', function () {
    return gulp.src('src/**/*.{ts,tsx}')
        .pipe(ts(project))
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

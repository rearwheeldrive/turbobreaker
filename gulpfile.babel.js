import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import {Instrumenter} from 'babel-istanbul';
import tapSpec from 'tap-spec';

const $ = gulpLoadPlugins();

gulp.task('build', () =>
  gulp.src('src/**/*.js')
    .pipe($.babel())
    .pipe(gulp.dest('lib'))
);

gulp.task('lint', () =>
  gulp.src(['src/**/*.js', 'gulpfile.babel.js'])
    .pipe($.eslint())
    .pipe($.eslint.format())
    .pipe($.eslint.failOnError())
);

gulp.task('tape', done => {
  gulp.src('src/**/*.js')
    .pipe($.istanbul({
      instrumenter: Instrumenter
    })) // Covering files
    .pipe($.istanbul.hookRequire()) // Force `require` to return covered files
    .on('finish', () => {
      gulp.src(['test/**/*.js'])
        .pipe($.tape())
        .pipe($.istanbul.writeReports()) 
        .pipe($.istanbul.enforceThresholds({ thresholds: { global: 0 } })) 
        .on('end', done)
    })
});

gulp.task('test', ['lint', 'tape']);

gulp.task('test:watch', () => 
  gulp.watch(['src/**/*.js', 'test/**/*.test.js'], ['test'])
);

gulp.task('default', ['build']);
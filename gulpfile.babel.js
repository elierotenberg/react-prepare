import 'source-map-support/register';
import babel from 'gulp-babel';
import gulp from 'gulp';
import sourcemaps from 'gulp-sourcemaps';
import eslint from 'gulp-eslint';
import mocha from 'gulp-mocha';
import rimraf from 'rimraf';

const src = ['src/**/*.js'];
const tests = ['dist/**/*.spec.js'];

gulp.task('lint', () =>
  gulp.src(src)
    .pipe(eslint())
    .pipe(eslint.format())
);

gulp.task('clean', (cb) =>
  rimraf('dist', cb)
);

gulp.task('build', ['lint'], () =>
  gulp.src(src)
    .pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('dist'))
);

gulp.task('test', ['lint', 'clean', 'build'], () =>
  gulp.src(tests, { read: false })
    .pipe(mocha())
);

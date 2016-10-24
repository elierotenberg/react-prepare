import babel from 'gulp-babel';
import gulp from 'gulp';
import eslint from 'gulp-eslint';
import mocha from 'gulp-mocha';
import rimraf from 'rimraf';

const src = ['src/**/*.js'];
const tests = ['dist/tests/*.spec.js'];

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
    .pipe(babel())
    .pipe(gulp.dest('dist'))
);

gulp.task('test', ['lint', 'build'], () =>
  gulp.src(tests, { read: false })
    .pipe(mocha())
);

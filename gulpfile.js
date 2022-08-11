// Импорт пакетов
const gulp = require('gulp')
const sass = require('gulp-sass')(require('sass'))
const rename = require('gulp-rename')
const cleanCSS = require('gulp-clean-css')
const babel = require('gulp-babel')
const uglify = require('gulp-uglify')
const concat = require('gulp-concat')
const sourcemaps = require('gulp-sourcemaps')
const autoprefixer = require('gulp-autoprefixer')
const imagemin = require('gulp-imagemin')
// const htmlmin = require('gulp-htmlmin')
const size = require('gulp-size')
const gulppug = require('gulp-pug')
const newer = require('gulp-newer')
const browsersync = require('browser-sync').create()
const del = require('del')
const svgSprite = require('gulp-svg-sprite')
const	svgmin = require('gulp-svgmin')
const	cheerio = require('gulp-cheerio')
const	replace = require('gulp-replace')


// Пути исходных файлов app и пути к результирующим файлам dest
const paths = {
  html: {
    src: ['app/*.html', 'app/**/*.pug'],
    dest: 'build/'
  },
  styles: {
    all: ['app/sass/**/*.sass', 'app/scss/**/*.scss', 'app/css/**/*.css'],
    src: ['app/sass/*.sass', 'app/scss/*.scss', 'app/css/*.css'],
    dest: 'build/css/'
  },
  scripts: {
    src: 'app/js/**/*.js',
    dest: 'build/js/'
  },
  images: {
    src: ['app/images/*.jpg','app/images/*.png'],
    dest: 'build/images/'
  },
  svg: {
    src: 'app/images/svg/*.svg',
    dest: 'build/images/'
  }
}

// Очистить каталог build, удалить все кроме изображений
function clean() {
  return del(['build/*', '!build/images'])
}

// Обработка html и pug
function html() {
  return gulp.src(paths.html.src)
  .pipe(gulppug({pretty: true}))
  // .pipe(htmlmin({ collapseWhitespace: false }))
  .pipe(size({
    showFiles:true
  }))
  .pipe(gulp.dest(paths.html.dest))
  .pipe(browsersync.stream())
}

// Обработка препроцессоров стилей
function styles() {
  return gulp.src(paths.styles.src)
  .pipe(sourcemaps.init())
  .pipe(sass().on('error', sass.logError))
  // .pipe(autoprefixer(['last 5 versions', '> 1%', 'ie 10'], { cascade: false }))
  // .pipe(cleanCSS({
  //   level: 2
  // }))
  .pipe(concat('main.min.css'))
  .pipe(rename({
    basename: 'style',
    suffix: '.min'
  }))
  .pipe(sourcemaps.write('.'))
  .pipe(size({
    showFiles:true
  }))
  .pipe(gulp.dest(paths.styles.dest))
  .pipe(browsersync.stream())
}

// Обработка Java Script
function scripts() {
  return gulp.src(paths.scripts.src)
  .pipe(sourcemaps.init())
  .pipe(babel({
    presets: ['@babel/env']
  }))
  // .pipe(uglify())
  .pipe(concat('main.min.js'))
  .pipe(sourcemaps.write('.'))
  .pipe(size({
    showFiles:true
  }))
  .pipe(gulp.dest(paths.scripts.dest))
  .pipe(browsersync.stream())
}

// Сжатие изображений
function img() {
  return gulp.src(paths.images.src)
  .pipe(newer(paths.images.dest))
  .pipe(imagemin({
    progressive: true
  }))
  .pipe(size({
    showFiles:true
  }))
  .pipe(gulp.dest(paths.images.dest))
}

// Сжатие и создание svg sprite
function svg() {
  return gulp.src(paths.svg.src)
  .pipe(svgmin({
    js2svg: {
      pretty: true
    }
  }))
  .pipe(cheerio({
    run: function ($) {
      $('[fill]').removeAttr('fill');
      $('[stroke]').removeAttr('stroke');
      $('[style]').removeAttr('style');
    },
    parserOptions: {xmlMode: true}
  }))
  .pipe(replace('&gt;', '>'))
  .pipe(svgSprite({
    mode: {
      symbol: {
        sprite: "../sprite.svg"
      }
    },
  }))
  .pipe(size({
    showFiles:true
  }))
  .pipe(gulp.dest(paths.images.dest))
}

// Отслеживание изменений в файлах и запуск лайв сервера
function watch() {
  browsersync.init({
    server: {
        baseDir: "./build"
    }
  })
  gulp.watch(paths.html.dest).on('change', browsersync.reload)
  gulp.watch(paths.html.src, html)
  gulp.watch(paths.styles.all, styles)
  gulp.watch(paths.scripts.src, scripts)
  gulp.watch(paths.images.src, img)
  gulp.watch(paths.svg.src, svg)
}

// Таски для ручного запуска с помощью gulp clean, gulp html и т.д.
exports.clean = clean

exports.html = html
exports.styles = styles
exports.scripts = scripts
exports.img = img
exports.svg = svg
exports.watch = watch

// Таск, который выполняется по команде gulp
exports.default = gulp.series(clean, html, gulp.parallel(styles, scripts, img, svg), watch)
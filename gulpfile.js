const gulp = require('gulp');
const less = require('gulp-less')
const rename = require('gulp-rename')
const sass = require('gulp-sass')(require('sass'));
const cleaneCSS = require('gulp-clean-css')
const babel = require('gulp-babel')
const uglify = require('gulp-uglify')
const concat = require('gulp-concat')
const autoprefixer = require('gulp-autoprefixer')
const imagemin = require('gulp-imagemin')
const htmlmin = require('gulp-htmlmin')
const size = require('gulp-size')
const newer = require('gulp-newer')
const browsersync = require('browser-sync')
const del = require('del')
const sourcemap = require('gulp-sourcemaps');
const ttf2woff2 = require('gulp-ttf2woff2');
const version = require('gulp-version-number')
const groupMedia = require('gulp-group-css-media-queries')
//const webpcss = require('gulp-webpcss')
const fs = require('fs')
const fonter = require('gulp-fonter') 
//const webp = require('gulp-webp')

const paths = {
    styles: {
        src: ['src/css/**/*.less', 'src/css/**/*.sass', 'src/css/**/*.scss'],
        dest: 'dist/css'
    },
    scripts: {
        src: 'src/js/**/*.js',
        dest: 'dist/js'
    },
    images: {
        src: 'src/img/**/*.{jpg,jpeg,png,gif,webp}',
        dest: 'dist/img',
    },
    svg: {
        src: 'src/img/**/*.svg',
        dest: 'dist/img',
    },
    htmls: {
        src: 'src/*.html',
        dest: 'dist'
    },
    fonts: {
        src: 'src/font/**/*',
        dest: 'dist/font/'
    },
    video: {
        src: 'src/video/**',
        dest: 'dist/video/'
    }
}
/*Очистка  dist*/
function clean() {
    return del(['dist/*', '!dist/img'])
}
/*Запуск сервера - не работает*/
// function stream() {
//     return gulp.src(paths.fonts.src)
//     .pipe(gulp.dest(paths.fonts.dest))
//     .pipe(browsersync.stream())
// }
/*шрифты -  преобразование в ttf. woff. woff2  перенос  в distr/font*/
function fonts() {
    otfToTtf()
    ttfToWoff()
    return gulp.src(paths.fonts.src)
        .pipe(gulp.dest(paths.fonts.dest))
}
/*Преобразование шрифта otf в ttf*/
function otfToTtf() {
    return gulp.src('src/font/**/*.otf')
        /*конвертация  otf в ttf */
        .pipe(fonter({
            formats: ['ttf']
        }))
        .pipe(gulp.dest('src/font/'))
    }        

/*Преобразование шрифта ttf в woff/woff2*/
function ttfToWoff() {
    return gulp.src('src/font/*.ttf')
        /*конвертация  в woff */
        .pipe(fonter({
            formats: ['woff']
        }))
        .pipe(gulp.dest('dist/font/'))
         /*конвертация  в woff2 */
        .pipe(gulp.src('src/font/*.ttf'))
        .pipe(ttf2woff2())
        .pipe(gulp.dest('dist/font/'))
}
/*видео - пока только перенос в distr/video*/
function video() {
    return gulp.src(paths.video.src)
        .pipe(gulp.dest(paths.video.dest))
}
/*компиляция стилей из less/sass-scss в css с переименованием*/
function styles() {
    return gulp.src(paths.styles.src)
        .pipe(sourcemap.init())
        //.pipe(less()) // при использовании less
        .pipe(sass().on('error', sass.logError))
        .pipe(groupMedia())
        // .pipe(webpcss( // продолжить настройку по фрилансеру
        //     {
        //         webpClass: ".webp",
        //         noWebpClass: ".no-webp"
        //     }
        // ))
        .pipe(autoprefixer({
            grid: true,
            overrideBrowserslist: ["last 3 versions"],
            cascade: false
        }))
       
        //.pipe(gulp.dest(paths.styles.dest))
        .pipe(cleaneCSS())
        .pipe(concat('style.min.css'))
        .pipe(sourcemap.write('.'))
        .pipe(size({
            showFiles: true,
        }))
        .pipe(gulp.dest(paths.styles.dest))
} 
/*Обработка скриптов*/
function scripts() {
    return gulp.src(paths.scripts.src)
    .pipe(sourcemap.init())
    .pipe(babel({
        presets: ['@babel/preset-env']
    }))   
    .pipe(uglify())
    .pipe(concat('main.min.js')) 
    .pipe(sourcemap.write('.'))
    .pipe(size({
        showFiles: true,
    }))
    .pipe(gulp.dest(paths.scripts.dest))
}
/*сжатие изображений, cgg - без сжатия*/
function img() {
    return gulp.src(paths.images.src)
    .pipe(newer(paths.images.dest))
    //.pipe(webp())
    //.pipe(gulp.dest(paths.images.dest))
    //.pipe(gulp.src(paths.images.src))
    //.pipe(newer(paths.images.dest))
    .pipe(imagemin({
        progressive: true,
        svgoPligins: [{ removeViewBox: false}],
        interlaced: true,
        optimizationLevel: 3,
    }))
    .pipe(gulp.dest(paths.images.dest))
    .pipe(size({
        showFiles: true,
    }))
    .pipe(gulp.src(paths.svg.src))
    .pipe(gulp.dest(paths.images.dest))
}  
/*Минимизация Html*/
function html() {
    return gulp.src(paths.htmls.src)
    .pipe(htmlmin({ collapseWhitespace: true }))
    //.pipe(concat('index.min.html'))
    .pipe(size({
        showFiles: true,
    }))
    .pipe(
        version({
            'value': '%DT%',
            'append': {
                'key': '_v',
                'cover': 0,
                'to': [
                    'css',
                    'js',
                ]
            },
            'output': {
                'file': 'gulp/version.json'
            }
        })
    )
    .pipe(gulp.dest(paths.htmls.dest))
}
/*Отслеживание изменений */
function watch() {
    gulp.watch(paths.htmls.src, html)
    gulp.watch(paths.styles.src, styles)
    gulp.watch(paths.scripts.src, scripts)
    gulp.watch(paths.images.src, img)
    gulp.watch(paths.fonts.src, fonts)
    gulp.watch(paths.video.src, video)
}
/*запуск сценария действий*/
const build = gulp.series(clean, fonts, html, gulp.parallel(styles, scripts, img, video), watch)

//exports.stream = stream
exports.fonts = fonts
exports.video = video
exports.clean = clean
exports.img = img
exports.html = html
exports.styles = styles
exports.scripts = scripts
exports.watch = watch
exports.build = build
exports.default = build

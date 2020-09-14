'use strict';
 
//npm install gulp-babel @babel/core @babel/preset-env

var gulp = require('gulp'),
    sass = require('gulp-dart-sass'),
    watcher = require('gulp-watch'),
    plumber = require('gulp-plumber'),
    babel = require('gulp-babel'),
    htmlInclude = require('gulp-art-include'),
    //source = require('gulp-sourcemaps'),
    inlineSource = require('gulp-inline-source'),
    htmlMin = require('gulp-htmlmin'),
    htmlLayout = require('gulp-html-extend'),
    changeRootDirectory = require('gulp-inject-scripts'),
    gulpRename = require('gulp-rename'),
    gulpHtmlPath = require('gulp-html-path');

var path = {
    sass: './workshop/**/sass/*.scss',
    js: './workshop/**/js/*.js',
    htmlImport: './dist/02_pages/**/!(_)*.html',
    moveToDist: './workshop/**/*',
    dist: './dist/',
    public: './public/'
};

var convertSass = (cb) => {
    gulp.src(path.sass)
        .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
        .pipe(plumber())
        .pipe(gulp.dest(path.dist));
    cb();
},
convertES6 = (cb) => {
    gulp.src(path.js)
        .pipe(babel({
            presets: ['@babel/env'],
            minified: true
        }))
        .pipe(plumber())
        .pipe(gulp.dest(path.dist));
    cb();
},
moveToDist = (cb) =>{
    gulp.src(path.moveToDist)
        .pipe(gulp.dest(path.dist));
    cb();
},
convertHtmlImport = (cb) => {
    gulp.src(path.htmlImport)
        .pipe(htmlMin())
        .pipe(htmlLayout({annotations:false, verbose:true, root: './dist/01_system/layout/'}))
        .pipe(htmlInclude({
            data: {
                "foo" : "bar"
            }
        }))
        .pipe(inlineSource())
        .pipe(gulpRename((path) =>{
            path.dirname = ""
        }))
        .pipe(plumber())
        .pipe(gulp.dest(path.public));
    cb();
};

gulp.task('scssWatch', (cb) => {
    watcher(path.sass, convertSass(cb));
});

gulp.task('es6Watch', (cb) => {
    watcher(path.js, convertES6(cb));
});

gulp.task('htmlImportWatch', (cb) => {
    watcher(path.htmlImport, convertHtmlImport(cb));
});

gulp.task('watcher', gulp.series(gulp.parallel('scssWatch', 'es6Watch'), 'htmlImportWatch'));
gulp.task('build',  gulp.series(gulp.parallel(convertSass, convertES6), moveToDist, convertHtmlImport));
'use strict';
 
//npm install gulp-babel @babel/core @babel/preset-env

var gulp = require('gulp'),
    sass = require('gulp-dart-sass'),
    watcher = require('gulp-watch'),
    plumber = require('gulp-plumber'),
    babel = require('gulp-babel'),
    htmlInclude = require('gulp-art-include'),
    source = require('gulp-sourcemaps'),
    inlineSource = require('gulp-inline-source'),
    htmlMin = require('gulp-htmlmin'),
    htmlLayout = require('gulp-html-extend'),
    changeRootDirectory = require('gulp-inject-scripts'),
    gulpHtmlPath = require('gulp-html-path');

    //source easy to debug

var path = {
    sass: './workshop/**/sass/*.scss',
    js: './workshop/**/js/*.js',
    htmlInline:'./dist/**/*.html',
    moveHtml: './workshop/**/*.html',
    htmlInclude: './dist/**/!(_)*.html',
    dist: './dist/'
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
moveHtml = (cb) => {
    gulp.src(path.moveHtml)
    .pipe(gulp.dest(path.dist));
    cb();
},
convertHtmlInline = (cb) => {
    gulp.src(path.htmlInline)
    .pipe(gulpHtmlPath({ base: "./dist/", mode: "absolute"}))
    .pipe(inlineSource())
    .pipe(gulp.dest(path.dist))
    .pipe(plumber());
    cb();
},
convertHtmlInclude = (cb) => {
    gulp.src(path.htmlInclude)
    .pipe(htmlInclude({
        data: {
            "foo" : "bar"
        }
    }))
    .pipe(htmlLayout({annotations:false, verbose:true, root: './dist/system/layout/'}))
    .pipe(htmlMin({collapseWhitespace: true}))
    .pipe(plumber())
    .pipe(gulp.dest(path.dist));
    cb();
};

gulp.task('scssWatch', function(cb){
    watcher(path.sass, convertSass(cb));

});

gulp.task('es6Watch', function(cb){
    watcher(path.js, convertES6(cb));
});

gulp.task('htmlIncludeWatch', function(cb){
    watcher(path.htmlInclude, convertHtmlInclude(cb));
});
gulp.task('htmlInlineWatch', function(cb){
    watcher(path.htmlInline, convertHtmlInline(cb));
});

gulp.task('watcher', gulp.series(gulp.parallel('scssWatch', 'es6Watch'), 'htmlIncludeWatch', 'htmlInlineWatch'));
gulp.task('build',  gulp.series(gulp.parallel(convertSass, convertES6), moveHtml, convertHtmlInclude));
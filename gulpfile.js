'use strict';
 
//npm install gulp-babel @babel/core @babel/preset-env

var gulp = require('gulp'),
    sass = require('gulp-dart-sass'),
    watcher = require('gulp-watch'),
    plumber = require('gulp-plumber'),
    notify = require('gulp-notify'),
    babel = require('gulp-babel'),
    template = require('gulp-art-include'),
    inlineSource = require('gulp-inline-source'),
    htmlMin = require('gulp-htmlmin');

gulp.task('scssWatch', function(){
    watcher('./workshop/pages/**/sass/*.scss', function(){
        gulp.src('./workshop/pages/**/sass/*.scss')
        .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
        .pipe(plumber({errorHandler: notify.onError("SCSS Error: <%= error.message %>")}))
        .pipe(gulp.dest('./dist/'));
    });
});


gulp.task('htmlIncludeWatch', function(){
    watcher('./workshop/pages/**/*.html', function(){
        gulp.src('./workshop/pages/**/!(_)*.html')
        .pipe(template({
            data: {
                "foo" : "bar"
            }
        }))
        .pipe(htmlMin({collapseWhitespace: true}))
        .pipe(plumber({errorHandler: notify.onError("SCSS Error: <%= error.message %>")}))
        .pipe(gulp.dest('./dist/'));
    });
});


gulp.task('cssJsImportWatch', function(){
    watcher('./dist/**/*.html', function(){
        gulp.src('./dist/**/*.html')
        .pipe(inlineSource())
        .pipe(plumber({errorHandler: notify.onError("SCSS Error: <%= error.message %>")}))
        .pipe(gulp.dest('./dist/'));
    });
});

gulp.task('es6Watch', function(){
    watcher('./workshop/pages/**/js/*.js', function(){
        gulp.src('./workshop/pages/**/js/*.js')
        .pipe(babel({
            presets: ['@babel/env'],
            minified: true
        }))
        .pipe(plumber({errorHandler: notify.onError("JS Error: <%= error.message %>")}))
        .pipe(gulp.dest('./dist/'));
    });
});

gulp.task('watcher', gulp.parallel('scssWatch', 'es6Watch', 'htmlIncludeWatch', 'cssJsImportWatch'));

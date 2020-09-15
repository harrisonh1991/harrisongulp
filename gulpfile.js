'use strict';
 
//es6: npm install gulp-babel @babel/core @babel/preset-env

const {src, dest, task, series, parallel} = require('gulp'),
    argv = require('yargs').argv,
    sass = require('gulp-dart-sass'),
    watcher = require('gulp-watch'),
    plumber = require('gulp-plumber'),
    babel = require('gulp-babel'),
    htmlInclude = require('gulp-art-include'),
    //source = require('gulp-sourcemaps'),
    inlineSource = require('gulp-inline-source'),
    htmlMin = require('gulp-htmlmin'),
    htmlLayout = require('gulp-html-extend'),
    gulpRename = require('gulp-rename'),
    notify = require('gulp-notify'),
    gulpClean = require('gulp-clean'),
    gulpIf = require('gulp-if'),
    gulpUglify = require('gulp-uglify-es').default,
    /**
     * config
     */
    sourcePath = {
        sass: './workshop/**/css/*.scss',
        js: './workshop/**/js/*.js',
        distPagesHtml: './dist/02_pages/**/!(_)*.html',
        workshopHtml: './workshop/**/!(_)*.html',
        moveToDist: './workshop/**/*',
        dist: './dist/',
        public: './public/',
        layout: './workshop/01_system/layout/',
        export: ['./dist/*', './public/*']
    },
    /**
     * task
     */
    convertSass = () => {
        return src(sourcePath.sass)
            .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
            .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
            .pipe(dest(sourcePath.dist));
    },
    convertES6 = () => {
        return src(sourcePath.js)
            .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
            .pipe(gulpIf(argv.production, gulpUglify({
                compress: true,
                keep_classnames: false,
                keep_fanems: false
            })))
            .pipe(gulpIf(!argv.production, gulpUglify()))
            .pipe(dest(sourcePath.dist));
    },
    cleanExportFile = () => {
        return src(sourcePath.export, {read: false})
            .pipe(gulpClean());
    },
    convertHtmlInclude = () => {
        return src(sourcePath.workshopHtml)
            .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
            .pipe(htmlInclude({
                data: {
                    "foo" : "bar"
                }
            }))
            .pipe(htmlLayout({annotations:true, verbose:false, root: sourcePath.layout}))
            .pipe(gulpIf(argv.production, htmlMin({ collapseWhitespace: true })))
            .pipe(dest(sourcePath.dist));
    },
    convertHtmlInline = () => {
        return src(sourcePath.distPagesHtml)
            .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
            .pipe(inlineSource())
            .pipe(gulpRename((path) => {
                path.dirname = ''
            }))
            .pipe(dest(sourcePath.public));
    };
/**
 * watcher
 */
task('scssWatch', (cb) => {
    watcher(sourcePath.sass, series(convertSass, convertHtmlInclude, convertHtmlInline));
    cb();
});

task('es6Watch', (cb) => {
    watcher(sourcePath.js, series(convertES6, convertHtmlInclude, convertHtmlInline));
    cb();
});

task('htmlIncludeWatch', (cb) => {
    watcher(sourcePath.workshopHtml, convertHtmlInclude);
    cb();
});

task('htmlInlineWatch', (cb) => {
    watcher(sourcePath.distPagesHtml, convertHtmlInline); 
    cb()
});

/**
 * task group
 */
task('watcher', series( parallel('scssWatch', 'es6Watch'), 'htmlIncludeWatch', 'htmlInlineWatch'));
task('build',  series( cleanExportFile, parallel(convertSass, convertES6), convertHtmlInclude, convertHtmlInline, 'watcher'));
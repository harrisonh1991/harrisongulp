'use strict';
 
//es6: npm install gulp-babel @babel/core @babel/preset-env

var option = {};

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
    jshint = require('gulp-jshint'),
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
        export: ['./dist/*', './public/*'],
    },
    optionManager = {
        stage:{
            gulpUglify:{
                compress: false,
                keep_classnames: true,
                keep_fnames: true
            },
            sass:{},
            layout: {
                annotations:true, 
                verbose:false, 
                root: sourcePath.layout
            },
            inlineSource: {
                compress: false
            }
        },
        production:{
            gulpUglify:{
                compress: true
            },
            sass:{
                outputStyle: 'compressed'
            },
            layout: {
                annotations:false, 
                verbose:false, 
                root: sourcePath.layout
            }
            ,
            inlineSource: {
                compress: false
            }
        }
    },
    /**
     * task
     */
    convertSass = () => {
        return src(sourcePath.sass)
            .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
            .pipe(sass(option.sass).on('error', sass.logError))
            .pipe(dest(sourcePath.dist));
    },
    convertES6 = () => {
        return src(sourcePath.js)
            .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
            .pipe(jshint({
                "undef": true,
                "unused": true
            }))
            .pipe(jshint.reporter('default'))
            .pipe(gulpUglify(option.gulpUglify))
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
            .pipe(htmlLayout(option.layout))
            .pipe(gulpIf(argv.production, htmlMin({ collapseWhitespace: false })))
            .pipe(dest(sourcePath.dist));
    },
    convertHtmlInline = () => {
        return src(sourcePath.distPagesHtml)
            .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
            .pipe(inlineSource(option.inlineSource))
            .pipe(gulpRename((path) => {
                path.dirname = ''
            }))
            .pipe(dest(sourcePath.public));
    },
    init = (cb) => {
        option = (argv.production)? optionManager.production: optionManager.stage;
        cb();
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
task('watcher', series( init, parallel('scssWatch', 'es6Watch'), 'htmlIncludeWatch', 'htmlInlineWatch'));
task('build',  series( init, cleanExportFile, parallel(convertSass, convertES6), convertHtmlInclude, convertHtmlInline));
task('buildWatch',  series( init, cleanExportFile, parallel(convertSass, convertES6), convertHtmlInclude, convertHtmlInline));
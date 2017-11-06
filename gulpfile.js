// ---------------------------------
// config
// ---------------------------------
// setting
const USE_PLUGIN = {
	'sass': true,
	'babel': true,
	'ejs': false
};

var Task_list = ['watch'];

if (USE_PLUGIN.sass) Task_list.push('sass');
if (USE_PLUGIN.babel) Task_list.push('babel');
if (USE_PLUGIN.ejs) Task_list.push('ejs');

const AUTOPREFIXER_BROWSERS = [
	'last 2 versions',
	'ie >= 9',
	'safari >= 9',
	'ios >= 8.4',
	'android >= 4.4.2'
];


// load gulp.js & plugins
var gulp = require("gulp");
var ejs = require('gulp-ejs');
var sass = require("gulp-sass");
var csscomb = require('gulp-csscomb');
var pleeease = require('gulp-pleeease');
var babel = require("gulp-babel");
var eslint = require('gulp-eslint');
var lec = require('gulp-line-ending-corrector');
var styledocco = require('gulp-styledocco');
var spritesmith = require('gulp.spritesmith');
var plumber = require('gulp-plumber');
var imagemin = require('gulp-imagemin');
var pngquant = require('imagemin-pngquant');
var browserSync = require('browser-sync');
var reload = browserSync.reload;

// load Node.js API
var fs   = require('fs');
var path = require('path');


// ---------------------------------
// Functions
// ---------------------------------
// function.getFolders
var getFolders = function (dir) {
	return fs.readdirSync(dir)
	.filter(function (file) {
		return fs.statSync(path.join(dir, file)).isDirectory();
	});
};


// ---------------------------------
// Tasks
// ---------------------------------

// Lint JavaScript
gulp.task('lint', function () {
	gulp.src(['htdocs/**/*.js', '!htdocs/js/vendor/*.js'])
	.pipe(eslint())
	.pipe(eslint.format())
});

// EJS
gulp.task('ejs', function () {
	fs.access('htdocs/_ejs/_partials/_conf.json', fs.R_OK | fs.W_OK, function (err) {
		var json = (err) ? {} : JSON.parse(fs.readFileSync('htdocs/_ejs/_partials/_conf.json'));
		return gulp.src([
			'htdocs/_ejs/**/*.ejs',
			'!' + 'htdocs/_ejs/**/_*.ejs'
		])
		.pipe(ejs(json, {ext: '.html'}))
		.pipe(gulp.dest('htdocs/'));
	});
});

// sass
gulp.task('sass', function() {
	return gulp.src('htdocs/_scss/**/*.scss')
	.pipe(sass().on('error', sass.logError))
	.pipe(csscomb())
	.pipe(pleeease({
		autoprefixer: {browsers: AUTOPREFIXER_BROWSERS},
		opacity: false, // IE 8以下のopacityのポリフィル
		minifier: false, // cssのminifi
		mqpacker: false // media query 結合
	}))
	.pipe(lec({ eolc: 'CRLF', encoding:'UTF8'}))
	.pipe(gulp.dest('htdocs/'));
});

/*
// スタイルガイド
gulp.task('styleguide', function () {
  return gulp.src('htdocs/_styleguide/styleguide.scss')
  	.pipe(sass().on('error', sass.logError))
  	.pipe(csscomb())
	.pipe(pleeease({
		autoprefixer: {
			browsers: [
				'last 2 versions',
				'ie >= 9',
				'safari >= 9',
				'ios >= 8.4',
				'android >= 4.4.2'
			]
		},
		opacity: false, // IE 8以下のopacityのポリフィル
		minifier: false, // cssのminifi
		mqpacker: false // media query 結合
	}))
	.pipe(lec({ eolc: 'CRLF', encoding:'UTF8'}))
	.pipe(gulp.dest('htdocs/_styleguide/'))
	.pipe(styledocco({
		out: 'htdocs/_styleguide',
		name: 'styleguide'
	}));
});
*/

// スプライトシート
gulp.task('sprite', function () {
  var folders = getFolders('htdocs/_sprite/');
  folders.map(function (folder) {
		var spriteData = gulp.src('htdocs/_sprite/' + folder + '/*.png') //スプライトにする愉快な画像達
		.pipe(spritesmith({
			imgName: 'sprite-' + folder + '.png', //スプライトの画像
			cssName: 'css/_partials/_sprite-' + folder + '.scss', //生成されるscss
			imgPath: '/img/' + folder + '/sprite-' + folder + '.png', //生成されるscssに記載されるパス
			cssFormat: 'scss', //フォーマット
			padding: 10,
			cssSpritesheetName: 'spritesheet',
			cssVarMap: function (sprite) {
				sprite.name = 'sprite-' + sprite.name; //VarMap(生成されるScssにいろいろな変数の一覧を生成)
			},
			cssTemplate: 'htdocs/_sprite/spritesmith_tmp.txt'
		}));
		spriteData.img.pipe(gulp.dest('htdocs/img/'+ folder + '/' )); //imgNameで指定したスプライト画像の保存先
		spriteData.css.pipe(gulp.dest('htdocs/_scss/')); //cssNameで指定したcssの保存先
  });
});


// babel
gulp.task('babel', function() {
	return gulp.src('htdocs/_es6/**/*.es6')
	.pipe(plumber()) //エラーでも止めないやつ
	.pipe(babel({
			presets: ['es2015-without-strict']
		}))
	.pipe(lec({ eolc: 'CRLF', encoding:'UTF8'}))
	.pipe(gulp.dest('htdocs/'));
});

// Optimize images
gulp.task('images', function() {
  return gulp.src('htdocs/**/*.{jpg,jpeg,png,gif}')
    .pipe(imagemin({
      progressive: true, // プログレッシブ画像にするか否か
      interlaced: true, // gif版プログレッシブ画像にするか否か
      use: [pngquant({
        quarity: 60-80, // 下限値-上限値
        speed: 1
      })]
    }))
    .pipe(gulp.dest('htdocs/'));
});

// Build and serve
gulp.task('serve', Task_list, function () {
	browserSync({
		open: false,
    startPath: '',
    reloadDelay: 1000,
    once: true,
    notify: false,
    ghostMode: false,
    server: {baseDir: 'htdocs'}
	});
	gulp.watch('htdocs/*.html', reload);
	gulp.watch('htdocs/_scss/**/*.scss', ['sass', reload]);
	gulp.watch('htdocs/_es6/**/*.es6', ['babel', reload]);
});


// default / watch
gulp.task('default', Task_list);

gulp.task('watch', function() {
	if (USE_PLUGIN.sass) gulp.watch('htdocs/_scss/**/*.scss', ['sass']);
	if (USE_PLUGIN.babel) gulp.watch('htdocs/_es6/**/*.es6', ['babel']);
	if (USE_PLUGIN.ejs) gulp.watch('htdocs/_ejs/**/*.ejs', ['ejs']);
});

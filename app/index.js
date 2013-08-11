var generator = require('yeoman-generator');
var util = require('util');
var path = require('path');

// Documentation: https://github.com/yeoman/generator/wiki/base

var Generator = module.exports = function Generator() {

	generator.Base.apply(this, arguments);

	this.on('end', function () {
	this.installDependencies({ skipInstall: this.options['skip-install'] });
  });
};

util.inherits(Generator, generator.Base);


Generator.prototype.askFor = function askFor() {
	var cb = this.async();
	var pkgUrl = path.join(this.sourceRoot(), '../_package.json');
	this.pkg = JSON.parse(this.readFileAsString(pkgUrl));

	// welcome message
	console.log(this.yeoman);
	console.log("package.jsonの値を設定するための質問が表示されますので、記入してください。\n");

	var prompts = [
		{
			name: 'name',
			message: 'name?',
			default: this.pkg.name
		},
		{
			name: 'description',
			message: 'description?',
			default: this.pkg.description
		},
		{
			name: 'version',
			message: 'version?',
			default: this.pkg.version
		},
		{
			name: 'author',
			message: 'author?',
			default: this.pkg.author
		}
	];

	this.prompt(prompts, function (props) {
		this.pkg.name 			= props.name;
		this.pkg.description 	= props.description;
		this.pkg.version 		= props.version;
		this.pkg.author 		= props.author;
		cb();
	}.bind(this));
};


// Copies the entire template directory (with `.`, meaning the
// templates/ root) to the specified location
Generator.prototype.app = function scaffold() {

//	var fs 				= require('fs'),
//		srcRoot 		= this.sourceRoot(),
//		files 			= fs.readdirSync(srcRoot);

//	this._.each(files, function(file, i) {
//		var fileStat = fs.statSync(srcRoot + "/" + file);
//		if(fileStat.isDirectory()){
//			this.mkdir(file);
//		}
//	}.bind(this));

	this.mkdir("src");
	this.mkdir("libs");
	this.mkdir("deploy");

	this.directory('.', '');
	this.template("../gitignore.txt", ".gitignore");
	this.write("package.json", JSON.stringify(this.pkg, null, "	"));
};

module.exports = function(grunt) {

	"use strict";

	grunt.buildFiles = function(arg) {

		var suffix =(arg)? ":" + arg : "";

		switch (this.name) {

			case "deploy"	:
				grunt.task.run("before" + suffix, "debug" + suffix);
				break;

			case "default"	:/* FALL THROUGH */
			case "release"	:
				grunt.task.run("before" + suffix, "clean:allRelease", "copy:toRelease", "after" + suffix);
				break;
		}
	};

	grunt.buildPart = function(tasks) {

		return function(arg) {
			var tmpTasks = [];
			if(arg && tasks[arg]){
				tmpTasks = tasks[arg];
			} else if(!arg) {
				grunt.util._.each(tasks, function(el, i) {
					tmpTasks = tmpTasks.concat(el);
				});
			}
			grunt.task.run(tmpTasks);
		}
	};

	grunt.extendConfig = function(additionalConfig) {

		var config = grunt.config();

		for (var prop in additionalConfig) {
			if (additionalConfig.hasOwnProperty(prop)) {

				if (config[prop]) {
					config[prop] = grunt.util._.extend(config[prop], additionalConfig[prop]);
				} else {
					var tmpConfig = {};
					tmpConfig[prop] = additionalConfig[prop];
					config = grunt.util._.extend(config, tmpConfig);
				}
			}
		}
		grunt.initConfig(config);
	};

	function importGruntfiles() {

		var fs 				= require('fs'),
			gruntfilePath 	= "./gruntfiles/",
			files 			= fs.readdirSync(gruntfilePath),
			befTasks 		= {},
			debTasks 		= {},
			aftTasks 		= {};

		grunt.util._.each(files, function(file, i) {

			var individual 	= require(gruntfilePath + file),
				taskObj 	= individual.extendGrantTask(grunt),
				taskName 	= file.split(".")[0];

			if(taskObj) {

				var tmpBefTasks = taskObj["common_before"],
					tmpDebTasks = taskObj["deploy"],
					tmpAftTasks = taskObj["release"];

				if(tmpBefTasks && tmpBefTasks.length) {
					befTasks[taskName] = tmpBefTasks;
				}

				if(tmpDebTasks && tmpDebTasks.length) {
					debTasks[taskName] = tmpDebTasks;
				}

				if(tmpAftTasks && tmpAftTasks.length) {
					aftTasks[taskName] = tmpAftTasks;
				}
			}
		});
		grunt.registerTask('before', 	grunt.buildPart(befTasks));
		grunt.registerTask('debug', 	grunt.buildPart(debTasks));
		grunt.registerTask('after', 	grunt.buildPart(aftTasks));
	}

	grunt.extendConfig({

		pkg : grunt.file.readJSON('package.json'),

		copy : {
			toRelease : {
				files : [{
					expand : true,
					cwd : 'deploy/',
					src : ['**'],
					dest : 'release/'
				}],
				dot : true
			}
		},

		clean : {
			allRelease : ["release/**"]
		},

		watch : {
			deploy : {
				files : ["src/**"],
				tasks : ['deploy']
		  },

			release : {
				files : ["src/**"],
				tasks : ['release']
		  }
		}
	});

	grunt.loadNpmTasks('grunt-contrib');
	grunt.registerTask('default', 	grunt.buildFiles);
	grunt.registerTask('deploy', 	grunt.buildFiles);
	grunt.registerTask('release', 	grunt.buildFiles);

	importGruntfiles();
};

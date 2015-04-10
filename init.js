var rimraf = require('rimraf');
var jf = require('jsonfile');
var async = require('async');
var inquirer = require('inquirer');
var path = require('path');
var fs = require('fs');
var _ = require('underscore');
var constants = require('./const');
var cwd = process.cwd();


var not_fresh_err = null;
var site_settings = null;

var is_fresh_init_directory = function(dir, callback){
    fs.readdir(dir, function(err, files){
        if (err){
            return callback(err.toString());
        }
        if (_.indexOf(files, constants.paths.site) !== -1){
            return callback('A site has already been initialized in this directory: ' + path.join(dir, constants.paths.site) + 'already exists.');
        }
        return callback(null)
    });
};

var overwrite_site_prompt = function(not_fresh_error, callback){
    var questions = [];
    questions.push({
        type: 'confirm',
        default: false,
        name: 'overwrite',
        message: not_fresh_error + ' Are you sure you want to overwrite the site?'
    });
    inquirer.prompt(questions, function(answers){
        callback(answers.overwrite);
    })
};

var site_settings_prompt = function(callback){
    var questions = [];
    questions.push({
        type: 'text',
        default: 'My New Site',
        name: 'title',
        message: 'Site title:'
    });
    inquirer.prompt(questions, callback);
};



async.series(
    [
        function(callback){
            is_fresh_init_directory(cwd, function(err){
                if (err){
                    not_fresh_err = err;
                }
                callback(null);
            });
        },
        function(callback){
            if (! not_fresh_err) return callback(null);
            overwrite_site_prompt(not_fresh_err, function(overwrite){
                if (! overwrite){
                    console.log('Initialization cancelled.');
                    process.exit(0);
                }
                callback(null);

            });
        },
        function(callback){
            site_settings_prompt(function(settings){
                site_settings = settings;
                callback(null);
            });
        },
        //delete the site directory if it exists...
        function(callback){
            if (! not_fresh_err) return callback(null);
            rimraf(path.join(cwd, constants.paths.site), callback);
        },
        //create the site directory...
        function(callback){
            fs.mkdir(path.join(cwd, constants.paths.site), callback)
        },
        //create site.json...
        function(callback){
            jf.writeFile(path.join(cwd, constants.paths.site, site_settings, 'site.json'), callback)
        }
    ]
);




console.log(cwd);

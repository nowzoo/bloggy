var S = require('string');
var ncp = require('ncp').ncp;
var jf = require('jsonfile');
var async = require('async');
var inquirer = require('inquirer');
var path = require('path');
var fs = require('fs');
var _ = require('underscore');
var constants = require('./const');



module.exports = function(title, is_page, cwd){
    var permalink = S(title).slugify().s;
    var content_path = path.join(cwd, constants.paths.site, 'content');
    var permalink_path = null;
    async.series(
        [
            //get a unique permalink...
            function(callback){
                var base = permalink;
                fs.readdir(path.join(cwd, constants.paths.site, 'content'), function(err, files){
                    var n = 0;
                    while (_.indexOf(files, permalink) !== -1){
                        n++;
                        permalink = base + '-' + n;
                    }
                    callback(null)
                });
            },
            //create the directory...
            function(callback){
                permalink_path = path.join(content_path, permalink);
                fs.mkdir(permalink_path, callback);
            },
            //create the markdown file...
            function(callback){
                fs.writeFile(path.join(permalink_path, 'content.md'), 'Write something here.', callback);
            },
            //create the meta.json file...
            function(callback){
                var o = {
                    title: title,
                    type: is_page ? 'page' : 'post',
                    published: false
                };
                jf.writeFile(path.join(permalink_path, 'meta.json'), o, callback);
            }
        ],
        function(err){
            if (err){
                console.log(err);
            } else {
                console.log ('Content created at %s.', permalink_path);
            }
        }
    );
};






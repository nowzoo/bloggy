var jf = require('jsonfile');
var util = require('util');
var async = require('async');
var rimraf = require('rimraf');
var fs = require('fs');
var path = require('path');
var swig = require('swig');
var _ = require('underscore');
var marked = require('marked');
var moment = require('moment');

var site = null;

var _site_path = __dirname + '/_site';

var theme_path;


marked.setOptions({
    highlight: function (code, lang, callback) {
        require('pygmentize-bundled')({ lang: lang, format: 'html' }, code, function (err, result) {
            callback(err, result.toString());
        });
    }
});

var read_content = function(content_dir_rel, callback){
    var content_data = {
        permalink: content_dir_rel,
        error: null
    };
    var content_dir = path.join(__dirname, 'content', content_dir_rel);
    async.series(
        [
            function(callback){
                var error = null;
                var meta_path = path.join(content_dir, 'meta.json');
                jf.readFile(meta_path, function(err, obj) {
                    if (! err){
                        content_data = _.extend(content_data, obj);
                    } else {
                        error = 'Could not read ' + meta_path + '. Make sure ' + meta_path + ' exists and is valid JSON.';
                    }
                    callback(error);
                });
            },
            function(callback){
                var error = null;
                var content_path = path.join(content_dir, 'content.md');
                fs.readFile(content_path, function(err, markdown) {
                    if (! err){
                        content_data.markdown = markdown.toString();
                    } else {
                        error = 'Could not read ' + content_path + '. Make sure ' + content_path + ' exists and is valid markdown.';
                    }
                    callback(err);
                });
            },
            function(callback){
                if (! _.has(content_data, 'markdown')){
                    return callback();
                }
                marked(content_data.markdown, function (err, content) {
                    if (! err){
                        content_data.content = content.toString();
                    }
                    callback();
                });
            }

        ],
        function(err){
            if (err){
                content_data.error = err;
            }
            callback(null, content_data);
        }
    )
};


async.series(
    [
        function(callback){
            var settings_path = '/settings/site.json';
            var file = __dirname + settings_path;
            jf.readFile(file, function(err, obj) {
                if (err){
                    callback('There was a problem reading ' + path +'. Please make sure the file exists and is valid JSON.')
                }
                site = obj;
                theme_path = path.join(__dirname, 'themes', site.theme);
                callback(err);
            });
        },
        //remove the _site directory and it's contents...
        function(callback){
            rimraf(_site_path, function(err){
                callback(err);
            });
        },
        //add the _site directory
        function(callback){
            fs.mkdir(_site_path, callback);
        },
        //create the error document...
        function(callback){
            var template_path = path.join(theme_path, '404.twig');
            var output_path = path.join(_site_path, '404.html');
            swig.renderFile(template_path, {site: site}, function (err, output) {
                if (err) {
                    callback(err, output);
                } else {
                    fs.writeFile(output_path, output, function(err){
                        callback(err);
                    });
                }

            });
        },
        // gather up all the posts...
        function(callback){
            var posts_path = path.join(__dirname, 'content', 'posts');
            site.posts = [];
            fs.readdir(posts_path, function(err, result){
                if (err) return callback();
                async.each(
                    result,
                    function(file, callback){
                        read_content(path.join('posts', file), function(err, data){
                            data.permalink = file;
                            site.posts.push(data);
                            callback();
                        });
                    },
                    callback
                )
            });
        },
        //sort the posts by date
        function(callback){
            site.posts.sort(function(a, b){
                var a_date = moment(a.date, 'MM-DD-YYYY HH:mm:ss');
                var b_date = moment(b.date, 'MM-DD-YYYY HH:mm:ss');
                return b_date.isBefore(a_date) ? -1 : 1;
            });
            callback();
        },
        function(callback){
            var template_path = path.join(theme_path, 'post.twig');
            async.each(site.posts, function(post, callback){
                var output_path = path.join(_site_path, post.permalink);
                fs.mkdir(output_path, function(err){
                    output_path = path.join(output_path, 'index.html');
                    swig.renderFile(template_path, {site: site, post: post}, function (err, output) {
                        if (err) {
                            callback(err, output);
                        } else {
                            fs.writeFile(output_path, output, function(err){
                                callback(err);
                            });
                        }

                    });
                });
            }, callback)
        }
    ],
    function(err){
        console.log('error: ', err);
        console.log(util.inspect(site));
    }
);





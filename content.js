var jf = require('jsonfile');
var path = require('path');
var async = require('async');
var moment = require('moment');
var constants = require('./const');
var _ = require('underscore');
var S = require('string');

var get_content_path = module.exports.get_content_path = function(permalink){
    var cwd = process.cwd();
    return path.join(cwd, constants.paths.site, 'content', permalink);
};

var get_meta_path = module.exports.get_meta_path = function(permalink){
    return path.join(get_content_path(permalink), 'meta.json');
};

var get_meta = module.exports.get_meta = function (permalink, callback){
    var meta_path = get_meta_path(permalink);
    var error = null;
    jf.readFile(meta_path, function(err, meta){
        if (err){
            error = 'Either ' + meta_path + ' does not exist or it contains invalid JSON.';
        }
        callback(error, meta);
    });
};

var set_meta = module.exports.set_meta = function (permalink, meta, callback){
    var meta_path = get_meta_path(permalink);
    jf.writeFile(meta_path, meta, callback);
};

module.exports.publish = function(permalink, callback){
    var meta;
    async.series(
        [
            function(callback){
                get_meta(permalink, function(err, o){
                    meta = o;
                    if (! err && meta.published){
                        err = 'Already published.';
                    }
                    callback(err);
                });
            },
            function(callback){
                meta.published = true;
                meta.date = moment().format();
                set_meta(permalink, meta, callback);
            }
        ],
        function(err){
            callback(err, meta);
        }

    )
};

module.exports.unpublish = function(permalink, callback){
    var meta;
    async.series(
        [
            function(callback){
                get_meta(permalink, function(err, o){
                    meta = o;
                    callback(err);
                });
            },
            function(callback){
                meta.published = false;
                meta = _.omit(meta, 'date');
                set_meta(permalink, meta, callback);
            }
        ],
        function(err){
            callback(err, meta);
        }

    )
};

var normalize_tags = module.exports.normalize_tags = function(tags){
    var normalized = [];
    _.each(tags, function(tag){
        tag = S(tag).trim().s;
        if (0 === tag.length) return;
        tag = tag.replace(/\s+/, ' ');
        tag = S(tag).slugify().s;
        normalized.push(tag);
    });
    return normalized;
};

module.exports.add_tags = function(permalink, tags, callback){
    var normalized = normalize_tags(tags);
    console.log(normalized);
   // return;
    var meta;
    async.series(
        [
            function(callback){
                get_meta(permalink, function(err, o){
                    meta = o;
                    callback(err);
                });
            },
            function(callback){
                var tags = meta.tags || [];
                tags = _.union(tags, normalized);
                meta.tags = tags;
                set_meta(permalink, meta, callback);
            }
        ],
        function(err){
            callback(err, meta);
        }

    )
};

module.exports.remove_tags = function(permalink, tags, callback){
    var normalized = normalize_tags(tags);
    var meta;
    async.series(
        [
            function(callback){
                get_meta(permalink, function(err, o){
                    meta = o;
                    callback(err);
                });
            },
            function(callback){
                var tags = meta.tags || [];
                tags = _.difference(tags, normalized);
                meta.tags = tags;
                set_meta(permalink, meta, callback);
            }
        ],
        function(err){
            callback(err, meta);
        }

    )
};






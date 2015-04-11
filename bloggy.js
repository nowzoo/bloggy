var program = require('commander');
var init = require('./init');
var create = require('./create');
var content = require('./content');
var colors = require('colors');

program
    .version('1.0.0');

program
    .command('init')
    .description('initialize the site')
    .action(function(){
        init(process.cwd());
    });

program
    .command('create <title>')
    .description('create a new post or page')
    .option('-p, --page', 'create a page')
    .action(function(title, options){
        //options.type = options.type || 'post';
        options.page = options.page || false;
        console.log(arguments);
        create(title, options.page, process.cwd());
    });

program
    .command('publish <permalink>')
    .description('publish content')
    .action(function(permalink){
        content.publish(permalink, function(err, meta){
            var msg;
            if (err){
                console.log(err.red);
            } else {
                msg = meta.title + ' published!'
                console.log(msg.green);
            }
        });
    });

program
    .command('unpublish <permalink>')
    .description('unpublish content')
    .action(function(permalink){
        content.unpublish(permalink, function(err, meta){
            var msg;
            if (err){
                console.log(err.red);
            } else {
                msg = meta.title + ' unpublished!'
                console.log(msg.green);
            }
        });
    });

program
    .command('tag <permalink> [tags...]')
    .description('tag content')
    .option('-r, --remove', 'remove tags')
    .action(function(permalink, tags, options){
        var callback;
        callback = function (err, meta) {
            var tags;
            var msg;
            if (err) {
                console.log(err.red);
            } else {
                tags = meta.tags || [];
                msg = meta.title + ' tags updated!'
                console.log(msg.green);
                console.log('Current tags:', tags);
            }
        };
        if (tags.length > 0){
            if (options.remove){
                content.remove_tags(permalink, tags, callback);
            } else {
                content.add_tags(permalink, tags, callback);
            }
        } else {
            content.get_meta(permalink, function(err, meta){
                var tags;
                if (err) {
                    console.log(err.red);
                } else {
                    tags = meta.tags || [];
                    console.log('Current tags:', tags);
                }
            });
        }

    });

program.parse(process.argv);





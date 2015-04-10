var program = require('commander');

program
    .command('init')
    .description('initialize a site')
    .action(function(){
        console.log('initializing a site in %s', process.cwd());
    });
program.parse(process.argv);





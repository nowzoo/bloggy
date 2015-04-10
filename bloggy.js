var program = require('commander');

program
    .command('init')
    .description('initialize a site')
    .action(function(){
        console.log('Initializing a site in %s', process.cwd());
    });
program.parse(process.argv);





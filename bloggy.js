var program = require('commander');
var cwd = process.cwd();
program
    .command('init')
    .description('initialize a site')
    .action(function(){
        console.log('Initializing a site in %s', cwd);
    });
program.parse(process.argv);





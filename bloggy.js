var program = require('commander');

program
    .command('init')
    .description('initialize the site')
    .action(function(){
        require('./init')
    });
program.parse(process.argv);





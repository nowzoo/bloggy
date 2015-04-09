var inquirer = require("inquirer");
var questions = [
    {
        type: 'input',
        name: 'site_title',
        message: 'Site Title'
    }
];
inquirer.prompt(questions, function( answers ) {
    console.log(answers);
    console.log(process.cwd());
});



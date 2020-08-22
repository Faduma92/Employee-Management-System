// Dependencies
const inquirer = require('inquirer');
const mysql = require('mysql');
const cTable = require('console.table');

// Connection to the local sql server
const connection = mysql.createConnection({
    host: 'localhost',

    port: 3306,

    user: 'root',   
    password: '12345678',
    
    database: 'employee_database'
});

// Connect to the sql server and start the program
connection.connect((err) => {
    if (err) throw err;

    console.log("connected as id " + connection.threadId);

 init();
});



// Init first function with inquirer prompts
function init() {
    inquirer
     .prompt({
        type: 'list',
        name: 'firstQuestion',
        message: 'What would you like to do?',
        choices: [
            'View', 
            'Add', 
            'Update', 
            'Remove',  
            'Exit'
        ]
     })
     .then(function(answer) {
        switch(answer.firstQuestion) {
            case 'View':
                secondSetQuestions = [
                    {
                        type: 'list',
                        name: 'secondQuestion',
                        message: 'What would you like to view?',
                        choices: [
                            'View All Employees',
                            'View All Departments',
                            'View All Roles',
                            'Back'
                        ]
                    }
                ]

                secondQuestion();
                break;

            case 'Add':
                secondSetQuestions = [
                    {
                        type: 'list',
                        name: 'secondQuestion',
                        message: 'What would you like to add?',
                        choices: [
                            'Add New Employee',
                            'Add New Department',
                            'Add New Role',
                            'Back'
                        ]
                    }
                ]

                secondQuestion();
                break;

            case 'Update': 
                secondSetQuestions = [
                    {
                        type: 'list',
                        name: 'secondQuestion',
                        message: 'What would you like to update?',
                        choices: [
                            'Update Employee Role',
                            'Back'
                        ]
                    }
                ]
                
                secondQuestion();
                break;

            case 'Remove':
                secondSetQuestions = [
                    {
                        type: 'list',
                        name: 'secondQuestion',
                        message: 'What would you like to remove?',
                        choices: [
                            'Remove An Employee',
                            'Remove A Department',
                            'Remove A Role',
                            'Back'
                        ]
                    }
                ]

                secondQuestion();
                break;

            default:
                console.clear()
                console.log('Goodbye!');
                connection.end();
        }
     });
    }

// Running the specific functions based on the answers from prompt

    function secondQuestion() {
        inquirer
         .prompt(secondSetQuestions)
         .then(function(answer) {
            console.clear();

            switch(answer.secondQuestion) {
                case 'View All Employees':
                    viewVal = 'employee';
                    view();
                    break;
    
                case 'View All Departments':
                    viewVal = 'department';
                    view();
                    break;
                
                case 'View All Roles':
                    viewVal = 'role';
                    view();
                    break;

                case 'Add New Employee':
                    addNewEmployee();
                    break;
    
                case 'Add New Department':
                    addDepartment();
                    break;

                case 'Add New Role':
                    addRole();
                    break;
    
                case 'Update Employee Role':
                    updateVal = 'role';
                    update();
                    break;
                        
                case 'Update Employee Manager':
                    updateVal = 'manager';
                    update();
                    break;
                            
                case 'Remove An Employee':
                    removeVal = 'employee';
                    remove();
                    break;

                case 'Remove A Department':
                    removeVal = 'department';
                    remove();
                    break;

                case 'Remove A Role':
                    removeVal = 'role';
                    remove();
                    break;

                default:
                    init();
            } 
         })
    }

    // All of the 'VIEW' functions

function view() {
    var querySearch;

    // Check to see if the user chose employee, role, or department
    if (viewVal === 'employee') {
        querySearch = `SELECT employee.*, role.title, role.salary, department.name
        FROM employee
        INNER JOIN role 
           ON (employee.role_id = role.id)
        INNER JOIN department
           ON (role.department_id = department.id)`;
    } 

    else if (viewVal === 'role') {
        querySearch = `SELECT role.*, department.name 
        FROM role
        INNER JOIN department
           ON (department.id = role.department_id)`;
    } 
    
    else {
        querySearch = 'SELECT * FROM department';
    }

    connection.query(
        querySearch,

        function (err, res) {
            if (err) throw err;

            var tableArr = [];
        
            res.forEach(item => {
                // If the user chose employee
                if (viewVal === 'employee') {
                    var manager_name = null;

                    if (item.manager_id !== null) {
                        var manager_id = item.manager_id;

                        res.forEach(id => {
                            if (id.id === manager_id) {
                                manager_name = `${id.first_name} ${id.last_name}`;
                            }
                        });
                    }

                    var itemVal = {
                        id: item.id,
                        first_name: item.first_name,
                        last_name: item.last_name,
                        title: item.title,
                        department: item.name,
                        salary: item.salary,
                        manager: manager_name
                    }
                }

                // If the user chose role
                else if (viewVal === 'role') {
                    var itemVal = {
                        id: item.id,
                        title: item.title,
                        salary: item.salary,
                        department: item.name
                    }
                }

                // If the user chose department
                else {
                    var itemVal = {
                        id: item.id,
                        department_name: item.name
                    }
                }

                tableArr.push(itemVal)
            })
            
            let table = cTable.getTable(tableArr);

            console.log(`\n${table}\n`);

            init();
        }
    );
}


// All of the add functions
function addNewEmployee() {
    var roleChoices = [];
    var managerChoice = [];

    // Query for grabbing the different roles in the company
    connection.query(
        'SELECT * FROM role',

        function(err, res) {
            if (err) throw err;

            res.forEach(element => {
                var roleChoicesVal = {
                    name: element.title,
                    value: {
                        role_id: element.id
                    }
                }

                roleChoices.push(roleChoicesVal);
            });
        }
    );

    connection.query(
        'SELECT id, first_name, last_name FROM employee',

        function (err, res) {
            if (err) throw err;

            res.forEach(element => {
                var managerChoiceVal = {
                    name: `${element.first_name} ${element.last_name}`,
                    value: {
                        id: element.id
                    }
                }

                managerChoice.push(managerChoiceVal);
            });

            managerChoice.push('No one')
        }
    );

    const questions = [
        {
            type: 'input',
            name: 'firstName',
            message: 'What is the employee\'s first name?',
            validate: fieldValidation
        },
        {
            type: 'input',
            name: 'lastName',
            message: 'What is the employee\'s last name?',
            validate: fieldValidation
        },
        {
            type: 'list',
            name: 'role',
            message: 'What is the employee\'s role?',
            choices: roleChoices
        },
        {
            type: 'list',
            name: 'manager',
            message: 'Who is the employee\'s manager?',
            choices: managerChoice
        }
    ];

    inquirer
     .prompt(questions)
     .then(function(answer) {
        let managerAnswer;

        if (answer.manager !== 'No one') {
            managerAnswer = answer.manager.id;
        } else {
            managerAnswer = null;
        }

        connection.query(
            'INSERT INTO employee SET ?',
            {
                first_name: answer.firstName,
                last_name: answer.lastName,
                role_id: answer.role.role_id,
                manager_id: managerAnswer
            },
            function(err) {
                if (err) throw err;

                console.clear();

                console.log(`${answer.firstName} ${answer.lastName} has been added to the Employee database!\n`);

                init();
            }
        );
     });
}

function addRole() {
    console.clear();

    connection.query(
        'SELECT * FROM department',

        function(err, res) {
            if (err) throw err;

            var departmentChoiceArr = [];

            res.forEach(department => {
                var departmentChoiceVal = {
                    name: department.name,
                    value: {
                        id: department.id,
                        name: department.name
                    }
                }

                departmentChoiceArr.push(departmentChoiceVal);
            });

            departmentChoiceArr.push('Cancel');

            inquirer
             .prompt({
                type: 'list',
                name: 'chosenDepartment',
                message: 'Which department would you like to add this new role to?',
                choices: departmentChoiceArr
             })
             .then(function(answer) {
                if (answer.chosenDepartment === 'Cancel') {
                    console.clear();

                    init();
                } else {
                    inquirer
                     .prompt([
                        {
                            type: 'input',
                            name: 'roleName',
                            message: 'What would you like to call this role?',
                            validate: fieldValidation    
                        },
                        {
                            type: 'input',
                            name: 'roleSalary',
                            message: 'What is the yearly salary for this role?'
                        }
                     ])
                     .then(function(roleAnswer) {
                        connection.query(
                            'INSERT INTO role SET ?',

                            {
                                title: roleAnswer.roleName,
                                salary: roleAnswer.roleSalary,
                                department_id: answer.chosenDepartment.id
                            },

                            function (err, res) {
                                if (err) throw err;

                                console.clear();

                                console.log(`${roleAnswer.roleName} has been added to the database!\n`);

                                init();
                            }
                        );
                     })
                }
             });
        }
    );
}

function addDepartment() {
    if (addVal === 'department') {
        inquirer
         .prompt({
            type: 'input',
            name: 'departmentName',
            message: 'What would you like to name this department?',
            validate: fieldValidation
         })
         .then(function(answer) {
            console.clear();
    
            connection.query(
                'INSERT INTO department SET ?',
                {
                    name: answer.departmentName
                },
                function(err) {
                    if (err) throw err;
    
                    console.log(`${answer.departmentName} has been added to the database!\n`);
    
                    init();
                }
            );
         });
    }
}

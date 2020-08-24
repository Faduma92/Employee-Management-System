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
            
        },
        {
            type: 'input',
            name: 'lastName',
            message: 'What is the employee\'s last name?',
           
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

// UPDATE EMPLOYEE ROLES function

function update() {
    // Variables needed for the function
    var updateChoice = [];
    var newUpdateChoice = [];
    var roleChoicesArr = [];
    var arrayChoice;
    var promptMessage;


    connection.query(
        'SELECT * FROM role',

        function(error, results) {
            if (error) throw error;

            results.forEach(role => {
                var roleChoices = {
                    name: role.title,
                    value: {
                        id: role.id,
                        name: role.title
                    }
                }

                roleChoicesArr.push(roleChoices);
            });
        }
    );
    // This is the main query
    connection.query(
        `SELECT employee.*, role.title, role.department_id
         FROM employee
         INNER JOIN role 
           ON (employee.role_id = role.id)`,

        function(err, res) {
            if (err) throw err;

            // Loop through all of the employee's in the database
            res.forEach(employee => {
              let name = `${employee.first_name} ${employee.last_name}, id: ${employee.id}`;
              
              // Add all the values into the updateChoice array  
              let updateChoiceVal = {
                name: name,
                value: {
                    name: name,
                    first_name: employee.first_name,
                    name_without_id: `${employee.first_name} ${employee.last_name}`,
                    id: employee.id
                }
              }

              updateChoice.push(updateChoiceVal);
            });

            // Always give the user the option to cancel
            updateChoice.push('Cancel');

            // First inquirer question to see which employee they'd like to update
            inquirer
             .prompt({
                type: 'list',
                name: 'userChoice',
                message: 'Which employee would you like to update?',
                choices: updateChoice
             })
             .then(function(answer) {
                //  If the user chose to cancel then clear the console and go back to the main screen
                if (answer.userChoice === 'Cancel') {
                    console.clear();

                    init();
                }

                // If the user chose to update the employee's role
                else {
                    promptMessage = `Which position would you like ${answer.userChoice.first_name} to have?`;

                    arrayChoice = roleChoicesArr;

                    secondUpdateQuestion();
                }


                
                function secondUpdateQuestion() {
                    inquirer
                     .prompt({
                        type: 'list',
                        name: 'userSecondChoice',
                        message: promptMessage,
                        choices: arrayChoice
                     })
                     .then(function(choice) {

                        var settingChoice = [
                            {
                                id: answer.userChoice.id
                            }
                        ];

                        
                            settingChoice.unshift({
                                role_id: choice.userSecondChoice.id
                            });
                        

                        // Connection query to update the employee role or manager
                        connection.query(
                            `UPDATE employee SET ? WHERE ?`,

                            settingChoice,

                            function (err, res) {
                                if (err) throw err;

                                console.clear();

                                
                                    console.log(`${answer.userChoice.first_name}'s position has been updated to ${choice.userSecondChoice.name}!\n`);
                                

                                init();
                            }
                        );
                    });
                }
             });
        }
    );
}

//Remove function
function remove() {
    console.clear();

    // First query to run. This will grab all the details from either the employee table, department table, or the role table.
    connection.query(
        `SELECT * FROM ${removeVal}`,

        function (err, res) {
            if (err) throw err;

            
            var choiceArr = [];
            var choiceVal;

            // Depending on what the useS choice:

            // If the user chose to remove an Employee
            if (removeVal === 'employee') {
                res.forEach(employee => {
                    choiceVal = {
                        name: `${employee.first_name} ${employee.last_name}, id: ${employee.id}`,
                        value: {
                            id: employee.id,
                            name: `${employee.first_name} ${employee.last_name}`
                        }
                    }

                    choiceArr.push(choiceVal);
                });
            } 
            
            // If the user choice to remove a department
            else if (removeVal === 'department') {
                res.forEach(department => {
                    choiceVal = {
                        name: department.name,
                        value: {
                            id: department.id,
                            name: department.name
                        }
                    }

                    choiceArr.push(choiceVal);
                });
            }

            // If the user chose to remove a role
            else {
                res.forEach(role => {
                    choiceVal = {
                        name: role.title,
                        value: {
                            id: role.id,
                            name: role.title
                        }
                    }

                    choiceArr.push(choiceVal);
                });
            }

            // No matter which forEach loop runs, always give the user the option to cancel.
            choiceArr.push('Cancel');

            // First inquirer prompt to ask the user which employee, department, or role they'd like to remove.
            inquirer
             .prompt({
                type: 'list',
                name: 'removeChoice',
                message: `Which ${removeVal} would you like to remove?`,
                choices: choiceArr
             })
             .then(function(answer) {
                // If the user chose to cancel, clear the console and got back to the main screen.
                if (answer.removeChoice === 'Cancel') {
                    console.clear();

                    init();
                } 
                
                else {
                   
                            connection.query(
                                `DELETE FROM ${removeVal} WHERE ?`,

                                {
                                    id: answer.removeChoice.id
                                },


                                // Print what has been removed
                                function(error, results) {
                                    if (error) throw error;

                                    console.clear();

                                    console.log(`${answer.removeChoice.name} has been removed from the ${removeVal} database!\n`);

                                    init();
                                }
                            );
                        
                     
                }
             })
        }
    );
}
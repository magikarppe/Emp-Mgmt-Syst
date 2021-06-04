// statements req
const inquirer = require("inquirer");
const mysql = require("mysql");
const logo = require("asciiart-logo");


// database connection
var connection = mysql.createConnection({
    host:"localhost",
    port: 3306,
    user: "root",
    password: "Maisie!123",
    database: "employees",
})

connection.connect(function (err) {
    if (err) throw err;

    init();
  })


// function init()
function init() {
    const logoTxt = logo({ name: "Employee Manager" }).render();
    console.log(logoTxt);

    loadPrompts();
}

// prompts 
function loadPrompts() {
  inquirer
    .prompt({
        type: "list",
        name: "choice",
        message: "What shall we do?",
        choices: [
          {name: "Update an employee's role.", value: "UPDATE_EMPLOYEES"},
          {name: "Add an employee.", value: "ADD_EMPLOYEES"},
          {name: "Add a role.", value: "ADD_ROLES"},
          {name: "Add a department.", value: "ADD_DEPTS"},
          {name: "Exit"},
        ],
    })
    .then(function (answer) {
      if (answer.choice === "UPDATE_EMPLOYEES") {
        return updateEmployees();
      }
      if (answer.choice === "ADD_EMPLOYEES") {
        return addEmployees();
      }
      if (answer.choice === "ADD_ROLES") {
        return addRoles();
      }
      if (answer.choice === "ADD_DEPTS") {
        return addDepts();
      } else {
        connection.end();
      }
    });
}

// Function update employees
function updateEmployees() {
    connection.query(
      "SELECT * FROM employee INNER JOIN role ON employee.role_id = role.id INNER JOIN department ON role.department_id = department.id",
      function (err, results) {
        console.table(results);
        if (err) throw err;
        inquirer
          .prompt([
            {
              type: "rawlist",
              name: "employee",
              message: "Which employee's role would you like to update?",
              choices: function () {
                let choiceArray = [];
                for (let i = 0; i < results.length; i++) {
                  choiceArray.push(results[i].first_name);
                }
                return choiceArray;
              },
            },
            {
              type: "input",
              name: "role",
              message: "What would you like their new role to be?",
            },
          ])
          .then(function (answer) {
            var newRole;
            for (var i = 0; i < results.length; i++) {
              if (results[i].first_name === answer.employee) {
                newRole = results[i];
              }
            }
            connection.query(
              "UPDATE role SET ? WHERE ?",
              [
                {
                  title: answer.role,
                },
                {
                  id: newRole.role_id,
                },
              ],
              function (err) {
                if (err) throw err;
                console.log("Employee role successfully updated.");
                loadPrompts();
              }
            );
          });
      }
    );
  }


// 'add new employees' funct

function addEmployees() {
    connection.query(
      "SELECT * FROM employee INNER JOIN role ON employee.role_id = role.id INNER JOIN department ON role.department_id = department.id",
      function (err, results) {
        console.table(results);
        if (err) throw err;
        inquirer
          .prompt([
            {
              type: "input",
              name: "newEmpFN",
              message: "What is their first name?",
            },
            {
              type: "input",
              name: "newEmpLN",
              message: "What is their last name?",
            },
            {
              type: "rawlist",
              name: "newEmpRole",
              message: "What is their title?",
              choices: function () {
                let choiceArray = [];
                for (let i = 0; i < results.length; i++) {
                  choiceArray.push(results[i].title);
                }
                return choiceArray;
              },
            },
          ])
          .then(function (answer) {
            var newRole;
            for (var i = 0; i < results.length; i++) {
              if (results[i].title === answer.newEmpRole) {
                newRole = results[i];
              }
            }
            connection.query(
              "INSERT INTO employee SET ?",
              {
                first_name: answer.newEmpFN,
                last_name: answer.newEmpLN,
                role_id: newRole.role_id,
              },
              function (err) {
                if (err) throw err;
                console.log("New employee added!");
                loadPrompts();
              }
            );
          });
      }
    );
  }

// 'add role' funct
function addRoles() {
    connection.query(
      "SELECT * FROM role INNER JOIN department ON role.department_id = department.id",
      function (err, results) {
        console.table(results);
        if (err) throw err;
        inquirer
          .prompt([
            {
              type: "input",
              name: "newRoleTitle",
              message: "What is the title of the new role?",
            },
            {
              type: "input",
              name: "newRoleSalary",
              message: "How much does this new role pay?",
            },
            {
              type: "input",
              name: "newRoleDept",
              message: "What department is this role in?",
            },

          ])
          .then(function (answer) {
            var newRole;
            for (var i = 0; i < results.length; i++) {
              if (results[i].name === answer.newRoleDept) {
                newRole = results[i];
              }
            }
            connection.query(
              "INSERT INTO role SET ?",
              {
                title: answer.newRoleTitle,
                salary: answer.newRoleSalary,
                department_id: newRole.id,
              },
              function (err) {
                if (err) throw err;
                console.log("New role added!");
                loadPrompts();
              }
            );
          });
      }
    );
  }


// 'add dept' funct 
function addDepts() {
    connection.query("SELECT * FROM department", function (err, results) {
      console.table(results);
      if (err) throw err;
      inquirer
        .prompt([
          {
            type: "input",
            name: "newDept",
            message: "What is the name of the new department?",
          },
        ])
        .then(function (answer) {
          connection.query(
            "INSERT INTO department SET ?",
            {
              name: answer.newDept,
            },
            function (err) {
              if (err) throw err;
              console.log("New department added!");
              loadPrompts();
            }
          );
        });
    });
  }

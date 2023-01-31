const express = require('express');
const inquirer = require("inquirer");
const mysql = require('mysql2');
const consoleTable = require("console.table")

const PORT = process.env.PORT || 3001;
const app = express();

// Express middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Connect to database
const db = mysql.createConnection(
  {
    host: 'localhost',
    // MySQL username,
    user: 'root',
    // MySQL password
    password: 'root',
    database: 'employee_db'
  },
  console.log(`Connected to the books_db database.`)
);

const promiseDB = db.promise();

const exitQuestions = [{
  type: "list",
  message: "Continue managing database or Exit",
  name: "user_input",
  choices: ["continue", "Exit"]
}];

const questions = [{
  name: 'user_input',
  type: 'list',
  message: 'How do you want to manage the employee database',
  choices: [
    'View All Employees',
    'View All Roles',
    'View All Departments',
    'Update Employee Role',
    'Add Employee',
    'Add Role',
    'Add Department',
    'Remove Employee',
    'Remove Role',
    'Remove Department',
    'Exit'
  ]
}
];



//getUserInput();
function getUserInput() {
  console.log("get user input function");
  inquirer.prompt(questions).then(response => {
    const user_input = response.user_input;
    console.log(user_input + " is selected");

    if (user_input == "View All Employees") {
      displayAllEmployees();

    } else if (user_input == "View All Departments") {
      displayAllDept();

    } else if (user_input == "View All Roles") {
      displayAllRoles();

    } else if (user_input == "Add Department") {
      addDept();

    } else if (user_input == "Add Employee") {
      addEmployee();

    } else if(user_input == "Add Role"){
      addRole();
    }else {
      db.end();
      return;
    }
  });
  return;


}
//===============add=================
function addEmployee() {

  const empQuestions = [{
    type: "input",
    message: "Enter First Name: ",
    name: "firstName"
  },
  {
    type: "input",
    message: "Enter Last Name: ",
    name: "lastName"
  }
  ];
  inquirer.prompt(empQuestions).then(response => {
    const first_name = response.firstName;
    const last_name = response.lastName;
    let role = "";
    let manager_id= "";
    //==========choose the role
    let roleSqlStmt = "select * from role";
    db.promise().query(roleSqlStmt).then(result => {
      const titles = result[0].map(item => { return item.title+" (" + item.id + ")" });

      inquirer.prompt([{
        type: "list",
        message: "Select a role for the employee",
        name: "emp_role",
        choices: titles
      }]).then(response => {
        let tempRole = response.emp_role;
        role = tempRole.substring(tempRole.indexOf('(')+1,tempRole.indexOf(')'));

        //==========choose the manager
        let managerSqlStmt = "select id, first_name, last_name from employee";
        db.promise().query(managerSqlStmt).then(result => {
          const managers = result[0].map(item => { return item.id });


          inquirer.prompt([{
            type: "list",
            message: "Select a manager for the employee",
            name: "emp_manager",
            choices: managers
          }]).then(response => {
              manager_id = response.emp_manager;

        //===========insert the employee to db

              let addEmpSqlStmt = `insert into employee(first_name, last_name, role_id, manager_id) values ("${first_name}", "${last_name}", ${role}, ${manager_id})`
              db.promise().query(addEmpSqlStmt).then(result =>{
                  displayAllEmployees();
              });
          });
        });


      }).catch(err => console.log(err));


    });
  }
  );
}
//==================add dep

 function addDept() {

      const deptQuestions = [{
        type: "input",
        name: "dept_name",
        message: "Enter the department name",
      }];

      inquirer.prompt(deptQuestions).then((response) => {
        const dept_name = response.dept_name;
        let sqlStmt = `insert into department(dept_name) values ("${dept_name}")`;
        db.promise().query(sqlStmt)
          .then(result => {
            displayAllDept();
          })
          .catch(err => console.error(err));

      });

    }
//=============================add a arole
addRole();
function addRole(){
  const roleQuestions = [{
    type: "input",
    message: "Enter the role title",
    name: "title"
  },
  {
    type: "input",
    message: "Enter the role salary",
    name: "salary"
  }];

  inquirer.prompt(roleQuestions).then(response =>{
    const title = response.title;
    const salary = response.salary;
    let dept_id="";

    let deptSqlStmt = "select * from department";
    db.promise().query(deptSqlStmt).then(result =>{
      const allDept = result[0].map(item => {return item.dept_name + " (" + item.id + ")"});
      
      inquirer.prompt([{
        type:"list",
        message: "Select the department of that role",
        name: "dept",
        choices: allDept
      }]).then(response=>{
          let temp = response.dept;
          dept_id = temp.substring(temp.indexOf("(")+1, temp.indexOf(")"));

          ///=========insert the role to database
          let addRoleSqlStmt = `insert into role(title, dept_id, salary) values("${title}", ${dept_id}, ${salary})`;
          db.promise().query(addRoleSqlStmt).then(result=>{
            displayAllRoles();
          });
      });
    });

  });
}

// const temppp = getAllRolesTitles2();
// console.log("====");
// console.log(temppp);
// console.log("====")
// getAllRolesTitles2();


//==========display all ============
 function getAllRolesTitles() {
      let sqlStmt = "select title from role";
      db.promise().query(sqlStmt).then(result => {
        return result[0].map(item => { return item.title });
      }).catch(err => console.log(err));
    }

 async function getAllRolesTitles2() {
      let sqlStmt = "select title from role";
      try {
        const result = await db.promise().query(sqlStmt);
        return result[0].map(item => { return item.title });
      } catch (err) {
        console.log(err);
      }

    }
function displayAllEmployees() {
      let sqlStmt = "select * from employee join department on employee.dept_id =department.idselect employee.id, employee.first_name, employee.last_name, role.title, department.dept_name,  role.salary , employee.manager_id from employee join employee_db.role on employee.role_id = employee_db.role.id join department on role.dept_id = department.id;";

      db.promise().query(sqlStmt)
        .then(result => {
          console.table(result[0]);
          getUserInputAgain();
        });

    }
 function displayAllDept() {
      let sqlStmt = "select * from department";

      db.promise().query(sqlStmt)
        .then(result => {
          console.table(result[0]);
          getUserInputAgain();
        });
    }

function displayAllRoles() {
      let sqlStmt = "select * from role";

      db.promise().query(sqlStmt)
        .then(result => {
          console.table(result[0]);
          getUserInputAgain();
        });
    }


function getUserInputAgain() {


      inquirer.prompt(exitQuestions).then(response => {
        let user_input = response.user_input;
        if (user_input == "continue") {
          getUserInput();
        } else {
          db.end();
          return;
        }
      });

    }


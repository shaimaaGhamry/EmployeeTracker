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



getUserInput();
function getUserInput() {
  inquirer.prompt(questions).then(response => {
    const user_input = response.user_input;
    
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
    }else if(user_input == "Remove Employee"){
      removeEmployee(); 
    }else if(user_input == "Remove Department"){  
      removeDeparment(); 
    }else if(user_input == "Update Employee Role") {
      updateEmployeeRole();
    }else {
      db.end();
      return;
    }
  });
  return;


}

//=============update an employee role
async function updateEmployeeRole(){
    const allEmpSqlStmt = "select id, first_name, last_name from employee order by id";
    const result = await promiseDB.query(allEmpSqlStmt);
    const employees = result[0].map(item=> `${item.first_name} ${item.last_name} (${item.id})`);

    const allRoleSqlStmt = "select * from role";
    const allRoleResult = await promiseDB.query(allRoleSqlStmt);
    const roles = allRoleResult[0].map(item => `${item.title} (${item.id})`);

    
    inquirer.prompt([{
      type: "list",
      message: "Select the employee to be updated",
      choices: employees,
      name: "employee"
    },{
      type: "list",
      message: "Select the role to be updated",
      choices: roles,
      name: "role"

    }]).then(answer =>{
        const selectedEmp = answer.employee;
        const selectedRole = answer.role;
        const empId = selectedEmp.substring(selectedEmp.indexOf('(')+1,selectedEmp.indexOf(')'));
        const roleId = selectedRole.substring(selectedRole.indexOf('(') +1, selectedRole.indexOf(')'));

        const updateSqlStmt = `update employee set role_id = ${roleId} where id = ${empId} `;
        promiseDB.query(updateSqlStmt).then(result =>{
          console.log("=======The Employee has been updated==============");
          displayAllEmployees();
        });
        
    });
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
          const managers = result[0].map(item => { return `${item.first_name} ${item.last_name} (${item.id})` });


          inquirer.prompt([{
            type: "list",
            message: "Select a manager for the employee",
            name: "emp_manager",
            choices: managers
          }]).then(response => {
              let selectedEmp = response.emp_manager;
              manager_id = selectedEmp.substring(selectedEmp.indexOf('(')+1, selectedEmp.indexOf(')'))

        //===========insert the employee to db

              let addEmpSqlStmt = `insert into employee(first_name, last_name, role_id, manager_id) values ("${first_name}", "${last_name}", ${role}, ${manager_id})`
              console.log(addEmpSqlStmt);
              db.promise().query(addEmpSqlStmt).then(result =>{
                  console.log("=========The Employee has been added =========");
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
            console.log("=========The Department has been added =========");
            displayAllDept();
          })
          .catch(err => console.error(err));

      });

    }
//=============================add a arole
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
            console.log("======= The Role has been added =======");
            displayAllRoles();
          });
      });
    });

  });
}


//==========display all ============
function displayAllEmployees() {
      let sqlStmt = `select employee.id, employee.first_name, employee.last_name, dept_id, role.title, role.salary , employee.manager_id 
      from employee join employee_db.role 
      on employee.role_id = employee_db.role.id 
      `;

      db.promise().query(sqlStmt)
        .then(result => {
          console.table(result[0]);
          getUserInputAgain();
        });

    }

    // =========== display all dept

 function displayAllDept() {
      let sqlStmt = "select * from department";

      db.promise().query(sqlStmt)
        .then(result => {
          console.table(result[0]);
          getUserInputAgain();
        });
    }

    //======display all roles
function displayAllRoles() {
      let sqlStmt = "select * from role";

      db.promise().query(sqlStmt)
        .then(result => {
          console.table(result[0]);
          getUserInputAgain();
        });
    }

    //==========delete ================
    
function removeDeparment(){
  db.promise().query("select * from department").then(result => { 
    let allDept = [];
    allDept = result[0].map(item=> `${item.dept_name} (${item.id})`);
    
    inquirer.prompt([{
      type:"list",
      name:"selectedDept",
      message:"Select a department to be deleted",

      choices: allDept
    }]).then(answer=>{
      const selectedDept = answer.selectedDept;
      const deptId = selectedDept.substring(selectedDept.indexOf('(')+1 ,selectedDept.indexOf(')'));
      db.promise().query(`delete from department where id = ${deptId}`).then(result =>{
         console.log("=======The selected department has been deleted=======");
         displayAllDept();
      });
    });

  });
}
    async function removeEmployee(){
      var employees = await getEmployeeNames();
      employees.push("All Employees");

      inquirer.prompt([{
        type: "list",
        name: "selectedEmployee",
        message: "Select the employee to be deleted",
        choices: employees
      }]).then(answer => {
        let selectedEmp = answer.selectedEmployee;
        if( selectedEmp == "All Employees"){
          db.query("delete from employee").then((err,res) =>{
            if (err) throw err;
            console.log("ALL EMPLOYEES ARE DELETED");
          });
        }else{
          const empId = selectedEmp.substring(selectedEmp.indexOf('(')+1, selectedEmp.indexOf(')'));
          db.query(`delete  from employee where id =${empId}`, (err, res)=>{
            if (err) throw err;
            console.log(" ==== The selected Emplyee has been deleted ===");
            displayAllEmployees();

          });

        }
      });
    }

   
function getEmployeeNames(){
      var empNames = [];

      return new Promise((resolve, reject) => {
        db.query("select * from employee", function(err,res){
          if (err) throw err;
    
          for (var i = 0; i < res.length; i++) {
              empNames.push(`${res[i].first_name} ${res[i].last_name} (${[res[i].id]}) `);
          }
          // cb(roleList);
          resolve(empNames);
        });
      }).then((response) => {
        return response;
      });
    }
/////////////////////////////////////////////////////////////

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


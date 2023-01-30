drop database if exists employee_db;
create database employee_db;
use employee_db;

create table department(
id int not null auto_increment primary key,
dept_name varchar(30) not null);

create table role(
id int not null auto_increment primary key,
title varchar(30) not null,
salary decimal,
dept_id int,
foreign key(dept_id) references department(id) on delete set null
);



 create table employee (
id int not null auto_increment primary key,
first_name varchar(30) not null,
last_name varchar(30),
role_id int,
manager_id int,
foreign key(role_id) references role(id) on delete set null,
foreign key(manager_id) references employee(id) on delete set null
);
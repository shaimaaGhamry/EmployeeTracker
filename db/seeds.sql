insert into department(dept_name)
 values("Computer Science"),
       ("Information Technology");
 

 insert into role(title, salary, dept_id) 
values ("Software Engineer", 120000, 1), 
		("CS Manager", 200000, 1),
		("IT Manger", 300000,2),
		("IT Specialist", 100000, 2);

insert into employee(first_name, last_name, role_id, manager_id) 
values ("Mohammad", "Ahmad", 2, null);
		
insert into employee(first_name, last_name, role_id, manager_id) 
values ("Sherif", "Mohammad", 3, null);
		
insert into employee(first_name, last_name, role_id, manager_id) 
values ("Shaimaa", "Mohammad", 1, 2);
		

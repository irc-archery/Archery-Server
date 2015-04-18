create table `account` (
	id int not null auto_increment primary key,
	firstName varchar(255),
	lastName varchar(255),
	rubyFirstName varchar(255),
	rubyLastName varchar(255),
	organizationName varchar(255),
	password varchar(255),
	rubyLastName date default null,
	modified date default null
) CHARACTER SET 'utf8';
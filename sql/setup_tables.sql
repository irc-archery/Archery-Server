create table `account` (
	`id` int not null auto_increment primary key,
	`firstName` varchar(255),
	`lastName` varchar(255),
	`rubyFirstName` varchar(255),
	`rubyLastName` varchar(255),
	`organizationName` varchar(255),
	`password` varchar(255),
	`created` date default null,
	`modified` date default null
) CHARACTER SET 'utf8';

create table `match` (
	`id` int not null auto_increment primary key,
	`matchName` varchar(255),
	`playerNum` int,
	`shotNum` int,
	`setNum` int,
	`length` int,
	`role` varchar(255)
) CHARACTER SET 'utf8';

create table `score` (
	`id` int not null auto_increment primary key,
	`matchid` int not null,
	`Date` datetime,
	`place` varchar(255),
	`temperature` varchar(255),
	`weather` varchar(255)
) CHARACTER SET 'utf8';
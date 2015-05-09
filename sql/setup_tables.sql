create table `organization` (
	`o_id` int not null auto_increment primary key unique,
	`p_id` int,
	`organizationName` varchar(255),
	`establish` date,
	`place` varchar(255),
	`email` varchar(255),
	index(`o_id`)
) CHARACTER SET 'utf8' ENGINE = InnoDB;

create table `account` (
	`p_id` int not null auto_increment primary key unique,
	`o_id` int,
	`firstName` varchar(255),
	`lastName` varchar(255),
	`rubyFirstName` varchar(255),
	`rubyLastName` varchar(255),
	`email` varchar(255) unique,
	`password` varchar(255),
	`birth` date,
	`type` int,
	`sex` int,
	index(`p_id`),
	foreign key(`o_id`) references `organization`(`o_id`)
) CHARACTER SET 'utf8' ENGINE = InnoDB;

create table `match` (
	`m_id` int not null auto_increment primary key unique,
	`p_id` int,
	`o_id` int,
	`matchName` varchar(255),
	`sponsor` varchar(255),
	`created` datetime,
	`ended` datetime,
	`arrows` int,
	`perEnd` int,
	`length` int,
	`permission` int,
	index(`m_id`),
	foreign key(`p_id`) references `account`(`p_id`),
	foreign key(`o_id`) references `organization`(`o_id`)
) CHARACTER SET 'utf8' ENGINE = InnoDB;

create table `scoreCard` (
	`sc_id` int not null auto_increment primary key unique,
	`p_id` int,
	`m_id` int,
	`created` datetime,
	`place` varchar(255),
	index(`sc_id`),
	foreign key (`p_id`) references `account`(`p_id`),
	foreign key (`m_id`) references `match`	(`m_id`)
) CHARACTER SET 'utf8' ENGINE = InnoDB;

create table `scorePerEnd` (
	`spe_id` int not null auto_increment primary key unique,
	`sc_id` int,
	`p_id` int,
	`o_id` int,
	`perEnd` int,
	`score_1` varchar(5),
	`score_2` varchar(5),
	`score_3` varchar(5),
	`score_4` varchar(5),
	`score_5` varchar(5),
	`score_6` varchar(5),
	`updatedScore_1` varchar(5),
	`updatedScore_2` varchar(5),
	`updatedScore_3` varchar(5),
	`updatedScore_4` varchar(5),
	`updatedScore_5` varchar(5),
	`updatedScore_6` varchar(5),
	`subTotal` int,
	index(`spe_id`),
	foreign key(`sc_id`) references `scoreCard`(`sc_id`),
	foreign key(`p_id`) references `account`(`p_id`),
	foreign key(`o_id`) references `organization`(`o_id`)
) CHARACTER SET 'utf8' ENGINE = InnoDB;

create table `scoreTotal` (
	`st_id` int not null auto_increment primary key unique,
	`sc_id` int,
	`p_id` int,
	`o_id` int,
	`ten` int,
	`x` int,
	`total` int,
	index(`st_id`),
	foreign key (`sc_id`) references `scoreCard`(`sc_id`),
	foreign key (`p_id`) references `account`(`p_id`),
	foreign key (`o_id`) references `organization`(`o_id`)
) CHARACTER SET `utf8` ENGINE = InnoDB;
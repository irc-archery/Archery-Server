create database archery character set utf8;
use archery;
grant all on archery.* to archery_user@localhost;
set password for archery_user@localhost=password('archery_password');

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
	on update cascade on delete set null
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
	`status` int default 0,
	index(`m_id`),
	foreign key(`p_id`) references `account`(`p_id`)
	on update cascade on delete cascade,
	foreign key(`o_id`) references `organization`(`o_id`)
	on update cascade on delete set null
) CHARACTER SET 'utf8' ENGINE = InnoDB;

create table `scoreCard` (
	`sc_id` int not null auto_increment primary key unique,
	`p_id` int,
	`m_id` int,
	`created` datetime,
	`prefectures` varchar(255),
	`number` varchar(255),
	`status` int default 0,
	index(`sc_id`),
	foreign key (`p_id`) references `account`(`p_id`)
	on update cascade on delete cascade,
	foreign key (`m_id`) references `match`	(`m_id`)
	on update cascade on delete cascade
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
	foreign key(`sc_id`) references `scoreCard`(`sc_id`)
	on update cascade on delete cascade,
	foreign key(`p_id`) references `account`(`p_id`)
	on update cascade on delete cascade,
	foreign key(`o_id`) references `organization`(`o_id`)
	on update cascade on delete set null
) CHARACTER SET 'utf8' ENGINE = InnoDB;

create table `scoreTotal` (
	`st_id` int not null auto_increment primary key unique,
	`sc_id` int,
	`p_id` int,
	`o_id` int,
	`ten` int default 0,
	`x` int default 0,
	`total` int default 0,
	index(`st_id`),
	foreign key (`sc_id`) references `scoreCard`(`sc_id`)
	on update cascade on delete cascade,
	foreign key (`p_id`) references `account`(`p_id`)
	on update cascade on delete cascade,
	foreign key (`o_id`) references `organization`(`o_id`)
	on update cascade on delete set null
) CHARACTER SET `utf8` ENGINE = InnoDB;

# sample data of organization
insert into organization(p_id, organizationName, establish, place, email) values(1, '宮城県工業高等学校', now(), '仙台市', 'example@gmail.com');
insert into organization(p_id, organizationName, establish, place, email) values(2, '仙台工業高等学校', now(), '仙台市', 'example2@gmail.com');
insert into organization(p_id, organizationName, establish, place, email) values(3, 'ふにっと第一高等学校', now(), '仙台市 ふに区', 'example4@gmail.com');

# sample data of account
insert into account(o_id, firstName, lastName, email, password, birth, sex) values(1, '太郎', '県工', 'kenkou@gmail.com', 'password', '1997-08-06', 1);
insert into account(o_id, firstName, lastName, email, password, birth, sex) values(1, '二郎', '県工', 'kenkou2@gmail.com', 'password', '1998-05-05', 1);
insert into account(o_id, firstName, lastName, email, password) values(2, 'Fnit', 'Watanabe', 'example@gmail.com', 'password');
insert into account(o_id, firstName, lastName, email, password) values(3, '渡辺', 'ふにすけ', 'example4@gmail.com', 'password');


# sample data of match
#insert into `match`(p_id, o_id, matchName, sponsor, created, arrows, perEnd, length, permission) values(1, 1, '試合 1', '仙台工業高校', now(), 6, 6, 1, 0);
#insert into `match`(p_id, o_id, matchName, sponsor, created, arrows, perEnd, length, permission) values(2, 2, '試合 2', '情報研究部', now(), 6, 6, 1, 0);
#insert into `match`(p_id, o_id, matchName, sponsor, created, arrows, perEnd, length, permission) values(4, 3, '試合 3', 'ふにっと部', now(), 6, 6, 1, 0);

# sample data of scoreCard
#insert into scoreCard(p_id, m_id, created, place) values(1, 1, now(), '原ノ町');
#insert into scoreCard(p_id, m_id, created, place) values(2, 2, now(), '米ケ袋');
#insert into scoreCard(p_id, m_id, created, place) values(4, 3, now(), 'ふに町');
#insert into scoreCard(p_id, m_id, created, place) values(3, 1, now(), '原ノ町');

# sample data of scorePerEnd
#insert into scorePerEnd(sc_id, p_id, o_id, perEnd, score_1, score_2, score_3,score_4,score_5,score_6,subTotal) values(1, 1, 1, 1, 'x','10','8','2','m','m', 20);
#insert into scorePerEnd(sc_id, p_id, o_id, perEnd, score_1, score_2, score_3,score_4,score_5,score_6,subTotal) values(2, 2, 2, 1, '7','3','3','3','3','m', 19);
#insert into scorePerEnd(sc_id, p_id, o_id, perEnd, score_1, score_2, score_3,score_4,score_5,score_6,subTotal) values(3, 2, 2, 1, '4','3','2','1','m','m', 10);
#insert into scorePerEnd(sc_id, p_id, o_id, perEnd, score_1, score_2, score_3,score_4,score_5,score_6,subTotal) values(1, 1, 1, 2, 'x','x','x','10','3','2', 45);

#sample data of scoreTotal
#insert into scoreTotal(sc_id, p_id, o_id, ten, x, total) values(1, 1, 1, 4, 2, 65);
#insert into scoreTotal(sc_id, p_id, o_id, ten, x, total) values(2, 2, 2, 0, 0, 19);
#insert into scoreTotal(sc_id, p_id, o_id, ten, x, total) values(3, 2, 2, 0, 0, 10);

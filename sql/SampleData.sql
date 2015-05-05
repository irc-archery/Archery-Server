# sample data of organization
insert into organization(p_id, organizationName, establish, place, email) values(1, '仙台工業高等学校', now(), '仙台市 太白区', 'example@gmail.com');
insert into organization(p_id, organizationName, establish, place, email) values(2, '宮城県工業高等学校', now(), '仙台市 太白区', 'example@gmail.com');

# sample data of account
insert into account(o_id, firstName, lastName, email, password) values(1, '大貴', '渡辺', 'example@gmail.com', 'password');
insert into account(o_id, firstName, lastName, email, password) values(2, '名', '姓', 'example2@gmail.com', 'password');

# sample data of match
insert into `match`(p_id, o_id, matchName, created, arrows, perEnd, length) values(1, 1, '試合 1', now(), 6, 6, 70);
insert into `match`(p_id, o_id, matchName, created, arrows, perEnd, length) values(2, 2, '試合 2', now(), 4, 4, 50);

# sample data of scoreCard
insert into scoreCard(p_id, m_id, created, place) values(1, 1, now(), '原ノ町');
insert into scoreCard(p_id, m_id, created, place) values(2, 2, now(), '米ケ袋');
insert into scoreCard(p_id, m_id, created, place) values(2, 1, now(), '米ケ袋');

# sample data of score
insert into score(sc_id, p_id, o_id, score_1, scoreSubTotal_1, countMaxScore, countXScore, scoreTotal) values(1, 1, 1, "x,5,5,4,1,m", 25, 0, 1, 25);
insert into score(sc_id, p_id, o_id, score_1, scoreSubTotal_1, countMaxScore, countXScore, scoreTotal) values(2, 2, 2, "x,5,5,4", 24, 0, 1, 24);
insert into score(sc_id, p_id, o_id, score_1, scoreSubTotal_1, countMaxScore, countXScore, scoreTotal) values(3, 2, 2, "10,2,2,2,2,2", 20, 1, 0, 20);

# sample data of organization
insert into organization(p_id, organizationName, establish, place, email) values(1, '仙台工業高等学校', now(), '仙台市', 'example@gmail.com');
insert into organization(p_id, organizationName, establish, place, email) values(2, '宮城県工業高等学校', now(), '仙台市 青葉区', 'example2@gmail.com');

# sample data of account
insert into account(o_id, firstName, lastName, email, password) values(1, '大貴', '渡辺', 'example@gmail.com', 'password');
insert into account(o_id, firstName, lastName, email, password) values(2, '名', '姓', 'example2@gmail.com', 'password');
insert into account(o_id, firstName, lastName, email, password) values(1, 'Fnit', 'Watanabe', 'example3@gmail.com', 'password');

# sample data of match
insert into `match`(p_id, o_id, matchName, sponsor, created, arrows, perEnd, length) values(1, 1, '試合 1', '仙台工業高校', now(), 6, 6, 70);
insert into `match`(p_id, o_id, matchName, sponsor, created, arrows, perEnd, length) values(2, 2, '試合 2', '情報研究部', now(), 4, 4, 50);

# sample data of scoreCard
insert into scoreCard(p_id, m_id, created, place) values(1, 1, now(), '原ノ町');
insert into scoreCard(p_id, m_id, created, place) values(2, 2, now(), '米ケ袋');
insert into scoreCard(p_id, m_id, created, place) values(2, 1, now(), '米ケ袋');

# sample data of scorePerEnd
insert into scorePerEnd(sc_id, p_id, o_id, perEnd, score_1, score_2, score_3,score_4,score_5,score_6,subTotal) values(1, 1, 1, 1, 'x','10','8','2','m','m', 20);
insert into scorePerEnd(sc_id, p_id, o_id, perEnd, score_1, score_2, score_3,score_4,score_5,score_6,subTotal) values(2, 2, 2, 1, '7','3','3','3','3','m', 19);
insert into scorePerEnd(sc_id, p_id, o_id, perEnd, score_1, score_2, score_3,score_4,score_5,score_6,subTotal) values(3, 2, 2, 1, '4','3','2','1','m','m', 10);
insert into scorePerEnd(sc_id, p_id, o_id, perEnd, score_1, score_2, score_3,score_4,score_5,score_6,subTotal) values(1, 1, 1, 2, 'x','x','x','10','3','2', 45);

#sample data of scoreTotal
insert into scoreTotal(sc_id, p_id, o_id, ten, x, total) values(1, 1, 1, 4, 2, 65);
insert into scoreTotal(sc_id, p_id, o_id, ten, x, total) values(2, 2, 2, 0, 0, 19);
insert into scoreTotal(sc_id, p_id, o_id, ten, x, total) values(3, 2, 2, 0, 0, 10);

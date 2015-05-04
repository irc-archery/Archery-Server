insert into organization(organizationName, establish) values('fnit ON', now());
insert into account(o_id, firstName, lastName, email, password) values(1, 'mei', 'sei', 'fnit@gmail.com', 'password');
insert into `match`(p_id, o_id, matchName, created, length) values(1, 1, '試合 1', now(), 70);
insert into scoreCard(created, place) values(now(), 'fnit');
insert into score(sc_id, p_id, o_id, score_1, scoreSubTotal_1, countMaxScore, countXScore, scoreTotal) values(1, 1, 1, 5, 5, 1, 1, 5);
select score.sc_id, score.scoreTotal, score.sum from scoreCard, score where scoreCard.sc_id = score.sc_id;

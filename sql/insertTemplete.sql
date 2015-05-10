# 試合データを挿入するためのSQL文
insert into `match`(p_id, o_id, matchName, sponsor, created, arrows, perEnd, length) values(1, 1, '試合 1', '仙台工業高校', now(), 6, 6, 70);

#得点の挿入
insert into `scorePerEnd`(sc_id, p_id, o_id, perEnd, score_1, score_2, score_3, score_4, score_5, score_6, subTotal) values();
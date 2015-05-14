#得点表 一覧取得
select scoreCard.sc_id, scoreCard.scoreTotal, score.sum from scoreCard, score where scoreCard.sc_id = score.sc_id;

#試合一覧取得
select m_id from `match`;

select `match`.m_id, `match`.matchName, `match`.sponsor, `match`.created, `match`.arrows, `match`.perEnd, `match`.length, count(`scoreCard`.sc_id) as players 
from `match`, `scoreCard` 
where `match`.m_id = 1 and `scoreCard`.m_id = 1
union 
select `match`.m_id, `match`.matchName, `match`.sponsor, `match`.created, `match`.arrows, `match`.perEnd, `match`.length, count(`scoreCard`.sc_id) as players 
from `match`, `scoreCard` 
where `match`.m_id = 2 and `scoreCard`.m_id = 2;


# 得点表データの抽出

select scoreCard.sc_id, scoreCard.p_id from scoreCard where scoreCard.sc_id = 1;

select concat(account.lastName, account.firstName) as playerName from account where account.p_id = 1;

select `match`.length from `match` where `match`.m_id = 1;

select count(spe_id) as countPerEnd from scorePerEnd where scorePerEnd.sc_id = 1 and scorePerEnd.p_id = 1;

select scoreTotal.ten, scoreTotal.x, scoreTotal.total from scoreTotal where scoreTotal.sc_id = 1 and scoreTotal.p_id = 1;

select scorePerEnd.score_1, scorePerEnd.score_2, scorePerEnd.score_3, scorePerEnd.score_4, scorePerEnd.score_5, scorePerEnd.score_6, scorePerEnd.updatedScore_1, scorePerEnd.updatedScore_2, scorePerEnd.updatedScore_3, scorePerEnd.updatedScore_4, scorePerEnd.updatedScore_5, scorePerEnd.updatedScore_6, scorePerEnd.subTotal, scorePerEnd.perEnd from `scorePerEnd` where scorePerEnd.sc_id = 1 and scorePerEnd.p_id = 1;


#上記を結合

select scoreCard.sc_id, scoreCard.p_id, concat(account.lastName, account.firstName) as playerName, `match`.length, count(spe_id) as countPerEnd, scoreTotal.ten, scoreTotal.x, scoreTotal.total 
from `scoreCard`, `account`, `match`, `scoreTotal`, `scorePerEnd`
where scoreCard.sc_id = 1 and account.p_id = 1 and `match`.m_id = 1 and scorePerEnd.sc_id = 1 and scorePerEnd.p_id = 1 and scoreTotal.sc_id = 1 and scoreTotal.p_id = 1;

select scorePerEnd.score_1, scorePerEnd.score_2, scorePerEnd.score_3, scorePerEnd.score_4, scorePerEnd.score_5, scorePerEnd.score_6, scorePerEnd.updatedScore_1, scorePerEnd.updatedScore_2, scorePerEnd.updatedScore_3, scorePerEnd.updatedScore_4, scorePerEnd.updatedScore_5, scorePerEnd.updatedScore_6, scorePerEnd.subTotal, scorePerEnd.perEnd from `scorePerEnd` where scorePerEnd.sc_id = 1 and scorePerEnd.p_id = 1 order by scorePerEnd.perEnd asc;

#idの抽出
select scoreCard.sc_id, scoreCard.p_id, scoreCard.m_id from `scoreCard` where scoreCard.sc_id = 3;


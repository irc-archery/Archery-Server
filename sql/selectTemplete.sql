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
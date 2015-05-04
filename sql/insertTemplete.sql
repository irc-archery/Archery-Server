#得点表 一覧取得
select scoreCard.sc_id, scoreCard.scoreTotal, score.sum from scoreCard, score where scoreCard.sc_id = score.sc_id;

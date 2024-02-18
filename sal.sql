UPDATE personal_access_tokens
SET
    last_used_at = NOW (),
    expires_at = ADDDATE (ADDTIME (NOW (), "6:00:00"), 0)
WHERE
    token = ?;

AND expires_at >= NOW ();
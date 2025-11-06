<?php
require_once __DIR__.'/auth.php';
header('Content-Type: application/json');
$uid = require_auth();


global $pdo;
$stmt = $pdo->prepare('SELECT id, current_start_at FROM game_runs WHERE user_id=? AND is_completed=0');
$stmt->execute([$uid]);
if (!$r = $stmt->fetch()) { http_response_code(400); json_out(['error'=>'no_active_run']); }


$delta = 0;
if ($r['current_start_at']) {
  $delta = max(0, (strtotime('now') - strtotime($r['current_start_at']))*1000);
}
$pdo->prepare('UPDATE game_runs SET total_elapsed_ms=total_elapsed_ms+?, current_start_at=NULL, is_completed=1, completed_at=NOW() WHERE id=?')
->execute([$delta, $r['id']]);

$stmt = $pdo->prepare('SELECT total_elapsed_ms FROM game_runs WHERE id=?');
$stmt->execute([$r['id']]);
$total = (int)$stmt->fetchColumn();

json_out([
  'ok' => true,
  'run_id' => (int)$r['id'],
  'total_elapsed_ms' => $total,
  'user_id' => (int)$uid
]);

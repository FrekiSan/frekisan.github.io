<?php
require_once __DIR__.'/auth.php';
header('Content-Type: application/json');
$uid = current_user_id();
if (!$uid) {
  json_out(['authenticated' => false]);
}


// Statut du run
global $pdo; $stmt = $pdo->prepare('SELECT id, total_elapsed_ms, current_start_at, is_completed FROM game_runs WHERE user_id=? AND is_completed=0');
$stmt->execute([$uid]);
$run = $stmt->fetch();
json_out([
  'authenticated' => true,
  'user_id' => (int)$uid,
  'run' => $run
]);

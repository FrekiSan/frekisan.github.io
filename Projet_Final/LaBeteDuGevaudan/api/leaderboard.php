<?php
require_once __DIR__.'/db.php';
header('Content-Type: application/json');
$rows = $pdo->query('SELECT username, total_elapsed_ms, completed_at FROM leaderboard')->fetchAll();
echo json_encode(['rows'=>$rows]);
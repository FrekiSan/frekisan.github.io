<?php
require_once __DIR__.'/db.php';
header('Content-Type: application/json');
$in = json_decode(file_get_contents('php://input'), true) ?? $_POST;
$username = trim($in['username'] ?? '');
$email = trim($in['email'] ?? '');
$password = $in['password'] ?? '';


$stmt = $pdo->prepare('SELECT id, password_hash FROM users WHERE username=? OR email=?');
$stmt->execute([$username, $username]);
$u = $stmt->fetch();

if (!$u || !password_verify($password, $u['password_hash'])) {
    http_response_code(401);
    echo json_encode(['error' => 'invalid_credentials']);
    exit;
}


// Login OK
$_SESSION['uid'] = (int)$u['id'];
$pdo->prepare('UPDATE users SET last_login_at=NOW() WHERE id=?')->execute([$u['id']]);
$pdo->prepare('INSERT INTO user_sessions(user_id, login_at) VALUES(?, NOW())')->execute([$u['id']]);


// (Ré)ouvrir un run actif si nécessaire
$run = $pdo->prepare('SELECT id FROM game_runs WHERE user_id=? AND is_completed=0');
$run->execute([$u['id']]);
$r = $run->fetch();
if ($r) {
// Reprise: on relance le chrono
$pdo->prepare('UPDATE game_runs SET current_start_at=NOW() WHERE id=?')->execute([$r['id']]);
} else {
// Pas de run actif: on en créera un au premier "Démarrer"
}


echo json_encode(['ok'=>true, 'user_id'=>(int)$u['id']]);
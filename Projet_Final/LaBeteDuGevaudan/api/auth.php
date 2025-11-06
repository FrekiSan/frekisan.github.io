<?php
require_once __DIR__.'/db.php';


function current_user_id() {
return $_SESSION['uid'] ?? null;
}


function require_auth() {
$uid = current_user_id();
if (!$uid) { http_response_code(401); echo json_encode(['error'=>'unauthenticated']); exit; }
return $uid;
}


function json_out($data) {
header('Content-Type: application/json');
echo json_encode($data);
exit;
}
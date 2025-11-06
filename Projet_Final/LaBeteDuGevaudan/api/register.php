<?php
require_once __DIR__.'/db.php';
header('Content-Type: application/json');

$in = json_decode(file_get_contents('php://input'), true) ?? $_POST;

$username = trim($in['username'] ?? '');
$password = $in['password'] ?? '';
$email    = trim($in['email'] ?? '');
$consent  = isset($in['consent']) && (string)$in['consent'] === '1';

if ($username === '' || $password === '') {
  http_response_code(400);
  echo json_encode(['error' => 'missing_fields']);
  exit;
}

if (!$consent) {
  http_response_code(400);
  echo json_encode(['error' => 'rgpd_required']);
  exit;
}

function client_ip(): ?string {
  $hdrs = ['HTTP_X_FORWARDED_FOR','HTTP_CLIENT_IP','HTTP_X_REAL_IP','REMOTE_ADDR'];
  foreach ($hdrs as $h) {
    if (!empty($_SERVER[$h])) {
      $v = $_SERVER[$h];
      if ($h === 'HTTP_X_FORWARDED_FOR') {
        $parts = explode(',', $v);
        $v = trim($parts[0]);
      }
      return $v;
    }
  }
  return null;
}

$hash = password_hash($password, PASSWORD_DEFAULT);
$ip   = client_ip();
$privacyVersion = 'v1.0';

try {
  // Insert avec colonnes RGPD
  $stmt = $pdo->prepare('
    INSERT INTO users
      (username, email, password_hash, rgpd_consent, rgpd_consent_at, rgpd_consent_ip, privacy_version)
    VALUES
      (?, ?, ?, 1, NOW(), ?, ?)
  ');
  $stmt->execute([$username, $email ?: null, $hash, $ip, $privacyVersion]);
  $uid = (int)$pdo->lastInsertId();

  // Correctif défensif forcé
  try {
    $pdo->prepare('
      UPDATE users
         SET rgpd_consent    = 1,
             rgpd_consent_at = NOW(),
             rgpd_consent_ip = ?,
             privacy_version = ?
       WHERE id = ?
    ')->execute([$ip, $privacyVersion, $uid]);
  } catch (PDOException $e) { }

  echo json_encode(['ok' => true]);
}
catch (PDOException $e) {
  $msg = $e->getMessage();

  if (stripos($msg, 'Unknown column') !== false) {
    try {
      $stmt = $pdo->prepare('INSERT INTO users(username,email,password_hash) VALUES(?,?,?)');
      $stmt->execute([$username, $email ?: null, $hash]);
      $uid = (int)$pdo->lastInsertId();
      try {
        $pdo->prepare('
          UPDATE users
             SET rgpd_consent    = 1,
                 rgpd_consent_at = NOW(),
                 rgpd_consent_ip = ?,
                 privacy_version = ?
           WHERE id = ?
        ')->execute([$ip, $privacyVersion, $uid]);
      } catch (PDOException $e2) { }
      echo json_encode(['ok' => true]);
      exit;
    } catch (PDOException $e2) {
      if (str_contains(strtolower($e2->getMessage()), 'duplicate')) {
        http_response_code(409); echo json_encode(['error'=>'username_taken']); exit;
      }
      http_response_code(500); echo json_encode(['error'=>'db_error','details'=>$e2->getMessage()]); exit;
    }
  }

  if (str_contains(strtolower($msg), 'duplicate')) {
    http_response_code(409); echo json_encode(['error'=>'username_taken']); exit;
  }
  http_response_code(500); echo json_encode(['error'=>'db_error','details'=>$msg]);
}

<?php
// api/logout.php
require_once __DIR__.'/db.php'; // pour récupérer la config de session si besoin
header('Content-Type: application/json');

// Démarre la session si pas déjà
if (session_status() !== PHP_SESSION_ACTIVE) {
  @session_start();
}

// Sauvegarde du temps courant sur le run actif
$uid = $_SESSION['uid'] ?? null;
$totalElapsed = null;
if ($uid) {
  $stmt = $pdo->prepare('SELECT id, total_elapsed_ms, current_start_at FROM game_runs WHERE user_id=? AND is_completed=0');
  $stmt->execute([$uid]);
  if ($run = $stmt->fetch()) {
    $delta = 0;
    if (!empty($run['current_start_at'])) {
      $delta = max(0, (strtotime('now') - strtotime($run['current_start_at'])) * 1000);
      $pdo->prepare('UPDATE game_runs SET total_elapsed_ms=total_elapsed_ms+?, current_start_at=NULL WHERE id=?')
        ->execute([$delta, $run['id']]);
    }
    $totalElapsed = (int)$run['total_elapsed_ms'] + $delta;
  }

  // Journalise la déconnexion dans user_sessions
  $pdo->prepare('UPDATE user_sessions SET logout_at=NOW() WHERE user_id=? AND logout_at IS NULL ORDER BY login_at DESC LIMIT 1')
      ->execute([$uid]);
}

// Vide la session
$_SESSION = [];

// Efface le cookie de session (nom défini dans env.php → EGSESSID)
$cookieName = session_name();
if (isset($_COOKIE[$cookieName])) {
  // Signature compatible PHP 7/8
  setcookie($cookieName, '', time() - 3600, '/');
}

// Détruit la session serveur
@session_destroy();

// Réponse OK
echo json_encode([
  'ok' => true,
  'total_elapsed_ms' => $totalElapsed,
  'user_id' => $uid ? (int)$uid : null
]);

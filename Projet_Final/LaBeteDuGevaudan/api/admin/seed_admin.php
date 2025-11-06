<?php
// A lancer une seule fois puis supprimer.
require_once __DIR__.'/../db.php';

$username = 'admin';
$password = 'H3l105!!'; // A changer ensuite !

$hash = password_hash($password, PASSWORD_DEFAULT);
try {
  $pdo->prepare('INSERT INTO users(username,password_hash,is_admin) VALUES(?,?,1)')
      ->execute([$username, $hash]);
  echo "Admin créé: $username\n";
} catch (PDOException $e) {
  $pdo->prepare('UPDATE users SET is_admin=1 WHERE username=?')->execute([$username]);
  echo "Admin promu (ou déjà admin): $username\n";
}
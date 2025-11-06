<?php

    $host = getenv('DB_HOST') ?: 'db';
    $name = getenv('DB_NAME') ?: (getenv('MYSQL_DATABASE') ?: 'escape_game');
    $user = getenv('DB_USER') ?: (getenv('MYSQL_USER') ?: 'escape_user');
    $pass = getenv('DB_PASS') ?: (getenv('MYSQL_PASSWORD') ?: 'escape_pass');

return [
  // db.php s'attend à ces 3 clés :
  'db_dsn' => "mysql:host={$host};dbname={$name};charset=utf8mb4",
  'db_user' => $user,
  'db_pass' => $pass,

  // Session
  'session_name' => 'EGSESSID',
  'session_secure' => false, // à passer à true en HTTPS prod
  'session_http_only' => true,
];
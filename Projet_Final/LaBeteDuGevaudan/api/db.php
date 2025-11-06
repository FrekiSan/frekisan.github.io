<?php
$config = require __DIR__.'/env.php';
$pdo = new PDO($config['db_dsn'], $config['db_user'], $config['db_pass'], [
PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
]);


session_name($config['session_name']);
session_set_cookie_params([
'httponly' => $config['session_http_only'],
'secure' => $config['session_secure'],
'samesite' => 'Lax'
]);
session_start();
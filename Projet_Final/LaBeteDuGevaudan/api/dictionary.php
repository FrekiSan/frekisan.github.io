<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

$dictionaryPath = __DIR__ . '/data/data_dictionary.json';

if (!is_file($dictionaryPath)) {
    http_response_code(503);
    echo json_encode([
        'ok' => false,
        'error' => 'dictionary_unavailable',
        'message' => 'The generated data dictionary is missing. Run tools/build_data_dictionary.py first.',
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    exit;
}

$json = file_get_contents($dictionaryPath);
if ($json === false) {
    http_response_code(500);
    echo json_encode([
        'ok' => false,
        'error' => 'dictionary_read_error',
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    exit;
}

$data = json_decode($json, true);
if (!is_array($data)) {
    http_response_code(500);
    echo json_encode([
        'ok' => false,
        'error' => 'dictionary_parse_error',
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    exit;
}

$response = [
    'ok' => true,
    'generated_at' => gmdate('c', (int) filemtime($dictionaryPath)),
    'sources' => [
        'excel' => 'escape_game_dictionnaire.xlsx',
        'ods' => 'DICO_Escape_Game.ods',
    ],
    'dictionary' => $data,
];

echo json_encode($response, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

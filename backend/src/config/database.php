<?php

function getDatabaseConnection()
{
    static $pdo = null;

    if ($pdo !== null) {
        return $pdo;
    }

    $config = require __DIR__ . '/config.php';
    $dsn = "mysql:host={$config['db_host']};port={$config['db_port']};dbname={$config['db_name']};charset=utf8mb4";

    try {
        $pdo = new PDO($dsn, $config['db_user'], $config['db_REDACTED_PASSWORD'], [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]);
    } catch (PDOException $exception) {
        jsonResponse([
            'success' => false,
            'message' => 'Databaseverbinding mislukt.',
            'error' => $exception->getMessage(),
        ], 500);
    }

    return $pdo;
}

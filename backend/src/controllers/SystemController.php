<?php

function healthCheck()
{
    jsonResponse([
        'success' => true,
        'message' => 'BudgetMaatje API werkt.',
    ]);
}

function databaseStatusCheck()
{
    try {
        $pdo = getDatabaseConnection();

        $databaseName = $pdo->query('SELECT DATABASE() AS database_name')->fetch();

        jsonResponse([
            'success' => true,
            'connected' => true,
            'message' => 'Databaseverbinding gelukt.',
            'database_name' => $databaseName['database_name'] ?? null,
        ]);
    } catch (Throwable $exception) {
        jsonResponse([
            'success' => false,
            'connected' => false,
            'message' => 'Databaseverbinding mislukt.',
            'error' => $exception->getMessage(),
        ], 500);
    }
}

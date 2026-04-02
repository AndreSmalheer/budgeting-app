<?php

function getTransactions()
{
    $potId = getQueryValue('pot_id');

    jsonResponse([
        'success' => true,
        'message' => 'Basisroute voor transacties ophalen staat klaar.',
        'pot_id' => $potId,
        'next_step' => 'Maak hier een SELECT query op de tabel transactions.',
    ]);
}

function createTransaction()
{
    $config = require __DIR__ . '/../config/config.php';
    $input = getJsonInput();
    $amount = isset($input['amount']) ? (float) $input['amount'] : 0;
    $type = $input['type'] ?? '';

    $needsApproval = $type === 'withdraw' && $amount > $config['approval_limit'];
    $status = $needsApproval ? 'pending' : 'approved';

    jsonResponse([
        'success' => true,
        'message' => 'Basisroute voor transactie aanmaken staat klaar.',
        'approval_required' => $needsApproval,
        'status' => $status,
        'next_step' => 'Voeg hier validatie, saldo-controle, INSERT INTO transactions en update van pots.balance toe.',
        'received_data' => $input,
    ], 201);
}

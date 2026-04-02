<?php

function getPendingApprovals()
{
    jsonResponse([
        'success' => true,
        'message' => 'Basisroute voor openstaande goedkeuringen staat klaar.',
        'next_step' => 'Maak hier een SELECT query voor pending withdraw transacties.',
    ]);
}

function updateApprovalStatus()
{
    $input = getJsonInput();

    jsonResponse([
        'success' => true,
        'message' => 'Basisroute voor goedkeuren of afwijzen staat klaar.',
        'next_step' => 'Werk hier status, approved_by en eventueel pots.balance bij.',
        'received_data' => $input,
    ]);
}

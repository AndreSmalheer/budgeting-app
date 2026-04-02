<?php

function getPots()
{
    $childId = getQueryValue('child_id');

    jsonResponse([
        'success' => true,
        'message' => 'Basisroute voor potjes ophalen staat klaar.',
        'child_id' => $childId,
        'next_step' => 'Maak hier een SELECT query op de tabel pots.',
    ]);
}

function createPot()
{
    $input = getJsonInput();

    jsonResponse([
        'success' => true,
        'message' => 'Basisroute voor potje aanmaken staat klaar.',
        'next_step' => 'Voeg hier een INSERT INTO pots toe.',
        'received_data' => $input,
    ], 201);
}

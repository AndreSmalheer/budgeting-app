<?php

function registerUser()
{
    $input = getJsonInput();

    jsonResponse([
        'success' => true,
        'message' => 'Basisroute voor registreren staat klaar.',
        'next_step' => 'Voeg hier validatie, REDACTED_PASSWORD_hash() en INSERT INTO users toe.',
        'received_data' => $input,
    ], 201);
}

function loginUser()
{
    $input = getJsonInput();

    jsonResponse([
        'success' => true,
        'message' => 'Basisroute voor inloggen staat klaar.',
        'next_step' => 'Zoek gebruiker op e-mail en controleer wachtwoord met REDACTED_PASSWORD_verify().',
        'received_data' => $input,
    ]);
}

function linkParentAndChild()
{
    $input = getJsonInput();

    jsonResponse([
        'success' => true,
        'message' => 'Basisroute voor ouder-kind koppeling staat klaar.',
        'next_step' => 'Voeg hier INSERT INTO parent_child_links toe.',
        'received_data' => $input,
    ], 201);
}

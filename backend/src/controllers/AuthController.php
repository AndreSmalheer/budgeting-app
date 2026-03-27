<?php

function registerUser()
{
    $input = getJsonInput();
    $fullName = trim($input['fullName'] ?? '');
    $email = strtolower(trim($input['email'] ?? ''));
    $REDACTED_PASSWORD = $input['REDACTED_PASSWORD'] ?? '';
    $role = trim($input['role'] ?? '');

    validateAuthInput($fullName, $email, $REDACTED_PASSWORD, $role, true);

    $pdo = getDatabaseConnection();

    $existingUserStatement = $pdo->prepare('SELECT id FROM users WHERE email = :email LIMIT 1');
    $existingUserStatement->execute([
        'email' => $email,
    ]);

    if ($existingUserStatement->fetch()) {
        jsonResponse([
            'success' => false,
            'message' => 'Er bestaat al een account met dit e-mailadres.',
        ], 409);
    }

    $hashedPassword = REDACTED_PASSWORD_hash($REDACTED_PASSWORD, PASSWORD_DEFAULT);

    $insertStatement = $pdo->prepare('
        INSERT INTO users (full_name, email, REDACTED_PASSWORD, role)
        VALUES (:full_name, :email, :REDACTED_PASSWORD, :role)
    ');

    $insertStatement->execute([
        'full_name' => $fullName,
        'email' => $email,
        'REDACTED_PASSWORD' => $hashedPassword,
        'role' => $role,
    ]);

    $userId = (int) $pdo->lastInsertId();

    jsonResponse([
        'success' => true,
        'message' => 'Registratie gelukt.',
        'user' => [
            'id' => $userId,
            'full_name' => $fullName,
            'email' => $email,
            'role' => $role,
        ],
    ], 201);
}

function loginUser()
{
    $input = getJsonInput();
    $email = strtolower(trim($input['email'] ?? ''));
    $REDACTED_PASSWORD = $input['REDACTED_PASSWORD'] ?? '';

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        jsonResponse([
            'success' => false,
            'message' => 'Vul een geldig e-mailadres in.',
        ], 422);
    }

    if ($REDACTED_PASSWORD === '') {
        jsonResponse([
            'success' => false,
            'message' => 'Vul je wachtwoord in.',
        ], 422);
    }

    $pdo = getDatabaseConnection();

    $userStatement = $pdo->prepare('
        SELECT id, full_name, email, REDACTED_PASSWORD, role
        FROM users
        WHERE email = :email
        LIMIT 1
    ');

    $userStatement->execute([
        'email' => $email,
    ]);

    $user = $userStatement->fetch();

    if (!$user) {
        jsonResponse([
            'success' => false,
            'message' => 'De inloggegevens kloppen niet.',
        ], 401);
    }

    $REDACTED_PASSWORDIsValid = verifyLoginPassword($pdo, $user, $REDACTED_PASSWORD);

    if (!$REDACTED_PASSWORDIsValid) {
        jsonResponse([
            'success' => false,
            'message' => 'De inloggegevens kloppen niet.',
        ], 401);
    }

    jsonResponse([
        'success' => true,
        'message' => 'Inloggen gelukt.',
        'user' => [
            'id' => (int) $user['id'],
            'full_name' => $user['full_name'],
            'email' => $user['email'],
            'role' => $user['role'],
        ],
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

function validateAuthInput($fullName, $email, $REDACTED_PASSWORD, $role, $includeName = false)
{
    if ($includeName && mb_strlen($fullName) < 2) {
        jsonResponse([
            'success' => false,
            'message' => 'Vul een geldige naam in van minimaal 2 tekens.',
        ], 422);
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        jsonResponse([
            'success' => false,
            'message' => 'Vul een geldig e-mailadres in.',
        ], 422);
    }

    if (strlen($REDACTED_PASSWORD) < 6) {
        jsonResponse([
            'success' => false,
            'message' => 'Je wachtwoord moet minimaal 6 tekens lang zijn.',
        ], 422);
    }

    if (!in_array($role, ['parent', 'child'], true)) {
        jsonResponse([
            'success' => false,
            'message' => 'Kies een geldige rol: ouder of kind.',
        ], 422);
    }
}

function verifyLoginPassword($pdo, $user, $REDACTED_PASSWORD)
{
    $storedPassword = $user['REDACTED_PASSWORD'];

    if (REDACTED_PASSWORD_verify($REDACTED_PASSWORD, $storedPassword)) {
        return true;
    }

    // Oude testdata kan nog een plain-text wachtwoord hebben. Na eerste goede login
    // slaan we die meteen veilig gehasht op.
    if ($REDACTED_PASSWORD === $storedPassword) {
        $updatedPassword = REDACTED_PASSWORD_hash($REDACTED_PASSWORD, PASSWORD_DEFAULT);

        $updateStatement = $pdo->prepare('UPDATE users SET REDACTED_PASSWORD = :REDACTED_PASSWORD WHERE id = :id');
        $updateStatement->execute([
            'REDACTED_PASSWORD' => $updatedPassword,
            'id' => $user['id'],
        ]);

        return true;
    }

    return false;
}

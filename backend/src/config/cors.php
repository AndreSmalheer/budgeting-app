<?php

function sendCorsHeaders()
{
    $config = require __DIR__ . '/config.php';

    header('Access-Control-Allow-Origin: ' . $config['frontend_url']);
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    header('Access-Control-Allow-Methods: GET, POST, PATCH, OPTIONS');
    header('Content-Type: application/json; charset=utf-8');
}

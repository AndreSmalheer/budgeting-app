<?php

require_once __DIR__ . '/../src/bootstrap.php';

sendCorsHeaders();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    jsonResponse([
        'success' => true,
        'message' => 'CORS preflight gelukt.',
    ]);
}

$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$basePath = rtrim(str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME'])), '/');

if ($basePath !== '' && $basePath !== '/' && str_starts_with($path, $basePath)) {
    $path = substr($path, strlen($basePath));
}

if (str_starts_with($path, '/index.php')) {
    $path = substr($path, strlen('/index.php'));
}

$path = rtrim($path, '/');

if ($path === '') {
    $path = '/';
}

$routes = require __DIR__ . '/../src/routes.php';
$routeKey = $method . ' ' . $path;

if (!isset($routes[$routeKey])) {
    jsonResponse([
        'success' => false,
        'message' => 'Route niet gevonden.',
        'requested_route' => $routeKey,
    ], 404);
}

$handler = $routes[$routeKey];

try {
    $handler();
} catch (Throwable $exception) {
    jsonResponse([
        'success' => false,
        'message' => 'Er ging iets mis in de backend.',
        'error' => $exception->getMessage(),
    ], 500);
}

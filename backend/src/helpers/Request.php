<?php

function getJsonInput()
{
    $rawInput = file_get_contents('php://input');

    if (!$rawInput) {
        return [];
    }

    $data = json_decode($rawInput, true);

    return is_array($data) ? $data : [];
}

function getQueryValue($key, $defaultValue = null)
{
    return $_GET[$key] ?? $defaultValue;
}

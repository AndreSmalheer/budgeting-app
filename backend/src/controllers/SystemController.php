<?php

function healthCheck()
{
    jsonResponse([
        'success' => true,
        'message' => 'BudgetMaatje API werkt.',
    ]);
}

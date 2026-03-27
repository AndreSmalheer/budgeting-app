<?php

return [
    'GET /api/health' => 'healthCheck',
    'GET /api/db-status' => 'databaseStatusCheck',
    'POST /api/register' => 'registerUser',
    'POST /api/login' => 'loginUser',
    'POST /api/link-parent-child' => 'linkParentAndChild',
    'GET /api/pots' => 'getPots',
    'POST /api/pots' => 'createPot',
    'GET /api/transactions' => 'getTransactions',
    'POST /api/transactions' => 'createTransaction',
    'GET /api/approvals' => 'getPendingApprovals',
    'PATCH /api/approvals' => 'updateApprovalStatus',
];

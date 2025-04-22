<?php
// Include database and utility functions
include_once '../includes/db.php';
include_once '../includes/utils.php';

// Don't use setJsonHeaders() as it uses a wildcard origin
// Instead set custom CORS headers supporting credentials
header("Content-Type: application/json");

// Set CORS headers properly for credentials
$allowedOrigins = [
    'http://127.0.0.1:5500',
    'http://localhost:5500',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost',
    'http://127.0.0.1'
];

$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';

if (in_array($origin, $allowedOrigins)) {
    header("Access-Control-Allow-Origin: $origin");
    header("Access-Control-Allow-Credentials: true");
    header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
}

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Process only POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); // Method Not Allowed
    echo jsonResponse(false, "Method not allowed");
    exit;
}

// Start session - don't check if user is logged in, just proceed with logout
session_start();

// Clear session data regardless of whether user was logged in
$_SESSION = array();

// Delete the session cookie
if (ini_get("session.use_cookies")) {
    $params = session_get_cookie_params();
    setcookie(
        session_name(), 
        '', 
        time() - 42000,
        $params["path"], 
        $params["domain"],
        $params["secure"], 
        $params["httponly"]
    );
}

// Destroy the session
session_destroy();

// Clear all possible authentication cookies
$cookies_to_clear = [
    'user_session',
    'PHPSESSID',
    'sessionid'
];

foreach ($cookies_to_clear as $cookie_name) {
    setcookie(
        $cookie_name,
        '',
        time() - 3600,
        '/',
        '',
        false,
        false
    );
}

// Return success response
http_response_code(200);
echo jsonResponse(true, "Logout successful");
?>
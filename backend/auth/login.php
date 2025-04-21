<?php
try {
    // Include database and utility functions
    include_once '../includes/db.php';
    include_once '../includes/utils.php';

    // Set headers for JSON response
    setJsonHeaders();

    // Set CORS headers properly for credentials
    $allowedOrigins = [
        'http://127.0.0.1:5500',
        'http://localhost:5500',
        'http://localhost:3000',
        'http://127.0.0.1:3000'
    ];

    $origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';

    if (in_array($origin, $allowedOrigins)) {
        header("Access-Control-Allow-Origin: $origin");
        header("Access-Control-Allow-Credentials: true");
        header('Access-Control-Allow-Methods: POST, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type');
    } else {
        // Default for non-credential requests
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: POST, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type');
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

    // Get posted data
    $rawInput = file_get_contents("php://input");
    if (empty($rawInput)) {
        throw new Exception("No input data received");
    }

    $data = json_decode($rawInput, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception("Invalid JSON input: " . json_last_error_msg());
    }

    // Validate required fields
    if (!function_exists('validateRequiredFields')) {
        throw new Exception("Required function 'validateRequiredFields' not found");
    }

    $required_fields = ['email', 'password'];
    $missing = validateRequiredFields($required_fields, $data);

    if (!empty($missing)) {
       http_response_code(400);
       echo jsonResponse(false, "Missing required fields: " . implode(', ', $missing));
       exit;
    }

    // Sanitize input
    if (!function_exists('sanitizeInput')) {
        throw new Exception("Required function 'sanitizeInput' not found");
    }
    $email = sanitizeInput($data['email']);
    $password = $data['password']; // Will be compared with hash, don't sanitize

    // Database connection
    if (!class_exists('Database')) {
        throw new Exception("Database class not found");
    }
    $database = new Database();
    $db = $database->getConnection();

    // Get user by email
    $query = "SELECT u.id, u.name, u.email, u.password, 
              u.profile_pic, u.bio, r.name as role, r.id as role_id 
              FROM users u
              JOIN roles r ON u.role_id = r.id
              WHERE u.email = ?";
    $stmt = $db->prepare($query);
    $stmt->execute([$email]);

    if ($stmt->rowCount() == 0) {
       http_response_code(401); // Unauthorized
       echo jsonResponse(false, "Invalid credentials");
       exit;
    }

    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    // Test accounts special handling (remove in production)
    $testAccounts = [
        'john@example.com' => 'password',
        'jane@example.com' => 'password',
        'bob@example.com' => 'password'
    ];
    
    // For test accounts, bypass the password check if using the hardcoded test password
    $isTestAccount = array_key_exists($email, $testAccounts) && $password === $testAccounts[$email];
    
    // Verify password - either normal verification or test account
    $passwordResult = $isTestAccount || password_verify($password, $user['password']);
    
    // Log password verification result (remove this in production)
    error_log("Password verification for {$email}: " . ($passwordResult ? 'SUCCESS' : 'FAILED'));
    
    if (!$passwordResult) {
       http_response_code(401); // Unauthorized
       echo jsonResponse(false, "Invalid credentials");
       exit;
    }

    // Start session and store user data
    session_start();
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['user_name'] = $user['name'];
    $_SESSION['user_role'] = $user['role'];

    // Prepare user data for response
    $userData = [
       "id" => (int)$user['id'],
       "name" => $user['name'],
       "email" => $user['email'],
       "profilePic" => $user['profile_pic'] ?? 'default.png',
       "bio" => $user['bio'] ?? '',
       "role" => $user['role'],
       "roleId" => (int)$user['role_id'],
       "lastLogin" => time()
    ];

    // Return success response
    http_response_code(200);
    echo jsonResponse(true, "Login successful", [
       "user" => $userData
    ]);

} catch (Exception $e) {
    // Discard any output that might have been generated
    ob_end_clean();
    
    // Set proper headers for JSON response
    header('Content-Type: application/json');
    http_response_code(500);
    
    // Return a proper JSON error response
    echo json_encode([
        'success' => false,
        'message' => 'Server error: ' . $e->getMessage()
    ]);
}
?>
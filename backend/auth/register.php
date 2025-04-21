<?php
// Include database and utility functions
include_once '../includes/db.php';
include_once '../includes/utils.php';

// Set JSON headers
setJsonHeaders();

// Process only POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); // Method Not Allowed
    echo jsonResponse(false, "Method not allowed");
    exit;
}

// Get request data and validate required fields
$data = getRequestData(['name', 'email', 'password']);

// The data is already sanitized by getRequestData
$name = $data['name'];
$email = $data['email'];
$password = $data['password']; // Will be hashed, don't sanitize again
$bio = $data['bio'] ?? ''; // Bio is optional will be updated later in the profile page

// Validate email
if (!validateEmail($email)) {
    http_response_code(400);
    echo jsonResponse(false, "Invalid email format");
    exit;
}

try {
    // Get database connection
    $database = new Database();
    $db = $database->getConnection();

    // Check if email already exists
    $check_stmt = $db->prepare("SELECT id FROM users WHERE email = ?");
    $check_stmt->execute([$email]);

    if ($check_stmt->rowCount() > 0) {
        http_response_code(409); // Conflict
        echo jsonResponse(false, "Email already registered");
        exit;
    }

    // Hash the password
    $hashedPassword = password_hash($password, PASSWORD_BCRYPT);

    // Set defaults
    $profile_pic = 'default.png';
    $role_id = 2; // Regular user

    // Insert user into database
    $stmt = $db->prepare("
        INSERT INTO users (name, email, password, bio, profile_pic, role_id)
        VALUES (?, ?, ?, ?, ?, ?)
    ");
    $stmt->execute([$name, $email, $hashedPassword, $bio, $profile_pic, $role_id]);
    
    // Get the user ID
    $user_id = $db->lastInsertId();
    
    // Start session and log user in
    session_start();
    $_SESSION['user_id'] = $user_id;
    $_SESSION['user_name'] = $name;
    $_SESSION['user_role'] = 'user';
    
    // Return success response
    http_response_code(201); // Created
    echo jsonResponse(true, "Registration successful! 🎉", ["user_id" => $user_id]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo jsonResponse(false, "Registration failed: " . $e->getMessage());
}
?>

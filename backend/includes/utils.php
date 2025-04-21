<!-- All handy utility functions goes here -->
<?php
/**
 * Utility functions for the Goodreads Clone API
 */

/**
 * Set headers for JSON responses
 */
function setJsonHeaders() {
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: POST, GET, OPTIONS, PUT, DELETE");
    header("Access-Control-Allow-Headers: Content-Type, Authorization");
    header("Content-Type: application/json");
    
    // Handle preflight OPTIONS requests
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit;
    }
}

/**
 * Create a standardized JSON response
 *
 * @param bool $success Whether the operation was successful
 * @param string $message A message describing the result
 * @param array $data Optional data to include in the response
 * @return string JSON-encoded response
 */
function jsonResponse($success, $message, $data = []) {
    $response = [
        'success' => $success,
        'message' => $message
    ];
    
    if (!empty($data)) {
        $response['data'] = $data;
    }
    
    return json_encode($response);
}

/**
 * Sanitize user input to prevent XSS and other attacks
 *
 * @param string $input The input to sanitize
 * @return string The sanitized input
 */
function sanitizeInput($input) {
    if (is_string($input)) {
        $input = trim($input);
        $input = stripslashes($input);
        $input = htmlspecialchars($input, ENT_QUOTES, 'UTF-8');
    }
    return $input;
}

/**
 * Validate that all required fields are present
 *
 * @param array $required_fields List of required field names
 * @param array $data The data to validate
 * @return array List of missing field names
 */
function validateRequiredFields($required_fields, $data) {
    $missing = [];
    foreach ($required_fields as $field) {
        if (!isset($data[$field]) || (is_string($data[$field]) && trim($data[$field]) === '')) {
            $missing[] = $field;
        }
    }
    return $missing;
}

/**
 * Validate email format
 *
 * @param string $email The email to validate
 * @return bool Whether the email is valid
 */
function validateEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

/**
 * Get JSON data from request body
 *
 * @return array The decoded JSON data
 */
function getJsonInput() {
    $json = file_get_contents("php://input");
    return json_decode($json, true) ?? [];
}

/**
 * Handle either form data or JSON input
 * 
 * @param array $required_fields List of required field names
 * @return array The sanitized data
 */
function getRequestData($required_fields = []) {
    // Check if the request has a JSON content type
    $contentType = isset($_SERVER["CONTENT_TYPE"]) ? trim($_SERVER["CONTENT_TYPE"]) : '';
    
    if (strpos($contentType, 'application/json') !== false) {
        // Handle JSON input
        $data = getJsonInput();
    } else {
        // Handle form data
        $data = $_POST;
    }
    
    // Validate required fields if specified
    if (!empty($required_fields)) {
        $missing = validateRequiredFields($required_fields, $data);
        if (!empty($missing)) {
            http_response_code(400);
            echo jsonResponse(false, "Missing required fields: " . implode(', ', $missing));
            exit;
        }
    }
    
    // Sanitize all string values
    foreach ($data as $key => $value) {
        if (is_string($value)) {
            $data[$key] = sanitizeInput($value);
        }
    }
    
    return $data;
}

// Check if user is logged in
function isLoggedIn() {
    if (session_status() == PHP_SESSION_NONE) {
        session_start();
    }
    
    return isset($_SESSION['user_id']);
}

// Get current user ID
function getCurrentUserId() {
    if (session_status() == PHP_SESSION_NONE) {
        session_start();
    }
    
    return $_SESSION['user_id'] ?? null;
}

// Validate required fields
// function validateRequiredFields($fields, $data) {
//     $missing = [];
    
//     foreach ($fields as $field) {
//         if (!isset($data[$field]) || empty($data[$field])) {
//             $missing[] = $field;
//         }
//     }
    
//     return $missing;
// }

/**
 * Check if current user is an admin
 * 
 * @return bool True if user is admin, false otherwise
 */
function isAdmin() {
    $user_id = getCurrentUserId();
    
    if (!$user_id) {
        return false;
    }
    
    $database = new Database();
    $db = $database->getConnection();
    
    $query = "SELECT r.name as role FROM users u 
              JOIN roles r ON u.role_id = r.id 
              WHERE u.id = ?";
    $stmt = $db->prepare($query);
    $stmt->execute([$user_id]);
    
    if ($stmt->rowCount() > 0) {
        $user = $stmt->fetch();
        return $user['role'] === 'admin';
    }
    
    return false;
}

/**
 * Get user role
 * 
 * @param int $user_id User ID
 * @return string|null Role name or null if user not found
 */
function getUserRole($user_id = null) {
    if ($user_id === null) {
        $user_id = getCurrentUserId();
    }
    
    if (!$user_id) {
        return null;
    }
    
    $database = new Database();
    $db = $database->getConnection();
    
    $query = "SELECT r.name as role FROM users u 
              JOIN roles r ON u.role_id = r.id 
              WHERE u.id = ?";
    $stmt = $db->prepare($query);
    $stmt->execute([$user_id]);
    
    if ($stmt->rowCount() > 0) {
        $user = $stmt->fetch();
        return $user['role'];
    }
    
    return null;
}

/**
 * Check if user has permission for an action
 * 
 * @param string $action The action to check permission for
 * @param int $resource_owner_id The ID of the resource owner (optional)
 * @return bool True if user has permission, false otherwise
 */
function hasPermission($action, $resource_owner_id = null) {
    $user_id = getCurrentUserId();
    
    if (!$user_id) {
        return false;
    }
    
    // Admin has all permissions
    if (isAdmin()) {
        return true;
    }
    
    // Users can edit their own resources
    if ($resource_owner_id !== null && $user_id == $resource_owner_id) {
        return true;
    }
    
    // Add more specific permission checks as needed
    switch ($action) {
        case 'view_books':
        case 'search_books':
        case 'view_reviews':
        case 'add_review':
        case 'add_to_shelf':
            // All authenticated users can do these actions
            return true;
            
        case 'manage_books':
        case 'delete_any_review':
        case 'delete_any_comment':
            // Only admins can do these actions
            return false;
            
        default:
            return false;
    }
}

/**
 * Log an action for audit purposes
 * 
 * @param string $action The action performed
 * @param string $resource_type The type of resource
 * @param int $resource_id The ID of the resource
 * @param array $details Additional details about the action
 * @return void
 */
function logAction($action, $resource_type, $resource_id, $details = []) {
    $user_id = getCurrentUserId();
    $timestamp = date('Y-m-d H:i:s');
    $ip = $_SERVER['REMOTE_ADDR'];
    
    // In a real application, we would log this to a database or file
    // For this example, we'll just create a log message
    $log_message = sprintf(
        "[%s] User %d performed %s on %s %d from IP %s. Details: %s",
        $timestamp,
        $user_id,
        $action,
        $resource_type,
        $resource_id,
        $ip,
        json_encode($details)
    );
    
    // In a real application, we would save this log
    // error_log($log_message);
}
?>

<?php
// Returns recent reviews from users the current user follows
include_once '../includes/db.php';
session_start();

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Not authenticated']);
    exit;
}

$userId = $_SESSION['user_id'];
$database = new Database();
$db = $database->getConnection();

// Get IDs of users this user follows
$stmt = $db->prepare('SELECT followed_id FROM follows WHERE follower_id = ?');
$stmt->execute([$userId]);
$followedIds = $stmt->fetchAll(PDO::FETCH_COLUMN);

if (empty($followedIds)) {
    echo json_encode(['success' => true, 'feed' => []]);
    exit;
}

// Get recent reviews from followed users
$in = str_repeat('?,', count($followedIds) - 1) . '?';
$query = "SELECT r.*, u.name, u.profile_pic FROM reviews r JOIN users u ON r.user_id = u.id WHERE r.user_id IN ($in) ORDER BY r.created_at DESC LIMIT 20";
$stmt = $db->prepare($query);
$stmt->execute($followedIds);
$feed = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode(['success' => true, 'feed' => $feed]);

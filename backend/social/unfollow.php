<?php
include_once '../includes/db.php';
session_start();

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Not authenticated']);
    exit;
}

$userId = $_SESSION['user_id'];
$data = json_decode(file_get_contents('php://input'), true);
if (!isset($data['followed_id'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Missing followed_id']);
    exit;
}
$followedId = (int)$data['followed_id'];
$database = new Database();
$db = $database->getConnection();
$stmt = $db->prepare('DELETE FROM follows WHERE follower_id = ? AND followed_id = ?');
$stmt->execute([$userId, $followedId]);
echo json_encode(['success' => true, 'message' => 'Unfollowed successfully']);

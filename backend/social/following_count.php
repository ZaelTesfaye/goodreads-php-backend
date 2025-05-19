<?php
include_once '../includes/db.php';
session_start();

$userId = isset($_GET['user_id']) ? (int)$_GET['user_id'] : ($_SESSION['user_id'] ?? null);
if (!$userId) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Missing user_id']);
    exit;
}
$database = new Database();
$db = $database->getConnection();
$stmt = $db->prepare('SELECT COUNT(*) FROM follows WHERE follower_id = ?');
$stmt->execute([$userId]);
$count = $stmt->fetchColumn();
echo json_encode(['success' => true, 'following_count' => (int)$count]);

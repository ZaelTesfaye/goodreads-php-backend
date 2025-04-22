<?php
// Set header to serve HTML content
header('Content-Type: text/html');
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Goodreads Clone API Tester</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        body {
            padding: 20px;
            background-color: #f8f9fa;
        }
        .container {
            max-width: 1000px;
            background-color: white;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        pre {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 4px;
            max-height: 400px;
            overflow-y: auto;
        }
        .endpoint-card {
            margin-bottom: 20px;
            border: 1px solid #dee2e6;
            border-radius: 8px;
            overflow: hidden;
        }
        .endpoint-header {
            padding: 10px 15px;
            background-color: #f8f9fa;
            border-bottom: 1px solid #dee2e6;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .endpoint-body {
            padding: 15px;
        }
        .method-badge {
            font-weight: bold;
            padding: 5px 10px;
            border-radius: 4px;
        }
        .method-get {
            background-color: #d1ecf1;
            color: #0c5460;
        }
        .method-post {
            background-color: #d4edda;
            color: #155724;
        }
        .method-put {
            background-color: #fff3cd;
            color: #856404;
        }
        .method-delete {
            background-color: #f8d7da;
            color: #721c24;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1 class="mb-4">Goodreads Clone API Tester</h1>
        
        <div class="mb-4">
            <a href="index.php" class="btn btn-primary">Back to API Documentation</a>
        </div>

        <div class="alert alert-info">
            <h5>How to use:</h5>
            <ol>
                <li>Select an endpoint from the list below</li>
                <li>Fill in the required parameters</li>
                <li>Click "Test Endpoint" to see the response</li>
            </ol>
        </div>

        <h2 class="mt-4 mb-3">Authentication</h2>

        <!-- Login Endpoint -->
        <div class="endpoint-card">
            <div class="endpoint-header">
                <h5 class="mb-0">User Login</h5>
                <span class="method-badge method-post">POST</span>
            </div>
            <div class="endpoint-body">
                <p>Endpoint: <code>/auth/login.php</code></p>
                
                <form id="loginForm" class="mb-3">
                    <div class="mb-3">
                        <label for="loginEmail" class="form-label">Email:</label>
                        <input type="email" class="form-control" id="loginEmail" value="john@example.com" required>
                    </div>
                    <div class="mb-3">
                        <label for="loginPassword" class="form-label">Password:</label>
                        <input type="password" class="form-control" id="loginPassword" value="password" required>
                    </div>
                    <button type="submit" class="btn btn-primary">Test Login</button>
                </form>
                
                <div class="result-container mb-3" style="display: none;">
                    <h6>Response:</h6>
                    <pre id="loginResponse"></pre>
                </div>
            </div>
        </div>

        <!-- Register Endpoint -->
        <div class="endpoint-card">
            <div class="endpoint-header">
                <h5 class="mb-0">User Registration</h5>
                <span class="method-badge method-post">POST</span>
            </div>
            <div class="endpoint-body">
                <p>Endpoint: <code>/auth/register.php</code></p>
                
                <form id="registerForm" class="mb-3">
                    <div class="mb-3">
                        <label for="registerName" class="form-label">Name:</label>
                        <input type="text" class="form-control" id="registerName" value="Test User" required>
                    </div>
                    <div class="mb-3">
                        <label for="registerEmail" class="form-label">Email:</label>
                        <input type="email" class="form-control" id="registerEmail" value="test@example.com" required>
                    </div>
                    <div class="mb-3">
                        <label for="registerPassword" class="form-label">Password:</label>
                        <input type="password" class="form-control" id="registerPassword" value="password" required>
                    </div>
                    <div class="mb-3">
                        <label for="registerBio" class="form-label">Bio:</label>
                        <textarea class="form-control" id="registerBio" rows="2">I love reading books!</textarea>
                    </div>
                    <button type="submit" class="btn btn-primary">Test Registration</button>
                </form>
                
                <div class="result-container mb-3" style="display: none;">
                    <h6>Response:</h6>
                    <pre id="registerResponse"></pre>
                </div>
            </div>
        </div>

        <!-- Logout Endpoint -->
        <div class="endpoint-card">
            <div class="endpoint-header">
                <h5 class="mb-0">User Logout</h5>
                <span class="method-badge method-post">POST</span>
            </div>
            <div class="endpoint-body">
                <p>Endpoint: <code>/auth/logout.php</code></p>
                
                <button id="logoutButton" class="btn btn-primary">Test Logout</button>
                
                <div class="result-container mb-3 mt-3" style="display: none;">
                    <h6>Response:</h6>
                    <pre id="logoutResponse"></pre>
                </div>
            </div>
        </div>

    </div>

    <script>
        // Function to format JSON
        function formatJSON(json) {
            try {
                return JSON.stringify(JSON.parse(json), null, 2);
            } catch (e) {
                return json;
            }
        }

        // Login form submission
        document.getElementById('loginForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            const responseElement = document.getElementById('loginResponse');
            const resultContainer = responseElement.parentElement.parentElement.querySelector('.result-container');
            
            try {
                const response = await fetch('../auth/login.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                });
                
                const text = await response.text();
                responseElement.textContent = formatJSON(text);
                resultContainer.style.display = 'block';
            } catch (error) {
                responseElement.textContent = 'Error: ' + error.message;
                resultContainer.style.display = 'block';
            }
        });

        // Register form submission
        document.getElementById('registerForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const name = document.getElementById('registerName').value;
            const email = document.getElementById('registerEmail').value;
            const password = document.getElementById('registerPassword').value;
            const bio = document.getElementById('registerBio').value;
            const responseElement = document.getElementById('registerResponse');
            const resultContainer = responseElement.parentElement.parentElement.querySelector('.result-container');
            
            try {
                const response = await fetch('../auth/register.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ name, email, password, bio })
                });
                
                const text = await response.text();
                responseElement.textContent = formatJSON(text);
                resultContainer.style.display = 'block';
            } catch (error) {
                responseElement.textContent = 'Error: ' + error.message;
                resultContainer.style.display = 'block';
            }
        });

        // Logout button
        document.getElementById('logoutButton').addEventListener('click', async function() {
            const responseElement = document.getElementById('logoutResponse');
            const resultContainer = responseElement.parentElement.parentElement.querySelector('.result-container');
            
            try {
                const response = await fetch('../auth/logout.php', {
                    method: 'POST'
                });
                
                const text = await response.text();
                responseElement.textContent = formatJSON(text);
                resultContainer.style.display = 'block';
            } catch (error) {
                responseElement.textContent = 'Error: ' + error.message;
                resultContainer.style.display = 'block';
            }
        });
    </script>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html> 
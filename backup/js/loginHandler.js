document.addEventListener("DOMContentLoaded", function () {
  // Create an instance of the login handler
  const loginHandler = createLoginHandler();
  const form = document.getElementById("loginForm");
  const messageContainer = document.getElementById("messageContainer");

  // Debug check if userLogin.js is loaded
  if (typeof createLoginHandler !== "function") {
    showMessage(
      "Error: Login functionality not loaded properly. Please refresh the page.",
      "error"
    );
    console.error(
      "createLoginHandler function not found. Check if userLogin.js is properly loaded."
    );
    return;
  }

  // Handle form submission
  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    console.log("Login form submitted");

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const submitButton = document.querySelector("button[type='submit']");

    // Basic validation
    if (!email || password.length < 6) {
      showMessage(
        "Please enter a valid email and password (at least 6 characters).",
        "error"
      );
      return;
    }

    // Clear previous messages
    if (messageContainer) {
      messageContainer.style.display = "none";
      messageContainer.textContent = "";
    }

    console.log(`Attempting login for email: ${email}`);

    try {
      // Disable button during login attempt
      submitButton.disabled = true;
      submitButton.textContent = "Signing in...";

      // Attempt login
      const result = await loginHandler.login(email, password);
      console.log("Login result:", result);

      // Handle the response
      if (result.success) {
        // Show success message
        showMessage("Login successful! Redirecting...", "success");

        // Redirect after successful login
        setTimeout(() => {
          window.location.replace("/frontend/mainHome.html");
        }, 1500);
      } else {
        showMessage(
          result.message || "Login failed. Please check your credentials.",
          "error"
        );
      }
    } catch (error) {
      console.error("Login error:", error);
      showMessage("An unexpected error occurred. Please try again.", "error");
    } finally {
      // Re-enable button
      submitButton.disabled = false;
      submitButton.textContent = "Sign In";
    }
  });

  // Subscribe to loading state changes
  loginHandler.on("loading", (isLoading) => {
    const submitButton = document.querySelector("button[type='submit']");
    if (isLoading) {
      submitButton.disabled = true;
      submitButton.textContent = "Signing in...";
    } else {
      submitButton.disabled = false;
      submitButton.textContent = "Sign In";
    }
  });

  // Subscribe to error state changes
  loginHandler.on("error", (error) => {
    if (error) {
      console.log("Error from login hook:", error);
      showMessage(error, "error");
    }
  });

  // Subscribe to user state changes
  loginHandler.on("user", (user) => {
    console.log("User from login hook:", user);
    if (user) {
      // Store user info in localStorage if "keep signed in" is checked
      const keepSignedIn = document.getElementById("keepSignedIn").checked;
      if (keepSignedIn) {
        localStorage.setItem("user", JSON.stringify(user));
      } else {
        // Use sessionStorage if not keeping signed in
        sessionStorage.setItem("user", JSON.stringify(user));
      }
    }
  });
});

// Helper function to display messages
function showMessage(message, type) {
  const messageContainer = document.getElementById("messageContainer");
  if (!messageContainer) {
    console.error("Message container not found");
    return;
  }

  console.log(`Showing ${type} message: ${message}`);

  // Clear any HTML content to prevent XSS
  messageContainer.textContent = message;
  messageContainer.style.display = "block";

  // Add appropriate styling based on message type
  messageContainer.className = "message-container " + type;

  if (type === "error") {
    messageContainer.style.backgroundColor = "#ffebee";
    messageContainer.style.color = "#d32f2f";
    messageContainer.style.border = "1px solid #ffcdd2";
  } else if (type === "success") {
    messageContainer.style.backgroundColor = "#e8f5e9";
    messageContainer.style.color = "#388e3c";
    messageContainer.style.border = "1px solid #c8e6c9";
  }
}

document.addEventListener("DOMContentLoaded", function () {
  // Create an instance of the login handler
  const loginHandler = createLoginHandler();
  const form = document.getElementById("loginForm");
  const messageContainer = document.getElementById("messageContainer");

  // Handle form submission
  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const submitButton = document.querySelector("button[type='submit']");

    // Enhanced validation with specific error messages
    const errors = [];

    // Validate email
    if (!email) {
      errors.push("Email address is required");
      emailInput.classList.add("is-invalid");
    } else if (!isValidEmail(email)) {
      errors.push("Please enter a valid email address");
      emailInput.classList.add("is-invalid");
    } else {
      emailInput.classList.remove("is-invalid");
    }

    // Validate password
    if (!password) {
      errors.push("Password is required");
      passwordInput.classList.add("is-invalid");
    } else if (password.length < 6) {
      errors.push("Password must be at least 6 characters long");
      passwordInput.classList.add("is-invalid");
    } else {
      passwordInput.classList.remove("is-invalid");
    }

    // Show validation errors if any
    if (errors.length > 0) {
      showMessage(errors.join("<br>"), "error");
      return;
    }

    // Clear previous messages
    if (messageContainer) {
      messageContainer.style.display = "none";
      messageContainer.textContent = "";
    }

    try {
      // Disable button during login attempt
      submitButton.disabled = true;
      submitButton.textContent = "Signing in...";

      // Attempt login
      const result = await loginHandler.login(email, password);

      // Handle the response
      if (result.success) {
        // Show success message
        showMessage("Login successful! Redirecting...", "success");

        // Redirect after successful login
        setTimeout(() => {
          window.location.replace("/frontend/mainHome.html");
        }, 1500);
      } else {
        // Handle specific server error messages
        if (result.message.includes("Invalid credentials")) {
          showMessage("Login failed: Invalid email or password", "error");
        } else if (result.message.includes("not found")) {
          showMessage("Login failed: Email address not found", "error");
        } else {
          showMessage(
            result.message || "Login failed. Please check your credentials.",
            "error"
          );
        }
      }
    } catch (error) {
      showMessage("An unexpected error occurred. Please try again.", "error");
    } finally {
      // Re-enable button
      submitButton.disabled = false;
      submitButton.textContent = "Sign In";
    }
  });

  // Email validation function
  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

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
      // Parse specific error messages
      if (error.includes("Invalid credentials")) {
        showMessage("Invalid email or password. Please try again.", "error");
      } else if (error.includes("not found")) {
        showMessage(
          "Email address not found. Please check your email.",
          "error"
        );
      } else if (
        error.includes("Failed to fetch") ||
        error.includes("Network error")
      ) {
        showMessage(
          "Network error: Unable to connect to the server. Please check your internet connection.",
          "error"
        );
      } else {
        showMessage(error, "error");
      }
    }
  });

  // Subscribe to user state changes
  loginHandler.on("user", (user) => {
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
    return;
  }

  // Support HTML content for line breaks in error messages
  messageContainer.innerHTML = message;
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

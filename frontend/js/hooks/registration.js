function register(event) {
  event.preventDefault(); // prevent default form submission

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const passwordConfirm = document.getElementById("password-confirm").value;
  const messageContainer = document.getElementById("messageContainer");

  // Use form validation if available
  if (window.formValidation) {
    // Validate fields using formValidation
    const nameValid = window.formValidation.validateName(name);
    const emailValid = window.formValidation.validateEmail(email);
    const passwordValid = window.formValidation.validatePassword(password);

    // Check if passwords match
    const passwordsMatch = password === passwordConfirm;

    // Check if all validations pass
    if (!nameValid || !emailValid || !passwordValid || !passwordsMatch) {
      // Let formValidation handle displaying the errors
      return;
    }
  } else {
    // Basic validation if formValidation is not available
    if (!name || !email || password.length < 6) {
      showMessage("Please fill out all required fields correctly.", "error");
      return;
    }

    // Check if passwords match
    if (password !== passwordConfirm) {
      showMessage("Passwords do not match.", "error");
      return;
    }
  }

  // Disable form submission while processing
  const submitButton = document.querySelector("button[type='submit']");
  submitButton.disabled = true;
  submitButton.textContent = "Processing...";

  // Create request data
  const userData = {
    name: name,
    email: email,
    password: password,
  };

  // Clear any previous messages
  if (messageContainer) {
    messageContainer.style.display = "none";
    messageContainer.textContent = "";
  }

  // Send request to backend
  fetch("http://localhost/goodreads-php-backend/backend/auth/register.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  })
    .then((response) => {
      return response.text().then((text) => {
        try {
          // Try to parse the response as JSON
          const jsonData = JSON.parse(text);
          console.log("Server response:", jsonData);
          return jsonData;
        } catch (e) {
          // If parsing fails, log the raw response for debugging
          console.error("Failed to parse JSON:", text);
          return {
            success: response.ok,
            message: "Server response was not valid JSON. Please try again.",
          };
        }
      });
    })
    .then((data) => {
      // Re-enable the submit button to allow retries if needed
      submitButton.disabled = false;
      submitButton.textContent = "Create account";

      if (data.success) {
        // Show success message
        showMessage(
          data.message || "Registration successful! 🎉 Redirecting...",
          "success"
        );

        // Redirect after 2 seconds
        setTimeout(() => {
          try {
            // Redirect to index.html or mainPage
            // We're using window.location.replace to avoid adding to browser history
            window.location.replace("/frontend/mainHome.html");
          } catch (e) {
            console.error("Redirect error:", e);
            // Fallback to direct location change
            window.location.href = "/frontend/mainHome.html";
          }
        }, 2000);
      } else {
        // Show error message
        showMessage(
          data.message || "Registration failed. Please try again.",
          "error"
        );
      }
    })
    .catch((error) => {
      console.error("Fetch error:", error);
      showMessage("Connection failed. Please try again later.", "error");

      // Re-enable the submit button
      submitButton.disabled = false;
      submitButton.textContent = "Create account";
    });
}

function showMessage(message, type) {
  const messageContainer = document.getElementById("messageContainer");
  if (!messageContainer) return;

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

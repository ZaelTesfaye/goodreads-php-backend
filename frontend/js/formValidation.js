// Form validation logic
document.addEventListener("DOMContentLoaded", () => {
  // Get form elements
  const form = document.getElementById("registrationForm");
  if (!form) return; // Exit if not on a page with the registration form

  const nameInput = document.getElementById("name");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const passwordConfirmInput = document.getElementById("password-confirm");
  const submitButton = document.querySelector("button[type='submit']");

  // Track if fields have been interacted with
  const interacted = {
    name: false,
    email: false,
    password: false,
    passwordConfirm: false,
  };

  // Create error message elements
  function createErrorElement(id) {
    const errorDiv = document.createElement("div");
    errorDiv.className = "error-message";
    errorDiv.id = id;
    return errorDiv;
  }

  // Add error message elements after each input
  const nameError = createErrorElement("name-error");
  const emailError = createErrorElement("email-error");
  const passwordError = createErrorElement("password-error");
  const passwordConfirmError = createErrorElement("password-confirm-error");

  nameInput.parentNode.appendChild(nameError);
  emailInput.parentNode.appendChild(emailError);
  passwordInput.parentNode.appendChild(passwordError);
  passwordConfirmInput.parentNode.appendChild(passwordConfirmError);

  // Add CSS for error messages
  const style = document.createElement("style");
  style.textContent = `
    .error-message {
        color: #d32f2f;
        font-size: 12px;
        margin-top: 4px;
        min-height: 16px;
    }
    
    .error {
        border-color: #d32f2f !important;
    }
    
    .success {
        border-color: #2e7d32 !important;
    }
  `;
  document.head.appendChild(style);

  // Validation functions
  function validateName(name) {
    // Allow any name format with at least 2 characters
    return name.trim().length >= 2;
  }

  function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  }

  function validatePassword(password) {
    return password.length >= 6;
  }

  // Function to update submit button state
  function updateSubmitButton() {
    const hasErrors = document.querySelectorAll(".error").length > 0;
    const requiredFields = [
      nameInput.value,
      emailInput.value,
      passwordInput.value,
      passwordConfirmInput.value,
    ];
    const allFieldsFilled = requiredFields.every(
      (field) => field.trim() !== ""
    );

    submitButton.disabled = hasErrors || !allFieldsFilled;
  }

  // Mark a field as interacted with
  function markInteracted(field) {
    interacted[field] = true;
  }

  // Only validate fields that have been interacted with
  function validateField(
    field,
    value,
    validationFn,
    errorElement,
    inputElement
  ) {
    // Skip validation if the field hasn't been interacted with
    if (!interacted[field]) return;

    if (!value) {
      errorElement.textContent = `${
        field.charAt(0).toUpperCase() + field.slice(1)
      } is required`;
      inputElement.classList.add("error");
      inputElement.classList.remove("success");
    } else if (!validationFn(value)) {
      switch (field) {
        case "name":
          errorElement.textContent = "Please enter at least 2 characters";
          break;
        case "email":
          errorElement.textContent = "Please enter a valid email address";
          break;
        case "password":
          errorElement.textContent = "Password must be at least 6 characters";
          break;
        case "passwordConfirm":
          errorElement.textContent = "Passwords do not match";
          break;
      }
      inputElement.classList.add("error");
      inputElement.classList.remove("success");
    } else {
      errorElement.textContent = "";
      inputElement.classList.remove("error");
      inputElement.classList.add("success");
    }
  }

  // Real-time validation
  nameInput.addEventListener("focus", () => markInteracted("name"));
  nameInput.addEventListener("input", () => {
    validateField("name", nameInput.value, validateName, nameError, nameInput);
    updateSubmitButton();
  });

  emailInput.addEventListener("focus", () => markInteracted("email"));
  emailInput.addEventListener("input", () => {
    validateField(
      "email",
      emailInput.value,
      validateEmail,
      emailError,
      emailInput
    );
    updateSubmitButton();
  });

  passwordInput.addEventListener("focus", () => markInteracted("password"));
  passwordInput.addEventListener("input", () => {
    validateField(
      "password",
      passwordInput.value,
      validatePassword,
      passwordError,
      passwordInput
    );

    // Also check password confirmation if it's been interacted with
    if (interacted.passwordConfirm) {
      validatePasswordMatch();
    }

    updateSubmitButton();
  });

  passwordConfirmInput.addEventListener("focus", () =>
    markInteracted("passwordConfirm")
  );

  function validatePasswordMatch() {
    const password = passwordInput.value;
    const passwordConfirm = passwordConfirmInput.value;

    const matchValidator = (confirm) => confirm === password;
    validateField(
      "passwordConfirm",
      passwordConfirm,
      matchValidator,
      passwordConfirmError,
      passwordConfirmInput
    );
  }

  passwordConfirmInput.addEventListener("input", () => {
    validatePasswordMatch();
    updateSubmitButton();
  });

  // Form submission - validate all fields
  form.addEventListener("submit", (e) => {
    // Mark all fields as interacted with on submit
    interacted.name = true;
    interacted.email = true;
    interacted.password = true;
    interacted.passwordConfirm = true;

    // Validate all fields
    validateField("name", nameInput.value, validateName, nameError, nameInput);
    validateField(
      "email",
      emailInput.value,
      validateEmail,
      emailError,
      emailInput
    );
    validateField(
      "password",
      passwordInput.value,
      validatePassword,
      passwordError,
      passwordInput
    );
    validatePasswordMatch();

    updateSubmitButton();

    // Let the form submission be handled by the registration.js handler
  });

  // Export validation functions for use in registration.js
  window.formValidation = {
    validateName,
    validateEmail,
    validatePassword,
    checkPasswordsMatch: validatePasswordMatch,
    isValid: () => document.querySelectorAll(".error").length === 0,
  };
});

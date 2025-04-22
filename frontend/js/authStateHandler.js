/**
 * Authentication state handler for the main home page
 * Handles showing/hiding auth links based on login state
 */
document.addEventListener("DOMContentLoaded", function () {
  // DOM elements
  const authLinksContainer = document.querySelector(".auth-links");
  if (!authLinksContainer) return;

  // Get the original sign in and join links (to preserve structure)
  const originalLinks = authLinksContainer.innerHTML;
  const signInLink = authLinksContainer.querySelector(".sign-in");
  const joinLink = authLinksContainer.querySelector(".join");

  // Function to get cookie by name
  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();

    // Check localStorage backup as fallback
    return localStorage.getItem("backup_cookie_" + name);
  }

  // Clear all authentication data including cookies and localStorage backups
  function clearAllAuthData() {
    // Clear user data from storage
    localStorage.removeItem("user");
    sessionStorage.removeItem("user");

    // Clear all backup cookies from localStorage
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && key.startsWith("backup_cookie_")) {
        localStorage.removeItem(key);
      }
    }

    // Force removal of cookies from client-side
    const cookiesToClear = [
      "PHPSESSID",
      "user_session",
      "csrftoken",
      "sessionid",
    ];
    cookiesToClear.forEach((cookieName) => {
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    });
  }

  // Check if user is logged in - try multiple sources
  const userFromStorage = JSON.parse(
    localStorage.getItem("user") || sessionStorage.getItem("user") || "null"
  );

  // Also check for the backup cookie
  const userSessionCookie = getCookie("user_session");
  const phpSessionCookie = getCookie("PHPSESSID");

  // Check if there are any backup cookies stored
  let hasBackupCookies = false;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith("backup_cookie_")) {
      hasBackupCookies = true;
      // If we find backup cookies but don't have real cookies, try to restore them
      const name = key.replace("backup_cookie_", "");
      const value = localStorage.getItem(key);
      if (!document.cookie.includes(name + "=")) {
        document.cookie = `${name}=${value};path=/`;
      }
    }
  }

  // User is logged in if either the storage has user data or session cookies exist
  const isLoggedIn =
    userFromStorage ||
    userSessionCookie ||
    phpSessionCookie ||
    hasBackupCookies;

  if (isLoggedIn) {
    // User is logged in
    const userName = userFromStorage ? userFromStorage.name : "User";

    // Swap the positions: Logout button should be on the right (normal) and left (mobile)
    // We'll use the existing elements but in different order
    if (signInLink && joinLink) {
      // Convert Join link to Logout
      joinLink.textContent = "Logout";
      joinLink.href = "#";
      joinLink.className = "nav-link auth-link sign-in logout";

      // Convert Sign In link to greeting
      signInLink.textContent = `Hello, ${userName}`;
      signInLink.href = "#"; // Make it non-clickable
      signInLink.className = "nav-link user-greeting";
    } else {
      // Fallback if we can't find the specific elements
      authLinksContainer.innerHTML = `
        <a href="#" class="nav-link user-greeting">Hello, ${userName}</a>
        <a href="#" class="nav-link auth-link sign-in logout">Logout</a>
      `;
    }

    // Hide signup forms if they exist
    const signUpForms = document.querySelectorAll(".sign-up-with-container");
    signUpForms.forEach((form) => {
      form.style.display = "none";
    });

    const signUpOverlay = document.querySelector(".sign-up-with-page--overlay");
    if (signUpOverlay) {
      signUpOverlay.style.display = "none";
    }

    // Add logout functionality
    const logoutButton = document.querySelector(".logout");
    if (logoutButton) {
      logoutButton.addEventListener("click", function (e) {
        e.preventDefault();

        // Show some indicator that logout is in progress
        const originalText = logoutButton.textContent;
        logoutButton.textContent = "Logging out...";

        // Use XMLHttpRequest instead of fetch
        const xhr = new XMLHttpRequest();

        // Configure the request
        xhr.open(
          "POST",
          "http://127.0.0.1/goodreads-php-backend/backend/auth/logout.php",
          true
        );
        xhr.withCredentials = true; // Send cookies
        xhr.setRequestHeader("Content-Type", "application/json");

        // Set up response handling
        xhr.onload = function () {
          // Always clear client-side data regardless of server response
          clearAllAuthData();

          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const data = JSON.parse(xhr.responseText);

              // Reload page to show logged out state
              window.location.reload();
            } catch (e) {
              alert("Error during logout. Please try again.");
              logoutButton.textContent = originalText;
            }
          } else {
            // Even if server error, we've cleared client-side data so reload anyway
            window.location.reload();
          }
        };

        xhr.onerror = function () {
          // Even if network error, clear client-side data
          clearAllAuthData();

          // Alert the user but then reload anyway
          alert(
            "Network error during logout, but your session has been cleared locally."
          );
          window.location.reload();
        };

        // Send the request with empty payload
        xhr.send(JSON.stringify({}));
      });
    }
  } else {
    // User is not logged in, ensure the original sign in and join links are in place
    authLinksContainer.innerHTML = originalLinks;
  }
});

const createLoginHandler = () => {
  let isLoading = false;
  let error = null;
  let user = null;
  const eventTarget = new EventTarget();

  // Private state management
  const setLoading = (state) => {
    isLoading = state;
    dispatchEvent("loading", isLoading);
  };

  const setError = (err) => {
    error = err;
    dispatchEvent("error", error);
  };

  const setUser = (userData) => {
    user = userData;
    dispatchEvent("user", user);
  };

  const dispatchEvent = (type, detail) => {
    eventTarget.dispatchEvent(new CustomEvent(type, { detail }));
  };

  // Public methods
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    setUser(null);

    return new Promise((resolve) => {
      try {
        // Create XHR object
        const xhr = new XMLHttpRequest();

        // Configure request
        xhr.open(
          "POST",
          "http://127.0.0.1/goodreads-php-backend/backend/auth/login.php",
          true
        );
        xhr.withCredentials = true; // Important: send cookies
        xhr.setRequestHeader("Content-Type", "application/json");

        // Set up response handler
        xhr.onload = function () {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const data = JSON.parse(xhr.responseText);

              // Check for API-level error
              if (!data.success) {
                // More specific error handling based on message content
                if (
                  data.message &&
                  data.message.includes("Invalid credentials")
                ) {
                  const error = new Error(
                    "Invalid credentials: Email or password is incorrect"
                  );
                  setError(error.message);
                  resolve({
                    success: false,
                    message: error.message,
                  });
                  return;
                } else if (data.message && data.message.includes("not found")) {
                  const error = new Error("Email address not found");
                  setError(error.message);
                  resolve({
                    success: false,
                    message: error.message,
                  });
                  return;
                } else {
                  const error = new Error(data.message || "Login failed");
                  setError(error.message);
                  resolve({
                    success: false,
                    message: error.message,
                  });
                  return;
                }
              }

              // Get user data from the response
              const userData =
                data.data && data.data.user ? data.data.user : data.user;

              if (!userData) {
                const error = new Error("User data not found in response");
                setError(error.message);
                resolve({
                  success: false,
                  message: error.message,
                });
                return;
              }

              // Log cookies that were set
              console.log("Cookies after login:", document.cookie);

              // Set user data
              setUser(userData);

              // Return success
              resolve({
                success: true,
                message: data.message || "Login successful",
                user: userData,
              });
            } catch (e) {
              const error = new Error(
                "Invalid response from server: " + e.message
              );
              setError(error.message);
              resolve({
                success: false,
                message: error.message,
              });
            }
          } else {
            // Handle HTTP error statuses
            let errorMsg = "Login failed with status " + xhr.status;

            if (xhr.status === 401) {
              errorMsg = "Invalid credentials: Email or password is incorrect";
            } else if (xhr.status === 400) {
              errorMsg = "Missing or invalid login details";
            } else if (xhr.status === 404) {
              errorMsg = "Email address not found";
            } else if (xhr.status === 500) {
              errorMsg = "Server error: Please try again later";
            }

            const error = new Error(errorMsg);
            setError(error.message);
            resolve({
              success: false,
              message: error.message,
            });
          }
          setLoading(false);
        };

        // Handle network errors
        xhr.onerror = function () {
          const error = new Error("Network error: Failed to connect to server");
          setError(error.message);
          resolve({
            success: false,
            message: error.message,
          });
          setLoading(false);
        };

        // Send the request with credentials
        xhr.send(JSON.stringify({ email, password }));
      } catch (err) {
        setError(err.message || "Failed to connect to server");
        resolve({
          success: false,
          message: err.message || "Failed to connect to server",
        });
        setLoading(false);
      }
    });
  };

  // Event subscription
  const on = (event, callback) => {
    eventTarget.addEventListener(event, (e) => callback(e.detail));
  };

  return {
    login,
    on,
    get isLoading() {
      return isLoading;
    },
    get error() {
      return error;
    },
    get user() {
      return user;
    },
  };
};

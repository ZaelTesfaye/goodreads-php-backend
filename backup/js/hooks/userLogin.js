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

    try {
      console.log("Sending login request for:", email);

      const response = await fetch(
        "http://localhost/goodreads-php-backend/backend/auth/login.php",
        {
          method: "POST",
          // The 'credentials: "include"' option is necessary to ensure that cookies are sent with the request.
          // This is important for maintaining session state and allowing the server to recognize the user.
          // credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        }
      );

      // If fetch fails completely
      if (!response) {
        throw new Error("Network error: Failed to connect to server");
      }

      // For debugging
      const responseText = await response.text();
      console.log("Raw response:", responseText);

      // Try to parse as JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error("Failed to parse response as JSON:", e);
        throw new Error(
          "Invalid response from server: " + responseText.substring(0, 100)
        );
      }

      console.log("Parsed response:", data);

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Login failed");
      }

      // Get user data from the right place in the response
      const userData = data.data && data.data.user ? data.data.user : data.user;

      if (!userData) {
        throw new Error("User data not found in response");
      }

      setUser(userData);
      return {
        success: true,
        message: data.message || "Login successful",
        user: userData,
      };
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Network error: Failed to connect to server");
      return {
        success: false,
        message: err.message || "Failed to connect to server",
      };
    } finally {
      setLoading(false);
    }
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

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
      const response = await fetch(
        "http://localhost/goodreads-php-backend/backend/auth/login.php",
        {
          method: "POST",
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

      const responseText = await response.text();
      let data;

      try {
        data = JSON.parse(responseText);
      } catch (e) {
        throw new Error("Invalid response from server");
      }

      // Check for specific error conditions from the server
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error(
            "Invalid credentials: Email or password is incorrect"
          );
        } else if (response.status === 400) {
          throw new Error("Missing or invalid login details");
        } else if (response.status === 404) {
          throw new Error("Email address not found");
        } else if (response.status === 500) {
          throw new Error("Server error: Please try again later");
        } else {
          throw new Error(data.message || "Login failed");
        }
      }

      if (!data.success) {
        // More specific error handling based on message content
        if (data.message.includes("Invalid credentials")) {
          throw new Error(
            "Invalid credentials: Email or password is incorrect"
          );
        } else if (data.message.includes("not found")) {
          throw new Error("Email address not found");
        } else {
          throw new Error(data.message || "Login failed");
        }
      }

      // Get user data from the response
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
      setError(err.message || "Failed to connect to server");
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

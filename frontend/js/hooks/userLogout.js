/**
 * Hook for handling user logout functionality
 */
const createLogoutHandler = () => {
  let isLoading = false;
  let error = null;
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

  const dispatchEvent = (type, detail) => {
    eventTarget.dispatchEvent(new CustomEvent(type, { detail }));
  };

  // Public methods
  const logout = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        "http://localhost/goodreads-php-backend/backend/auth/logout.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
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

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Logout failed");
      }

      // Clear user data from storage
      localStorage.removeItem("user");
      sessionStorage.removeItem("user");

      // Dispatch a logout event
      dispatchEvent("logout", true);

      return {
        success: true,
        message: data.message || "Logout successful",
      };
    } catch (err) {
      setError(err.message || "Failed to connect to server");
      return {
        success: false,
        message: err.message || "Failed to logout",
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
    logout,
    on,
    get isLoading() {
      return isLoading;
    },
    get error() {
      return error;
    },
  };
};

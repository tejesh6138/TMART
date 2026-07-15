document.addEventListener("DOMContentLoaded", () => {
  const registerForm = document.getElementById("registerForm");
  const loginForm = document.getElementById("loginForm");

  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const name = document.getElementById("registerName").value.trim();
      const email = document.getElementById("registerEmail").value.trim();
      const password = document.getElementById("registerPassword").value.trim();

      if (!name || !email || !password) {
        alert("Please fill all required fields.");
        return;
      }

      if (password.length < 6) {
        alert("Password must contain at least 6 characters.");
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/accounts/register/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            username: name,
            email: email,
            password: password,
            phone: "",
            address: ""
          })
        });

        const data = await response.json();

        if (!response.ok) {
          const errorMessage = typeof data === "object"
            ? Object.values(data).flat().join("\n")
            : "Registration failed";
          alert(errorMessage);
          return;
        }

        alert("Registration successful. Please login.");
        window.location.href = "login.html";
      } catch (error) {
        alert("Server error while registering.");
      }
    });
  }

  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const emailOrUsername = document.getElementById("loginEmail").value.trim();
      const password = document.getElementById("loginPassword").value.trim();

      if (!emailOrUsername || !password) {
        alert("Please enter username and password.");
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/accounts/login/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            username: emailOrUsername,
            password: password
          }),
          credentials: 'include'
        });

        const data = await response.json();

        if (!response.ok) {
          alert(data.error || "Login failed");
          return;
        }

        setLoggedInUser(data.user);
        alert("Login successful");
        window.location.href = "index.html";
      } catch (error) {
        alert("Server error while logging in.");
      }
    });
  }
});
document.addEventListener("DOMContentLoaded", async () => {
  const user = getLoggedInUser();
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  // Set initial data from localStorage
  document.getElementById("profileName").textContent = user.username;
  document.getElementById("profileEmail").textContent = user.email || "-";
  document.getElementById("profilePhone").textContent = user.phone || "Not provided";
  document.getElementById("profileAddress").textContent = user.address || "Not provided";
  document.getElementById("profileAvatar").textContent = user.username.charAt(0).toUpperCase();

  try {
    // Fetch fresh profile details from backend
    const response = await fetch(`${API_BASE_URL}/accounts/profile/${user.id}/`, {
      credentials: 'include'
    });
    if (response.ok) {
      const data = await response.json();
      document.getElementById("profileName").textContent = data.username;
      document.getElementById("profileEmail").textContent = data.email || "-";
      document.getElementById("profilePhone").textContent = data.phone || "Not provided";
      document.getElementById("profileAddress").textContent = data.address || "Not provided";
      document.getElementById("profileAvatar").textContent = data.username.charAt(0).toUpperCase();

      // Update localStorage with fresh data
      setLoggedInUser(data);
    }
  } catch (error) {
    console.error("Failed to fetch fresh profile details", error);
  }
});

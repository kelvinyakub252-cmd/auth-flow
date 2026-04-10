const API_URL = "http://127.0.0.1:3000";
let currentUser = null;

// Show alert message
function showAlert(message, type = "success") {
  const alertDiv = document.createElement("div");
  alertDiv.className = `alert px-6 py-4 rounded-lg shadow-lg text-white ${type === "success" ? "bg-green-500" : "bg-red-500"}`;
  alertDiv.textContent = message;
  document.getElementById("alertContainer").appendChild(alertDiv);
  setTimeout(() => alertDiv.remove(), 4000);
}

// Handle Sign up
async function handleSignUp(e) {
  e.preventDefault();

  const data = {
    name: document.getElementById("regName").value,
    email: document.getElementById("regEmail").value,
    password: document.getElementById("regPassword").value,
    age: Number(document.getElementById("regAge").value) || 0,
    field: document.getElementById("regField").value,
  };

  try {
    const res = await fetch(`${API_URL}/auth/sign-up`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await res.json();

    if (res.ok) {
      alert(result.message || "Registration Successful! please login");
      e.target.reset();
      window.location.href = "login.html";
    } else {
      alert(result.message || `"Registration failed"`);
    }
  } catch (error) {
    alert(result.error || "Network error, please try again");
  }
}

// Handle login
async function handleLogin(e) {
  e.preventDefault();

  const data = {
    email: document.getElementById("loginEmail").value,
    password: document.getElementById("loginPassword").value,
  };

  try {
    const res = await fetch(`${API_URL}/auth/sign-in`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await res.json();

    if (res.ok) {
      alert(result.message || "Login Successful");
      localStorage.setItem("authToken", result.token);
      e.target.reset();
      window.location.href = "index.html";
    } else {
      alert(result.error || "Login failed");
    }
  } catch (error) {
    alert(result.error || "Network error, please try again");
  }
}

// Handle Forget Password
async function handleForgotPassword(e) {
  e.preventDefault();

  const data = {
    email: document.getElementById("forgotEmail").value,
  };

  try {
    const res = await fetch(`${API_URL}/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await res.json();

    if (res.ok) {
      e.target.reset();
      document.getElementById("successMessage").style.display = "block";
      document.getElementById("sentEmailDisplay").textContent = email;
    } else {
      alert(result.error || "Request failed");
    }
  } catch (error) {
    alert(result.error || "Network error, please try again");
  }
}

function checkResetToken() {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get("token");

  if (!token) {
    alert("Missing token or Invalid reset link");
    window.location.href = "forgot-password.html";
  }
}

// Handle Reset Password
async function handleResetPassword(e) {
  e.preventDefault();

  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get("token");

  if (!token) {
    alert("Invalid reset link");
    window.location.href = "forgot-password.html";
  }

  const newPassword = document.getElementById("resetNewPassword").value;
  const confirmPassword = document.getElementById("confirmNewPassword").value;

  if (newPassword !== confirmPassword) {
    alert("Password do not match");
    return;
  }

  const data = {
    token,
    password: newPassword,
  };

  try {
    const res = await fetch(`${API_URL}/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await res.json();

    if (res.ok) {
      alert(result.message || "Password reset successful! Please login.");
      e.target.reset();
      window.location.href = "login.html";
    } else {
      alert(result.error || "Request failed");
    }
  } catch (error) {
    alert(result.error || "Network error, please try again");
  }
}

// Load Profile
async function loadProfile() {
  const token = localStorage.getItem("authToken");
  if (!token) {
    window.location.href = "login.html";
    return;
  }

  try {
    const res = await fetch(`${API_URL}/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await res.json();

    if (res.ok) {
      currentUser = result.user;
      document.getElementById("displayName").textContent = currentUser.name;
      document.getElementById("displayAge").textContent = currentUser.age;
      document.getElementById("displayEmail").textContent = currentUser.email;
      document.getElementById("displayField").textContent = currentUser.field;
      document.getElementById("displayCreatedAt").textContent = new Date(
        currentUser.created_at,
      ).toLocaleDateString();

      // edit
      document.getElementById("editName").value = currentUser.name;
      document.getElementById("editEmail").value = currentUser.email;
      document.getElementById("editAge").value = currentUser.age;
      document.getElementById("editField").value = currentUser.field;
    } else {
      alert(result.message || "Failed to load Profile");
      logout;
    }
  } catch (error) {
    alert(error.message || "Network error. Please try again.");
  }
}

// Toggle Edit Mode
function toggleEditMode() {
  const viewMode = document.getElementById("viewMode");
  const editMode = document.getElementById("editMode");
  const editBtn = document.getElementById("editBtn");

  if (viewMode.style.display !== "none") {
    viewMode.style.display = "none";
    editMode.style.display = "block";
    editBtn.style.display = "none";
  } else {
    viewMode.style.display = "block";
    editMode.style.display = "none";
    editBtn.style.display = "block";
  }
}

// Handle Update Profile
async function handleUpdateProfile(e) {
  e.preventDefault();
  const token = localStorage.getItem("authToken");
  const data = {
    name: document.getElementById("editName").value,
    age: parseInt(document.getElementById("editAge").value),
    field: document.getElementById("editField").value,
  };

  try {
    const res = await fetch(`${API_URL}/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    const result = await res.json();

    if (res.ok) {
      alert(result.message || "Profile updated successfully!");
      toggleEditMode();
      loadProfile();
    } else {
      alert(result.error || "Update failed", "error");
    }
  } catch (err) {
    alert("Network error. Please try again.", "error");
  }
}

// Handle Change Password
async function handleChangePassword(e) {
  e.preventDefault();
  const token = localStorage.getItem("authToken");
  const data = {
    oldPassword: document.getElementById("oldPassword").value,
    newPassword: document.getElementById("newPassword").value,
  };

  try {
    const res = await fetch(`${API_URL}/profile`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    const result = await res.json();

    if (res.ok) {
      alert(result.message || "Password changed successfully!");
      e.target.reset();
    } else {
      alert(result.error || "Password change failed", "error");
    }
  } catch (err) {
    alert("Network error. Please try again.", "error");
  }
}

// Logout
function logout() {
  localStorage.removeItem("authToken");
  currentUser = null;
  alert("logged out successful");
  window.location.href = "login.html";
}

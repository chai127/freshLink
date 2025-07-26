function getURLParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    role: params.get("role") || "vendor",
    type: params.get("type") || "login", // 'login' or 'signup'
  };
}

function updateAuthPage(role, type) {
  const box = document.querySelector(".auth-box");
  const title = box.querySelector("h1");
  const subtitle = box.querySelector("p");
  const form = box.querySelector("form");
  const forgotLink = box.querySelector("#forgot-password-link");
  const confirmPasswordField = box.querySelector("#confirm-password-field");
  const submitBtn = box.querySelector("#submit-btn");
  const toggleText = box.querySelector("#toggle-auth-text");
  const googleBtn = box.querySelector("#google-btn");

  // Set page title and form action
  const capitalizedRole = role.charAt(0).toUpperCase() + role.slice(1);

  if (type === "signup") {
    title.textContent = `${capitalizedRole} Sign Up`;
    subtitle.textContent = `Create your ${role} account`;
    form.action = `/${role}/signup`;
    confirmPasswordField.classList.remove("hidden");
    forgotLink.classList.add("hidden");
    submitBtn.textContent = "Sign Up";
    googleBtn.textContent = "Sign up with Google";
    googleBtn.setAttribute("onclick", `googleSignIn('${role}', 'signup')`);
    toggleText.innerHTML = `Already have an account? <a href="login.html?role=${role}&type=login" class="text-blue-500 hover:underline">Log in here</a>`;
  } else {
    title.textContent = `${capitalizedRole} Login`;
    subtitle.textContent = role === "hawker" ? "Access the freshest vendors in your area." : "Connect and grow your business.";
    form.action = `/${role}/login`;
    confirmPasswordField.classList.add("hidden");
    forgotLink.classList.remove("hidden");
    forgotLink.querySelector("a").href = `/${role}/forgot-password`;
    submitBtn.textContent = "Log In";
    googleBtn.textContent = "Sign in with Google";
    googleBtn.setAttribute("onclick", `googleSignIn('${role}', 'login')`);
    toggleText.innerHTML = `New here? <a href="login.html?role=${role}&type=signup" class="text-blue-500 hover:underline">Create a ${capitalizedRole} Account</a>`;
  }

  document.title = `${capitalizedRole} ${type === "signup" ? "Sign Up" : "Login"} – StreetSupply`;
}

function googleSignIn(role, type) {
  alert(`${type === "signup" ? "Sign Up" : "Sign In"} with Google as ${role}`);
}

document.addEventListener("DOMContentLoaded", () => {
  const { role, type } = getURLParams();
  updateAuthPage(role, type);
});

document.querySelector("form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.target;
  const data = new FormData(form);
  const response = await fetch(form.action, {
    method: "POST",
    body: data
  });

  const result = await response.json();
  if (result.success) {
    // Redirect to dashboard or home
    window.location.href = "/dashboard.html";
  } else {
    alert("Login failed");
  }
});
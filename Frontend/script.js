document.addEventListener("DOMContentLoaded", () => {
  // ========== Auth Logic ==========
  function getURLParams() {
    const params = new URLSearchParams(window.location.search);
    return {
      role: params.get("role") || "vendor",
      type: params.get("type") || "login",
    };
  }

  function updateAuthPage(role, type) {
    const box = document.querySelector(".auth-box");
    if (!box) return; // not on auth page

    const title = box.querySelector("h1");
    const subtitle = box.querySelector("p");
    const form = box.querySelector("form");
    const forgotLink = box.querySelector("#forgot-password-link");
    const confirmPasswordField = box.querySelector("#confirm-password-field");
    const submitBtn = box.querySelector("#submit-btn");
    const toggleText = box.querySelector("#toggle-auth-text");
    const googleBtn = box.querySelector("#google-btn");

    const capitalizedRole = role.charAt(0).toUpperCase() + role.slice(1);

    if (type === "signup") {
      title.textContent = `${capitalizedRole} Sign Up`;
      subtitle.textContent = `Create your ${role} account`;
      form.action = `/${role}/signup`;
      confirmPasswordField?.classList.remove("hidden");
      forgotLink?.classList.add("hidden");
      submitBtn.textContent = "Sign Up";
      googleBtn.textContent = "Sign up with Google";
      googleBtn.setAttribute("onclick", `googleSignIn('${role}', 'signup')`);
      toggleText.innerHTML = `Already have an account? <a href="login.html?role=${role}&type=login" class="text-blue-500 hover:underline">Log in here</a>`;
    } else {
      title.textContent = `${capitalizedRole} Login`;
      subtitle.textContent =
        role === "hawker"
          ? "Access the freshest vendors in your area."
          : "Connect and grow your business.";
      form.action = `/${role}/login`;
      confirmPasswordField?.classList.add("hidden");
      forgotLink?.classList.remove("hidden");
      forgotLink.querySelector("a").href = `/${role}/forgot-password`;
      submitBtn.textContent = "Log In";
      googleBtn.textContent = "Sign in with Google";
      googleBtn.setAttribute("onclick", `googleSignIn('${role}', 'login')`);
      toggleText.innerHTML = `New here? <a href="login.html?role=${role}&type=signup" class="text-blue-500 hover:underline">Create a ${capitalizedRole} Account</a>`;
    }

    document.title = `${capitalizedRole} ${
      type === "signup" ? "Sign Up" : "Login"
    } – StreetSupply`;
  }

  function googleSignIn(role, type) {
    alert(`${type === "signup" ? "Sign Up" : "Sign In"} with Google as ${role}`);
  }

  const { role, type } = getURLParams();
  updateAuthPage(role, type);

  const form = document.querySelector("form");
  if (form && form.closest(".auth-box")) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const submitBtn = form.querySelector("#submit-btn");
      submitBtn.disabled = true;
      submitBtn.textContent = "Please wait...";

      const data = new FormData(form);

      try {
        const response = await fetch(form.action, {
          method: "POST",
          body: data,
        });

        const result = await response.json();

        if (result.success) {
          window.location.href = "/dashboard.html";
        } else {
          alert(result.message || "Login failed");
        }
      } catch (error) {
        alert("An error occurred. Please try again.");
        console.error(error);
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = type === "signup" ? "Sign Up" : "Log In";
      }
    });
  }

  // ========== Hamburger Menu ==========
  const menuToggle = document.getElementById("menuToggle");
  const menu = document.getElementById("menu");
  const navLinks = document.getElementById("nav-links");

  if (menuToggle && menu && navLinks) {
    menuToggle.addEventListener("click", () => {
      menu.classList.toggle("hidden");
      navLinks.classList.toggle("hidden");
      navLinks.classList.toggle("flex");

      if (navLinks.classList.contains("flex")) {
        navLinks.classList.add("flex-col", "w-full", "mt-4", "space-y-4");
        navLinks.classList.remove("space-x-6");
      } else {
        navLinks.classList.remove("flex-col", "w-full", "mt-4", "space-y-4");
        navLinks.classList.add("space-x-6");
      }
    });
  }

  // ========== Product Filters ==========
  const productGrid = document.querySelector(".grid");
  const categoryDropdown = document.querySelector("select");
  const checkboxes = document.querySelectorAll('input[type="checkbox"]');
  const searchInput = document.querySelector('input[type="text"]');

  if (productGrid && categoryDropdown && checkboxes && searchInput) {
    let filters = {
      category: "All Categories",
      preCut: false,
      sameDay: false,
      bulk: false,
      search: "",
    };

    async function fetchProducts() {
      const url = `/api/products?category=${filters.category}&preCut=${filters.preCut}&sameDay=${filters.sameDay}&bulk=${filters.bulk}&search=${encodeURIComponent(filters.search)}`;
      try {
        const res = await fetch(url);
        const products = await res.json();
        renderProducts(products);
      } catch (err) {
        console.error("Failed to fetch products:", err);
      }
    }

    function renderProducts(products) {
      productGrid.innerHTML = "";

      if (!products.length) {
        productGrid.innerHTML = `<p class="text-gray-500 col-span-full text-center">No products found.</p>`;
        return;
      }

      products.forEach((prod) => {
        const card = document.createElement("div");
        card.className = "bg-white rounded-xl shadow p-4 hover:shadow-md";

        card.innerHTML = `
          <img src="${prod.imageUrl}" alt="${prod.name}" class="rounded-lg mb-3">
          <h3 class="font-semibold text-lg">${prod.name}</h3>
          <p class="text-sm text-gray-600">₹${prod.price}/${prod.unit} · ${prod.distance} km</p>
          ${prod.tags.map((tag) => `<p class="text-xs text-emerald-600 mt-1">${tag}</p>`).join("")}
          <button class="mt-3 w-full bg-amber-500 text-white py-2 rounded hover:bg-amber-600 text-sm" data-id="${prod.id}">Add to Cart</button>
        `;

        productGrid.appendChild(card);
      });

      addCartListeners();
    }

    function addCartListeners() {
      document.querySelectorAll("button[data-id]").forEach((button) => {
        button.addEventListener("click", async (e) => {
          const productId = e.target.getAttribute("data-id");
          await fetch("/api/cart", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId, quantity: 1 }),
          });
          alert("Added to cart!");
        });
      });
    }

    categoryDropdown.addEventListener("change", () => {
      filters.category = categoryDropdown.value;
      fetchProducts();
    });

    checkboxes.forEach((cb, index) => {
      cb.addEventListener("change", () => {
        filters.preCut = checkboxes[0].checked;
        filters.sameDay = checkboxes[1].checked;
        filters.bulk = checkboxes[2].checked;
        fetchProducts();
      });
    });

    searchInput.addEventListener("input", () => {
      filters.search = searchInput.value.trim();
      fetchProducts();
    });

    fetchProducts();
  }
});



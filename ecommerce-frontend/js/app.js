const API_BASE_URL = "https://tezmart-backend-qhwn.onrender.com/api";

function getLoggedInUser() {
  return JSON.parse(localStorage.getItem("loggedInUser")) || null;
}

function setLoggedInUser(user) {
  localStorage.setItem("loggedInUser", JSON.stringify(user));
}

function logoutUser() {
  localStorage.removeItem("loggedInUser");
  window.location.href = "index.html";
}

function getProductImageUrl(imagePath) {
  if (!imagePath) {
    return "https://images.unsplash.com/photo-1531403009284-440f085d1e12?w=800";
  }
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }
  if (imagePath.startsWith("/media/")) {
    return `https://tezmart-backend-qhwn.onrender.com${imagePath}`;
  }
  if (imagePath.startsWith("media/")) {
    return `https://tezmart-backend-qhwn.onrender.com/${imagePath}`;
  }
  return imagePath;
}

function renderProductPriceHtml(price, mrp) {
  const parsedPrice = parseFloat(price);
  const parsedMrp = mrp ? parseFloat(mrp) : null;

  if (parsedMrp && parsedMrp > parsedPrice) {
    const discount = Math.round(((parsedMrp - parsedPrice) / parsedMrp) * 100);
    if (discount > 0) {
      return `
        <span class="discount" style="color: #dc2626; font-weight: bold; margin-right: 8px;">-${discount}%</span>
        <span class="price" style="color: #0f172a; font-weight: 800; font-size: 1.1rem; margin-right: 8px;">₹${parsedPrice.toLocaleString()}</span>
        <span class="mrp" style="color: #64748b; text-decoration: line-through; font-size: 0.9rem;">M.R.P.: ₹${parsedMrp.toLocaleString()}</span>
      `;
    }
  }

  return `
    <span class="price" style="color: #0f172a; font-weight: 800; font-size: 1.1rem;">₹${parsedPrice.toLocaleString()}</span>
  `;
}

function updateCartCount(count = null) {
  const cartCountElements = document.querySelectorAll("#cartCount");
  if (count !== null) {
    cartCountElements.forEach((el) => {
      el.textContent = count;
    });
    return;
  }

  const user = getLoggedInUser();
  if (!user) {
    cartCountElements.forEach((el) => {
      el.textContent = 0;
    });
    return;
  }

  fetch(`${API_BASE_URL}/cart/?user_id=${user.id}`, { credentials: 'include' })
    .then((res) => res.json())
    .then((data) => {
      const total = Array.isArray(data)
        ? data.reduce((sum, item) => sum + item.quantity, 0)
        : 0;

      cartCountElements.forEach((el) => {
        el.textContent = total;
      });
    })
    .catch(() => {
      cartCountElements.forEach((el) => {
        el.textContent = 0;
      });
    });
}

function updateWishlistCount(count = null) {
  const wishlistCountElements = document.querySelectorAll("#wishlistCount");
  if (count !== null) {
    wishlistCountElements.forEach((el) => {
      el.textContent = count;
    });
    return;
  }

  const user = getLoggedInUser();
  if (!user) {
    wishlistCountElements.forEach((el) => {
      el.textContent = 0;
    });
    return;
  }

  fetch(`${API_BASE_URL}/wishlist/?user_id=${user.id}`, { credentials: 'include' })
    .then((res) => {
      if (!res.ok) throw new Error();
      return res.json();
    })
    .then((data) => {
      const total = Array.isArray(data) ? data.length : 0;
      wishlistCountElements.forEach((el) => {
        el.textContent = total;
      });
    })
    .catch(() => {
      wishlistCountElements.forEach((el) => {
        el.textContent = 0;
      });
    });
}

async function fetchProducts() {
  const response = await fetch(`${API_BASE_URL}/store/products/`);
  if (!response.ok) {
    throw new Error("Failed to fetch products");
  }
  return await response.json();
}

async function fetchProductById(id) {
  const response = await fetch(`${API_BASE_URL}/store/products/${id}/`);
  if (!response.ok) {
    throw new Error("Failed to fetch product details");
  }
  return await response.json();
}

async function addToCart(productId, qty = 1) {
  const user = getLoggedInUser();
  if (!user) {
    alert("Please login first to add items to cart.");
    window.location.href = "login.html";
    return;
  }

  const response = await fetch(`${API_BASE_URL}/cart/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      user_id: user.id,
      product_id: productId,
      quantity: qty
    }),
    credentials: 'include'
  });

  if (!response.ok) {
    throw new Error("Failed to add product to cart");
  }

  alert("Product added to cart successfully");
  updateCartCount();
}

function setupMenuToggle() {
  const menuToggle = document.getElementById("menuToggle");
  const sidebar = document.getElementById("tezSidebar");
  const overlay = document.getElementById("menuOverlay");
  const closeBtn = document.getElementById("sidebarClose");

  if (!menuToggle || !sidebar || !overlay) {
    return;
  }

  function openMenu() {
    sidebar.classList.add("active");
    overlay.classList.add("active");
    menuToggle.classList.add("active");
    menuToggle.setAttribute("aria-expanded", "true");
    sidebar.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    renderSidebarMenu();
  }

  function closeMenu() {
    sidebar.classList.remove("active");
    overlay.classList.remove("active");
    menuToggle.classList.remove("active");
    menuToggle.setAttribute("aria-expanded", "false");
    sidebar.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  menuToggle.addEventListener("click", function () {
    if (sidebar.classList.contains("active")) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  overlay.addEventListener("click", closeMenu);

  if (closeBtn) {
    closeBtn.addEventListener("click", closeMenu);
  }

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      closeMenu();
    }
  });
}

function renderSidebarMenu() {
  const sidebarMenu = document.querySelector(".sidebar-menu");
  if (!sidebarMenu) return;

  const user = getLoggedInUser();
  if (user) {
    sidebarMenu.innerHTML = `
      <a href="account.html">
        <span class="side-icon">👤</span>
        <span>
          <strong>Account</strong>
          <small>View your profile details</small>
        </span>
      </a>
      <a href="orders.html">
        <span class="side-icon">📦</span>
        <span>
          <strong>Orders</strong>
          <small>View your order history</small>
        </span>
      </a>
      <a href="#" id="sidebarLogoutBtn">
        <span class="side-icon">🚪</span>
        <span>
          <strong>Logout</strong>
          <small>Sign out of your account</small>
        </span>
      </a>
    `;

    const logoutBtn = document.getElementById("sidebarLogoutBtn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", async (e) => {
        e.preventDefault();
        try {
          await fetch(`${API_BASE_URL}/accounts/logout/`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            credentials: 'include'
          });
        } catch (err) {
          // ignore
        }
        logoutUser();
      });
    }
  } else {
    sidebarMenu.innerHTML = `
      <a href="login.html">
        <span class="side-icon">👤</span>
        <span>
          <strong>Account</strong>
          <small>Log in to view profile</small>
        </span>
      </a>
      <a href="login.html">
        <span class="side-icon">📦</span>
        <span>
          <strong>Orders</strong>
          <small>Log in to view orders</small>
        </span>
      </a>
    `;
  }
}

function renderNavbarAuth() {
  const container = document.getElementById("userStateContainer");
  if (!container) return;

  const user = getLoggedInUser();
  if (user) {
    container.innerHTML = `
      <div class="user-auth-state" style="display:flex; align-items:center; gap:8px;">
        <a href="account.html" class="username-link" title="Account Details" style="font-weight:600; color:#0f172a; text-decoration:none;">${user.username}</a>
        <button id="logoutNavBtn" class="logout-btn" title="Logout" style="background: none; border: none; cursor: pointer; padding: 0 4px; display: inline-flex; align-items: center; justify-content: center;">
          <svg class="logout-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
        </button>
      </div>
    `;

    const logoutBtn = document.getElementById("logoutNavBtn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", async (e) => {
        e.preventDefault();
        try {
          await fetch(`${API_BASE_URL}/accounts/logout/`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            credentials: 'include'
          });
        } catch (err) {
          // ignore
        }
        logoutUser();
      });
    }
  } else {
    container.innerHTML = `
      <a href="login.html" class="login-nav-btn">
        <span>Login</span>
      </a>
    `;
  }
}

function setupNavSearch() {
  const searchForm = document.getElementById("navSearchForm");
  if (searchForm) {
    searchForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const query = document.getElementById("navSearchInput").value.trim();
      if (query) {
        window.location.href = `products.html?search=${encodeURIComponent(query)}`;
      }
    });
  }
}

async function renderFeaturedProducts() {
  const featuredContainer = document.getElementById("featuredProducts");
  if (!featuredContainer) {
    return;
  }

  try {
    const products = await fetchProducts();
    const featured = products.slice(0, 4);

    featuredContainer.innerHTML = featured.map((product) => `
      <div class="product-card">
        <div class="product-image">
          <img
            src="${getProductImageUrl(product.image)}"
            alt="${product.name}"
            style="width:100%; height:100%; object-fit:cover; border-radius:12px;"
            onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1531403009284-440f085d1e12?w=800';"
          >
        </div>
        <h3>${product.name}</h3>
        <p class="category">${product.category?.name || "Category"}</p>
        <div class="product-bottom" style="display:flex; justify-content:space-between; align-items:center;">
          <div style="display:flex; flex-direction:column; gap:4px;">
            ${renderProductPriceHtml(product.price, product.mrp)}
          </div>
          <a href="product.html?id=${product.id}" class="btn btn-sm">View</a>
        </div>
      </div>
    `).join("");
  } catch (error) {
    featuredContainer.innerHTML = `
      <div class="empty-message">
        Failed to load featured products.
      </div>
    `;
  }
}

document.addEventListener("DOMContentLoaded", function () {
  setupMenuToggle();
  renderNavbarAuth();
  setupNavSearch();
  renderFeaturedProducts();
  updateCartCount();
  updateWishlistCount();
});
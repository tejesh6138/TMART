const API_BASE_URL = "https://tezmart-backend.onrender.com/api";

function getLoggedInUser() {
  return JSON.parse(localStorage.getItem("loggedInUser")) || null;
}

function setLoggedInUser(user) {
  localStorage.setItem("loggedInUser", JSON.stringify(user));
}

function logoutUser() {
  localStorage.removeItem("loggedInUser");
  window.location.href = "login.html";
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

  fetch(`${API_BASE_URL}/cart/?user_id=${user.id}`)
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
    return false;
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
    })
  });

  if (!response.ok) {
    throw new Error("Failed to add product to cart");
  }

  alert("Product added to cart successfully");
  updateCartCount();
  return true;
}

function setupMenuToggle() {
  // Kept for backward compatibility, returns if elements don't exist
  const menuToggle = document.getElementById("menuToggle");
  const sidebar = document.getElementById("tezSidebar");
  const overlay = document.getElementById("menuOverlay");
  if (!menuToggle || !sidebar || !overlay) return;
}

function renderNavbarAuth() {
  const authLink = document.getElementById("authNavLink");
  if (!authLink) return;

  const user = getLoggedInUser();

  if (user) {
    authLink.href = "#";
    authLink.innerHTML = "<span>Logout</span>";
    authLink.title = `Logged in as ${user.username}`;
    
    // Remove existing event listener if any (re-bind safely)
    const newAuthLink = authLink.cloneNode(true);
    authLink.parentNode.replaceChild(newAuthLink, authLink);
    
    newAuthLink.addEventListener("click", function (event) {
      event.preventDefault();
      logoutUser();
    });
  } else {
    authLink.href = "login.html";
    authLink.innerHTML = "<span>Login</span>";
  }
}

/* =========================================================
   IMAGE FALLBACK HANDLING
========================================================= */

const PRODUCT_IMAGE_FALLBACKS = {
  "Samsung M47 5g": "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800",
  "Samsung Galaxy M55 5G": "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800",
  "Redmi Note 14 5G": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800",
  "OnePlus Nord CE 4": "https://images.unsplash.com/photo-1567581935884-3349723552ca?w=800",
  "ASUS Vivobook 15": "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800",
  "HP Victus 15": "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800",
  "Lenovo IdeaPad Slim 3": "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800",
  "43 Inch Smart LED TV": "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800",
  "Portable Bluetooth Speaker": "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800",
  "20000mAh Power Bank": "https://images.unsplash.com/photo-1609592806596-b43bada2f2b5?w=800",
  "Wireless Bluetooth Earbuds": "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=800",
  "Over Ear Bluetooth Headphones": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800",
  "Type-C Wired Earphones": "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800"
};

const CATEGORY_IMAGE_PLACEHOLDERS = {
  "mobiles": "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800",
  "laptops": "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800",
  "electronics": "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800",
  "men's fashion": "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800",
  "women's fashion": "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800",
  "footwear": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800",
  "watches": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800",
  "headphones": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800",
  "home appliances": "https://images.unsplash.com/photo-1594213114663-d94db9b17125?w=800",
  "kitchen": "https://images.unsplash.com/photo-1584990347449-a16f307e4b10?w=800",
  "beauty": "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800",
  "personal care": "https://images.unsplash.com/photo-1559591937-e7d27f70c6a8?w=800",
  "books": "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800",
  "sports": "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800",
  "fitness": "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800",
  "bags": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800",
  "toys": "https://images.unsplash.com/photo-1594787318286-3d835c1d207f?w=800",
  "gaming": "https://images.unsplash.com/photo-1527814050087-3793815479db?w=800",
  "computer accessories": "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800",
  "mobile accessories": "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800"
};

const DEFAULT_PLACEHOLDER = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><rect width='100' height='100' fill='%23f8fafc'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='10' fill='%2394a3b8'>Tezmart</text></svg>";

function handleProductImageError(imgElement, productName, categoryName = "") {
  if (imgElement.getAttribute("data-fallback-tried")) {
    imgElement.src = DEFAULT_PLACEHOLDER;
    return;
  }
  imgElement.setAttribute("data-fallback-tried", "true");

  const fallback = PRODUCT_IMAGE_FALLBACKS[productName];
  if (fallback) {
    imgElement.src = fallback;
    return;
  }

  if (categoryName) {
    const catFallback = CATEGORY_IMAGE_PLACEHOLDERS[categoryName.toLowerCase()];
    if (catFallback) {
      imgElement.src = catFallback;
      return;
    }
  }

  imgElement.src = DEFAULT_PLACEHOLDER;
}

/* =========================================================
   DYNAMIC CATEGORY SUBNAV BAR
========================================================= */

async function renderCategoriesSubnav() {
  const container = document.getElementById("categoryNavContainer");
  if (!container) return;

  try {
    const products = await fetchProducts();
    const categoryMap = new Map();
    products.forEach((p) => {
      if (p.category && p.category.name) {
        categoryMap.set(p.category.name.toLowerCase(), p.category.name);
      }
    });

    const categories = Array.from(categoryMap.values()).sort();

    const icons = {
      "mobiles": "📱",
      "laptops": "💻",
      "electronics": "🔌",
      "men's fashion": "👕",
      "women's fashion": "👗",
      "footwear": "👟",
      "watches": "⌚",
      "headphones": "🎧",
      "home appliances": "🏠",
      "kitchen": "🍳",
      "beauty": "💄",
      "personal care": "🪞",
      "books": "📚",
      "sports": "🏏",
      "fitness": "🧘",
      "bags": "🎒",
      "toys": "🧸",
      "gaming": "🎮",
      "computer accessories": "🖱️",
      "mobile accessories": "🔌"
    };

    const urlParams = new URLSearchParams(window.location.search);
    const activeCategory = urlParams.get("category");

    let html = `
      <span class="category-pill ${!activeCategory ? 'active' : ''}" onclick="window.location.href='products.html'">
        📦 All
      </span>
    `;

    html += categories.map((cat) => {
      const icon = icons[cat.toLowerCase()] || "🏷️";
      const isActive = activeCategory && activeCategory.toLowerCase() === cat.toLowerCase();
      return `
        <span class="category-pill ${isActive ? 'active' : ''}" onclick="window.location.href='products.html?category=${encodeURIComponent(cat)}'">
          <span class="category-icon">${icon}</span> ${cat}
        </span>
      `;
    }).join("");

    container.innerHTML = html;
  } catch (error) {
    console.error("Failed to render categories subnav:", error);
  }
}

/* =========================================================
   HOMEPAGE PRODUCTS RENDERING
========================================================= */

function buildProductCardHTML(product) {
  const safeImg = product.image || DEFAULT_PLACEHOLDER;
  const escapedName = product.name.replace(/'/g, "\\'");
  const escapedCat = (product.category?.name || "").replace(/'/g, "\\'");
  
  return `
    <div class="product-card" onclick="window.location.href='product.html?id=${product.id}'">
      <div class="product-image">
        <img 
          src="${safeImg}" 
          alt="${product.name}" 
          onerror="handleProductImageError(this, '${escapedName}', '${escapedCat}')"
        />
      </div>
      <h3>${product.name}</h3>
      <p class="category">${product.category?.name || "Category"}</p>
      <div class="product-bottom">
        <span class="price">₹${parseFloat(product.price).toFixed(2)}</span>
      </div>
    </div>
  `;
}

async function renderFeaturedProducts() {
  const featuredContainer = document.getElementById("featuredProducts");
  const latestContainer = document.getElementById("latestProducts");
  const popularContainer = document.getElementById("popularProducts");

  if (!featuredContainer && !latestContainer && !popularContainer) {
    return;
  }

  try {
    const products = await fetchProducts();

    if (featuredContainer) {
      const featured = products.slice(0, 8);
      featuredContainer.innerHTML = featured.map(buildProductCardHTML).join("");
    }

    if (latestContainer) {
      const latest = products.slice(8, 16);
      if (latest.length > 0) {
        latestContainer.innerHTML = latest.map(buildProductCardHTML).join("");
      } else {
        const parentSection = latestContainer.closest("section");
        if (parentSection) parentSection.style.display = "none";
      }
    }

    if (popularContainer) {
      const popular = products.slice(16, 24);
      if (popular.length > 0) {
        popularContainer.innerHTML = popular.map(buildProductCardHTML).join("");
      } else {
        const parentSection = popularContainer.closest("section");
        if (parentSection) parentSection.style.display = "none";
      }
    }
  } catch (error) {
    const errHTML = `<div class="empty-message">Failed to load products from server.</div>`;
    if (featuredContainer) featuredContainer.innerHTML = errHTML;
    if (latestContainer) latestContainer.innerHTML = errHTML;
    if (popularContainer) popularContainer.innerHTML = errHTML;
  }
}

/* =========================================================
   INITIALIZATION
========================================================= */

document.addEventListener("DOMContentLoaded", function () {
  // Search form submit listener
  const navSearchForm = document.getElementById("navSearchForm");
  if (navSearchForm) {
    navSearchForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const query = document.getElementById("navSearchInput").value.trim();
      if (window.location.pathname.includes("products.html")) {
        const searchInput = document.getElementById("searchInput");
        if (searchInput) {
          searchInput.value = query;
          searchInput.dispatchEvent(new Event("input"));
        }
      } else {
        window.location.href = `products.html?search=${encodeURIComponent(query)}`;
      }
    });
  }

  // Prefill search term if any
  const params = new URLSearchParams(window.location.search);
  const searchTerm = params.get("search");
  if (searchTerm && document.getElementById("navSearchInput")) {
    document.getElementById("navSearchInput").value = searchTerm;
  }

  setupMenuToggle();
  renderNavbarAuth();
  renderCategoriesSubnav();
  renderFeaturedProducts();
  updateCartCount();
});
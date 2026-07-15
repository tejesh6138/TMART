document.addEventListener("DOMContentLoaded", async () => {
  const productsGrid = document.getElementById("productsGrid");
  const searchInput = document.getElementById("searchInput");
  const categoryFilter = document.getElementById("categoryFilter");
  const sortFilter = document.getElementById("sortFilter");
  const productCount = document.getElementById("productCount");

  if (!productsGrid) return;

  let allProducts = [];

  // Parse URL Parameters
  const urlParams = new URLSearchParams(window.location.search);
  const categoryParam = urlParams.get("category");
  const searchParam = urlParams.get("search");

  function renderProducts(products) {
    if (!products.length) {
      productsGrid.innerHTML = `
        <div class="empty-message" style="grid-column: 1/-1; text-align: center; padding: 40px; color: #64748b; font-size: 1.1rem;">
          No products available in this category.
        </div>
      `;
      if (productCount) productCount.textContent = "0 products found";
      return;
    }

    if (productCount) {
      productCount.textContent = `${products.length} products found`;
    }

    productsGrid.innerHTML = products.map(product => `
      <div class="product-card">
        <div class="product-image">
          <img 
            src="${getProductImageUrl(product.image)}" 
            alt="${product.name}" 
            style="width:100%;height:100%;object-fit:cover;border-radius:12px;"
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
  }

  function applyFilters() {
    let filtered = [...allProducts];

    const searchValue = searchInput ? searchInput.value.toLowerCase().trim() : "";
    const categoryValue = categoryFilter ? categoryFilter.value : "all";
    const sortValue = sortFilter ? sortFilter.value : "default";

    if (searchValue) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchValue) ||
        (product.description || "").toLowerCase().includes(searchValue) ||
        (product.category?.name || "").toLowerCase().includes(searchValue)
      );
    }

    if (categoryValue !== "all") {
      filtered = filtered.filter(product => 
        product.category?.slug === categoryValue || 
        product.category?.name === categoryValue ||
        String(product.category?.id) === categoryValue
      );
    }

    if (sortValue === "low-high") {
      filtered.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
    } else if (sortValue === "high-low") {
      filtered.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
    } else if (sortValue === "name-asc") {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    }

    renderProducts(filtered);
  }

  async function loadCategories() {
    try {
      const response = await fetch(`${API_BASE_URL}/store/categories/`);
      if (response.ok) {
        const categories = await response.json();
        if (categoryFilter) {
          categoryFilter.innerHTML = `
            <option value="all">All Categories</option>
            ${categories.map(cat => `<option value="${cat.slug}">${cat.name}</option>`).join("")}
          `;
        }
      }
    } catch (e) {
      console.error("Failed to load categories", e);
    }
  }

  try {
    // 1. Load categories
    await loadCategories();

    // 2. Fetch products
    allProducts = await fetchProducts();

    // 3. Set input values from URL search params if present
    if (searchParam && searchInput) {
      searchInput.value = searchParam;
    }
    if (categoryParam && categoryFilter) {
      // Find matching option (check value matches slug, name, or id)
      for (let option of categoryFilter.options) {
        if (option.value === categoryParam || option.text === categoryParam) {
          categoryFilter.value = option.value;
          break;
        }
      }
    }

    // 4. Initial filter apply
    applyFilters();
  } catch (error) {
    productsGrid.innerHTML = `<div class="empty-message">Failed to load products from server.</div>`;
  }

  if (searchInput) searchInput.addEventListener("input", applyFilters);
  if (categoryFilter) categoryFilter.addEventListener("change", applyFilters);
  if (sortFilter) sortFilter.addEventListener("change", applyFilters);
});
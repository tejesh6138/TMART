document.addEventListener("DOMContentLoaded", async () => {
  const productsGrid = document.getElementById("productsGrid");
  const searchInput = document.getElementById("searchInput");
  const categoryFilter = document.getElementById("categoryFilter");
  const sortFilter = document.getElementById("sortFilter");
  const productCount = document.getElementById("productCount");

  if (!productsGrid) return;

  let allProducts = [];

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

  function renderProducts(products) {
    if (!products.length) {
      productsGrid.innerHTML = `<div class="empty-message">No products found.</div>`;
      if (productCount) productCount.textContent = "0 products found";
      return;
    }

    if (productCount) {
      productCount.textContent = `${products.length} products found`;
    }

    productsGrid.innerHTML = products.map(buildProductCardHTML).join("");
  }

  function applyFilters() {
    let filtered = [...allProducts];

    const searchValue = searchInput ? searchInput.value.toLowerCase().trim() : "";
    const categoryValue = categoryFilter ? categoryFilter.value : "all";
    const sortValue = sortFilter ? sortFilter.value : "default";

    if (searchValue) {
      filtered = filtered.filter(product => {
        const name = (product.name || "").toLowerCase();
        const cat = (product.category?.name || "").toLowerCase();
        const desc = (product.description || "").toLowerCase();
        return name.includes(searchValue) || cat.includes(searchValue) || desc.includes(searchValue);
      });
    }

    if (categoryValue !== "all") {
      filtered = filtered.filter(product => 
        (product.category?.name || "").toLowerCase() === categoryValue.toLowerCase()
      );
    }

    if (sortValue === "low-high") {
      filtered.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
    } else if (sortValue === "high-low") {
      filtered.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
    } else if (sortValue === "name-asc") {
      filtered.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    }

    renderProducts(filtered);
  }

  function populateCategoryDropdown(products) {
    if (!categoryFilter) return;

    // Get unique categories
    const categoryMap = new Map();
    products.forEach(p => {
      if (p.category && p.category.name) {
        categoryMap.set(p.category.name.toLowerCase(), p.category.name);
      }
    });

    const categories = Array.from(categoryMap.values()).sort();

    // Populate option elements, preserving "All"
    categoryFilter.innerHTML = `<option value="all">All</option>` + 
      categories.map(cat => `<option value="${cat}">${cat}</option>`).join("");
  }

  try {
    allProducts = await fetchProducts();
    
    // Dynamic dropdown generation
    populateCategoryDropdown(allProducts);

    // Read URL params
    const urlParams = new URLSearchParams(window.location.search);
    const searchParam = urlParams.get("search");
    const categoryParam = urlParams.get("category");

    if (searchParam && searchInput) {
      searchInput.value = searchParam;
    }

    if (categoryParam && categoryFilter) {
      // Find matching option (case-insensitive check)
      const options = Array.from(categoryFilter.options);
      const match = options.find(opt => opt.value.toLowerCase() === categoryParam.toLowerCase());
      if (match) {
        categoryFilter.value = match.value;
      } else {
        // Fallback: if not in select list yet, set to all or default
        categoryFilter.value = "all";
      }
    }

    applyFilters();
  } catch (error) {
    productsGrid.innerHTML = `<div class="empty-message">Failed to load products from server.</div>`;
  }

  if (searchInput) searchInput.addEventListener("input", applyFilters);
  if (categoryFilter) categoryFilter.addEventListener("change", applyFilters);
  if (sortFilter) sortFilter.addEventListener("change", applyFilters);
});
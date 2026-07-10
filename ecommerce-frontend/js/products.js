document.addEventListener("DOMContentLoaded", async () => {
  const productsGrid = document.getElementById("productsGrid");
  const searchInput = document.getElementById("searchInput");
  const categoryFilter = document.getElementById("categoryFilter");
  const sortFilter = document.getElementById("sortFilter");
  const productCount = document.getElementById("productCount");

  if (!productsGrid) return;

  let allProducts = [];

  function renderProducts(products) {
    if (!products.length) {
      productsGrid.innerHTML = `<div class="empty-message">No products found.</div>`;
      if (productCount) productCount.textContent = "0 products found";
      return;
    }

    if (productCount) {
      productCount.textContent = `${products.length} products found`;
    }

    productsGrid.innerHTML = products.map(product => `
      <div class="product-card">
        <div class="product-image">
          ${product.image
            ? `<img src="${product.image}" alt="${product.name}" style="width:100%;height:100%;object-fit:cover;border-radius:12px;">`
            : product.name}
        </div>
        <h3>${product.name}</h3>
        <p class="category">${product.category?.name || "Category"}</p>
        <div class="product-bottom">
          <span class="price">₹${product.price}</span>
          <a href="product.html?id=${product.id}" class="btn btn-sm">View</a>
        </div>
      </div>
    `).join("");
  }

  function applyFilters() {
    let filtered = [...allProducts];

    const searchValue = searchInput.value.toLowerCase().trim();
    const categoryValue = categoryFilter.value;
    const sortValue = sortFilter.value;

    if (searchValue) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchValue) ||
        (product.category?.name || "").toLowerCase().includes(searchValue)
      );
    }

    if (categoryValue !== "all") {
      filtered = filtered.filter(product => (product.category?.name || "") === categoryValue);
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

  try {
    allProducts = await fetchProducts();
    renderProducts(allProducts);
  } catch (error) {
    productsGrid.innerHTML = `<div class="empty-message">Failed to load products from server.</div>`;
  }

  if (searchInput) searchInput.addEventListener("input", applyFilters);
  if (categoryFilter) categoryFilter.addEventListener("change", applyFilters);
  if (sortFilter) sortFilter.addEventListener("change", applyFilters);
});
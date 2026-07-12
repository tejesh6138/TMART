document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("productDetailContainer");
  if (!container) return;

  const params = new URLSearchParams(window.location.search);
  const productId = Number(params.get("id"));

  if (!productId) {
    container.innerHTML = `<div class="empty-message">Invalid product ID.</div>`;
    return;
  }

  try {
    const product = await fetchProductById(productId);

    const safeImg = product.image || DEFAULT_PLACEHOLDER;
    const escapedName = product.name.replace(/'/g, "\\'");
    const escapedCat = (product.category?.name || "").replace(/'/g, "\\'");

    container.innerHTML = `
      <div class="product-detail">
        <div class="product-detail-image">
          <img 
            src="${safeImg}" 
            alt="${product.name}" 
            id="productDetailImg"
            onerror="handleProductImageError(this, '${escapedName}', '${escapedCat}')"
          />
        </div>

        <div class="product-detail-info">
          <p class="category">🏷️ ${product.category?.name || "Category"}</p>
          <h2>${product.name}</h2>
          <div class="product-detail-price">₹${parseFloat(product.price).toFixed(2)}</div>
          <p class="description">${product.description || "No description available."}</p>
          <p class="stock-info"><strong>Stock:</strong> ${product.stock} units available</p>

          <div class="qty-box" style="margin-top: 20px; margin-bottom: 25px;">
            <label for="qty" style="font-weight: 700;">Quantity:</label>
            <input type="number" id="qty" min="1" max="${product.stock}" value="1" />
          </div>

          <div style="display:flex; gap:12px; flex-wrap:wrap;">
            <button id="buyNowBtn" class="btn btn-primary" style="background:#0f172a !important; color:#ffffff !important;">Buy Now</button>
            <button id="addToCartBtn" class="btn btn-primary" style="background:#0f172a !important; color:#ffffff !important;">Add to Cart</button>
            <button id="addToWishlistBtn" class="btn btn-primary" style="background:#0f172a !important; color:#ffffff !important;">Add to Wishlist</button>
          </div>
        </div>
      </div>
    `;

    const buyNowBtn = document.getElementById("buyNowBtn");
    const addToCartBtn = document.getElementById("addToCartBtn");
    const addToWishlistBtn = document.getElementById("addToWishlistBtn");

    function getSelectedQty() {
      const qty = Number(document.getElementById("qty").value) || 1;
      if (qty < 1) {
        alert("Quantity must be at least 1");
        return null;
      }
      if (qty > product.stock) {
        alert("Selected quantity exceeds available stock");
        return null;
      }
      return qty;
    }

    buyNowBtn.addEventListener("click", async () => {
      const user = getLoggedInUser();
      if (!user) {
        alert("Please login to continue.");
        window.location.href = "login.html";
        return;
      }

      const qty = getSelectedQty();
      if (qty === null) return;

      try {
        const success = await addToCart(product.id, qty);
        if (success) {
          window.location.href = "checkout.html";
        }
      } catch (error) {
        alert("Failed to process Buy Now order.");
      }
    });

    addToCartBtn.addEventListener("click", async () => {
      const qty = getSelectedQty();
      if (qty === null) return;

      try {
        await addToCart(product.id, qty);
      } catch (error) {
        alert("Failed to add product to cart.");
      }
    });

    addToWishlistBtn.addEventListener("click", async () => {
      const user = getLoggedInUser();

      if (!user) {
        alert("Please login first.");
        window.location.href = "login.html";
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/wishlist/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            user_id: user.id,
            product_id: product.id
          })
        });

        if (!response.ok) {
          throw new Error("Wishlist add failed");
        }

        alert("Added to wishlist successfully");
      } catch (error) {
        alert("Failed to add to wishlist.");
      }
    });
  } catch (error) {
    container.innerHTML = `<div class="empty-message">Product not found or failed to load.</div>`;
  }
});
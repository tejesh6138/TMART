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

    container.innerHTML = `
      <div class="product-detail" style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 20px; align-items: start;">
        <div class="product-detail-image" style="max-height: 450px; overflow: hidden; border-radius: 14px; border: 1px solid #e2e8f0;">
          <img 
            src="${getProductImageUrl(product.image)}" 
            alt="${product.name}" 
            style="width:100%;height:100%;object-fit:cover;border-radius:14px;"
            onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1531403009284-440f085d1e12?w=800';"
          >
        </div>

        <div class="product-detail-info">
          <h2 style="color:#0f172a; font-size:2rem; margin-bottom:12px; font-weight:800;">${product.name}</h2>
          <p style="color:#64748b; margin-bottom:16px;"><strong>Category:</strong> ${product.category?.name || "Category"}</p>
          
          <div class="product-detail-price" style="display:flex; align-items:center; gap:8px; margin-bottom:20px;">
            ${renderProductPriceHtml(product.price, product.mrp)}
          </div>
          
          <p style="color:#334155; line-height:1.6; margin-bottom:24px;">${product.description || "No description available."}</p>
          <p style="color:#334155; margin-bottom:24px;"><strong>Stock Availability:</strong> ${product.stock > 0 ? `${product.stock} items left` : '<span style="color:#dc2626; font-weight:700;">Out of Stock</span>'}</p>

          <div class="qty-box" style="margin-bottom: 24px; display: flex; align-items: center; gap: 10px;">
            <label for="qty" style="font-weight:600; color:#334155;">Quantity:</label>
            <input type="number" id="qty" min="1" max="${product.stock}" value="1" style="width:70px; padding:8px; border-radius:8px; border:1px solid #cbd5e1; text-align:center;" />
          </div>

          <div style="display:flex; gap:12px; flex-wrap:wrap;">
            <button id="buyNowBtn" class="btn" style="background:#ff6a00; color:white; font-weight:700; padding:12px 24px; border-radius:10px; border:none; cursor:pointer; flex:1;">Buy Now</button>
            <button id="addToCartBtn" class="btn btn-primary" style="flex:1;">Add to Cart</button>
            <button id="addToWishlistBtn" class="btn btn-outline" style="flex:1;">Add to Wishlist</button>
          </div>
        </div>
      </div>
    `;

    const buyNowBtn = document.getElementById("buyNowBtn");
    const addToCartBtn = document.getElementById("addToCartBtn");
    const addToWishlistBtn = document.getElementById("addToWishlistBtn");

    if (addToCartBtn) {
      addToCartBtn.addEventListener("click", async () => {
        const qty = Number(document.getElementById("qty").value) || 1;

        if (qty < 1) {
          alert("Quantity must be at least 1");
          return;
        }

        if (qty > product.stock) {
          alert("Selected quantity exceeds available stock");
          return;
        }

        try {
          await addToCart(product.id, qty);
        } catch (error) {
          alert("Failed to add product to cart.");
        }
      });
    }

    if (buyNowBtn) {
      buyNowBtn.addEventListener("click", async () => {
        const qty = Number(document.getElementById("qty").value) || 1;

        if (qty < 1) {
          alert("Quantity must be at least 1");
          return;
        }

        if (qty > product.stock) {
          alert("Selected quantity exceeds available stock");
          return;
        }

        try {
          await addToCart(product.id, qty);
          window.location.href = "cart.html";
        } catch (error) {
          alert("Failed to proceed with Buy Now.");
        }
      });
    }

    if (addToWishlistBtn) {
      addToWishlistBtn.addEventListener("click", async () => {
        const user = getLoggedInUser();

        if (!user) {
          alert("Please login first to add items to wishlist.");
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
            }),
            credentials: 'include'
          });

          if (!response.ok) {
            throw new Error("Wishlist add failed");
          }

          alert("Added to wishlist successfully");
          updateWishlistCount();
        } catch (error) {
          alert("Failed to add to wishlist.");
        }
      });
    }
  } catch (error) {
    container.innerHTML = `<div class="empty-message">Product not found or failed to load.</div>`;
  }
});
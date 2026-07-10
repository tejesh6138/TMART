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
      <div class="product-detail">
        <div class="product-detail-image">
          ${
            product.image
              ? `<img src="${product.image}" alt="${product.name}" style="width:100%;height:100%;object-fit:cover;border-radius:14px;">`
              : product.name
          }
        </div>

        <div class="product-detail-info">
          <h2>${product.name}</h2>
          <p><strong>Category:</strong> ${product.category?.name || "Category"}</p>
          <div class="product-detail-price">₹${product.price}</div>
          <p>${product.description}</p>
          <p><strong>Stock:</strong> ${product.stock}</p>

          <div class="qty-box">
            <label for="qty">Quantity:</label>
            <input type="number" id="qty" min="1" max="${product.stock}" value="1" />
          </div>

          <div style="display:flex; gap:12px; flex-wrap:wrap;">
            <button id="addToCartBtn" class="btn btn-primary">Add to Cart</button>
            <button id="addToWishlistBtn" class="btn btn-outline">Add to Wishlist</button>
          </div>
        </div>
      </div>
    `;

    const addToCartBtn = document.getElementById("addToCartBtn");
    const addToWishlistBtn = document.getElementById("addToWishlistBtn");

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
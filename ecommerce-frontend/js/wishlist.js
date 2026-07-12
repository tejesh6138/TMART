document.addEventListener("DOMContentLoaded", async () => {
  const wishlistContainer = document.getElementById("wishlistContainer");
  if (!wishlistContainer) return;

  const user = getLoggedInUser();

  if (!user) {
    wishlistContainer.innerHTML = `
      <div class="empty-message">
        Please login to view your wishlist. <a href="login.html">Login</a>
      </div>
    `;
    return;
  }

  async function loadWishlist() {
    try {
      const response = await fetch(`${API_BASE_URL}/wishlist/?user_id=${user.id}`);
      if (!response.ok) throw new Error("Failed to fetch wishlist");

      const wishlist = await response.json();

      if (!wishlist.length) {
        wishlistContainer.innerHTML = `<div class="empty-message">Your wishlist is empty.</div>`;
        return;
      }

      wishlistContainer.innerHTML = wishlist.map(item => {
        const safeImg = item.product.image || DEFAULT_PLACEHOLDER;
        const escapedName = item.product.name.replace(/'/g, "\\'");
        const escapedCat = (item.product.category?.name || "").replace(/'/g, "\\'");

        return `
          <div class="product-card" onclick="if(event.target.tagName !== 'BUTTON' && event.target.tagName !== 'A') window.location.href='product.html?id=${item.product.id}'">
            <div class="product-image">
              <img 
                src="${safeImg}" 
                alt="${item.product.name}" 
                onerror="handleProductImageError(this, '${escapedName}', '${escapedCat}')"
                style="width:100%;height:100%;object-fit:contain;border-radius:12px;"
              />
            </div>
            <h3>${item.product.name}</h3>
            <p class="category">${item.product.category?.name || "Category"}</p>
            <div class="product-bottom">
              <span class="price">₹${parseFloat(item.product.price).toFixed(2)}</span>
              <div style="display:flex; gap:8px;">
                <a href="product.html?id=${item.product.id}" class="btn btn-sm" style="background:var(--dark); color:var(--white);">View</a>
                <button class="btn btn-sm remove-wishlist-btn" data-id="${item.id}" style="background:var(--dark); color:var(--white);">Remove</button>
              </div>
            </div>
          </div>
        `;
      }).join("");

      bindRemoveButtons();
    } catch (error) {
      wishlistContainer.innerHTML = `<div class="empty-message">Failed to load wishlist.</div>`;
    }
  }

  function bindRemoveButtons() {
    const removeButtons = document.querySelectorAll(".remove-wishlist-btn");

    removeButtons.forEach(btn => {
      btn.addEventListener("click", async (e) => {
        const wishlistId = e.target.dataset.id;

        try {
          const response = await fetch(`${API_BASE_URL}/wishlist/${wishlistId}/`, {
            method: "DELETE"
          });

          if (!response.ok) {
            throw new Error("Failed to remove wishlist item");
          }

          loadWishlist();
        } catch (error) {
          alert("Failed to remove wishlist item.");
        }
      });
    });
  }

  loadWishlist();
});
document.addEventListener("DOMContentLoaded", async () => {
  const cartItemsContainer = document.getElementById("cartItemsContainer");
  const subtotalAmount = document.getElementById("subtotalAmount");
  const totalAmount = document.getElementById("totalAmount");

  if (!cartItemsContainer) return;

  const user = getLoggedInUser();

  if (!user) {
    cartItemsContainer.innerHTML = `
      <div class="empty-message">
        Please login to view your cart. <a href="login.html">Login</a>
      </div>
    `;
    return;
  }

  async function fetchCartItems() {
    const response = await fetch(`${API_BASE_URL}/cart/?user_id=${user.id}`);
    if (!response.ok) throw new Error("Failed to fetch cart");
    return await response.json();
  }

  async function updateCartItem(cartItemId, productId, quantity) {
    const response = await fetch(`${API_BASE_URL}/cart/${cartItemId}/`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        user_id: user.id,
        product_id: productId,
        quantity: quantity
      })
    });

    if (!response.ok) {
      throw new Error("Failed to update cart item");
    }

    return await response.json();
  }

  async function deleteCartItem(cartItemId) {
    const response = await fetch(`${API_BASE_URL}/cart/${cartItemId}/`, {
      method: "DELETE"
    });

    if (!response.ok) {
      throw new Error("Failed to remove cart item");
    }
  }

  async function renderCart() {
    try {
      const cart = await fetchCartItems();

      if (!cart.length) {
        cartItemsContainer.innerHTML = `
          <div class="empty-message">
            Your cart is empty. <a href="products.html">Go shopping</a>
          </div>
        `;
        subtotalAmount.textContent = "₹0";
        totalAmount.textContent = "₹0";
        updateCartCount(0);
        return;
      }

      let subtotal = 0;
      let totalQty = 0;

      cartItemsContainer.innerHTML = cart.map(item => {
        const itemPrice = parseFloat(item.product.price);
        const itemTotal = itemPrice * item.quantity;
        subtotal += itemTotal;
        totalQty += item.quantity;

        return `
          <div class="cart-item">
            <div class="cart-item-image">
              ${
                item.product.image
                  ? `<img src="${item.product.image}" alt="${item.product.name}" style="width:100%;height:100%;object-fit:cover;border-radius:12px;">`
                  : item.product.name
              }
            </div>

            <div>
              <h3>${item.product.name}</h3>
              <p>${item.product.category?.name || "Category"}</p>
              <p>₹${item.product.price}</p>
            </div>

            <div>
              <label>Qty</label>
              <input 
                type="number" 
                min="1" 
                value="${item.quantity}" 
                data-id="${item.id}" 
                data-product-id="${item.product.id}" 
                class="cart-qty-input" 
              />
              <button class="btn btn-sm remove-btn" data-id="${item.id}" style="margin-top:10px;">Remove</button>
            </div>
          </div>
        `;
      }).join("");

      const shipping = cart.length ? 99 : 0;
      subtotalAmount.textContent = `₹${subtotal.toFixed(2)}`;
      totalAmount.textContent = `₹${(subtotal + shipping).toFixed(2)}`;

      updateCartCount(totalQty);
      bindCartEvents();
    } catch (error) {
      cartItemsContainer.innerHTML = `<div class="empty-message">Failed to load cart items.</div>`;
    }
  }

  function bindCartEvents() {
    const qtyInputs = document.querySelectorAll(".cart-qty-input");
    const removeButtons = document.querySelectorAll(".remove-btn");

    qtyInputs.forEach(input => {
      input.addEventListener("change", async (e) => {
        const cartItemId = Number(e.target.dataset.id);
        const productId = Number(e.target.dataset.productId);
        const qty = Number(e.target.value);

        if (qty < 1) {
          alert("Quantity must be at least 1");
          renderCart();
          return;
        }

        try {
          await updateCartItem(cartItemId, productId, qty);
          renderCart();
        } catch (error) {
          alert("Failed to update cart item");
        }
      });
    });

    removeButtons.forEach(btn => {
      btn.addEventListener("click", async (e) => {
        const cartItemId = Number(e.target.dataset.id);

        try {
          await deleteCartItem(cartItemId);
          renderCart();
        } catch (error) {
          alert("Failed to remove cart item");
        }
      });
    });
  }

  renderCart();
});
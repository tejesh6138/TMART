document.addEventListener("DOMContentLoaded", async () => {
  const checkoutSummary = document.getElementById("checkoutSummary");
  const checkoutForm = document.getElementById("checkoutForm");

  const user = getLoggedInUser();

  if (!user) {
    alert("Please login first.");
    window.location.href = "login.html";
    return;
  }

  async function fetchCartItems() {
    const response = await fetch(`${API_BASE_URL}/cart/?user_id=${user.id}`);
    if (!response.ok) throw new Error("Failed to fetch cart");
    return await response.json();
  }

  async function renderSummary() {
    try {
      const cart = await fetchCartItems();

      if (!cart.length) {
        checkoutSummary.innerHTML = `<p>Your cart is empty.</p>`;
        return;
      }

      let subtotal = 0;

      checkoutSummary.innerHTML = cart.map(item => {
        const itemPrice = parseFloat(item.product.price);
        const itemTotal = itemPrice * item.quantity;
        subtotal += itemTotal;

        return `
          <div class="summary-row">
            <span>${item.product.name} × ${item.quantity}</span>
            <span>₹${itemTotal.toFixed(2)}</span>
          </div>
        `;
      }).join("");

      checkoutSummary.innerHTML += `
        <hr style="margin: 15px 0;">
        <div class="summary-row">
          <span>Subtotal</span>
          <span>₹${subtotal.toFixed(2)}</span>
        </div>
        <div class="summary-row">
          <span>Shipping</span>
          <span>₹99.00</span>
        </div>
        <div class="summary-row total">
          <span>Total</span>
          <span>₹${(subtotal + 99).toFixed(2)}</span>
        </div>
      `;
    } catch (error) {
      checkoutSummary.innerHTML = `<p>Failed to load checkout summary.</p>`;
    }
  }

  if (checkoutForm) {
    checkoutForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      try {
        const cart = await fetchCartItems();

        if (!cart.length) {
          alert("Your cart is empty.");
          return;
        }

        const paymentValue = document.getElementById("paymentMethod").value;
        let backendPayment = "COD";

        if (paymentValue === "upi") backendPayment = "UPI";
        if (paymentValue === "card") backendPayment = "CARD";

        const orderPayload = {
          user_id: user.id,
          full_name: document.getElementById("fullName").value.trim(),
          email: document.getElementById("email").value.trim(),
          phone: document.getElementById("phone").value.trim(),
          address: document.getElementById("address").value.trim(),
          city: document.getElementById("city").value.trim(),
          pincode: document.getElementById("pincode").value.trim(),
          payment_method: backendPayment,
          order_items: cart.map(item => ({
            product: item.product.id,
            quantity: item.quantity,
            price: item.product.price
          }))
        };

        const orderResponse = await fetch(`${API_BASE_URL}/orders/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(orderPayload)
        });

        const orderData = await orderResponse.json();

        if (!orderResponse.ok) {
          console.log(orderData);
          alert("Failed to place order.");
          return;
        }

        for (const item of cart) {
          await fetch(`${API_BASE_URL}/cart/${item.id}/`, {
            method: "DELETE"
          });
        }

        alert("Order placed successfully!");
        window.location.href = "orders.html";
      } catch (error) {
        alert("Server error while placing order.");
      }
    });
  }

  renderSummary();
});
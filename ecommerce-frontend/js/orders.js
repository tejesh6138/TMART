document.addEventListener("DOMContentLoaded", async () => {
  const ordersContainer = document.getElementById("ordersContainer");
  if (!ordersContainer) return;

  const user = getLoggedInUser();

  if (!user) {
    ordersContainer.innerHTML = `
      <div class="empty-message">
        Please login to view your orders. <a href="login.html">Login</a>
      </div>
    `;
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/orders/?user_id=${user.id}`);
    if (!response.ok) throw new Error("Failed to fetch orders");

    const orders = await response.json();

    if (!orders.length) {
      ordersContainer.innerHTML = `<div class="empty-message">No orders found yet.</div>`;
      return;
    }

    ordersContainer.innerHTML = orders.map(order => `
      <div class="order-card">
        <div class="order-top">
          <div>
            <h3>Order #${order.id}</h3>
            <p>Placed on ${new Date(order.created_at).toLocaleString()}</p>
          </div>
          <span class="status ${order.status.toLowerCase()}">${order.status}</span>
        </div>

        <div style="margin: 12px 0;">
          ${order.items.map(item => `
            <p>${item.product_name} × ${item.quantity} — ₹${item.price}</p>
          `).join("")}
        </div>

        <strong>Total: ₹${order.total_amount}</strong>
      </div>
    `).join("");
  } catch (error) {
    ordersContainer.innerHTML = `<div class="empty-message">Failed to load orders.</div>`;
  }
});
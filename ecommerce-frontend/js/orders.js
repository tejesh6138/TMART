document.addEventListener("DOMContentLoaded", async () => {
  const ordersContainer = document.getElementById("ordersContainer");
  if (!ordersContainer) return;

  const user = getLoggedInUser();

  if (!user) {
    ordersContainer.innerHTML = `
      <div class="empty-message" style="text-align: center; padding: 40px; font-size: 1.1rem; color: #64748b;">
        Please login to view your orders. <a href="login.html" style="color: #7c3aed; font-weight: 600;">Login</a>
      </div>
    `;
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/orders/?user_id=${user.id}`, {
      credentials: 'include'
    });
    if (!response.ok) throw new Error("Failed to fetch orders");

    const orders = await response.json();

    if (!orders.length) {
      ordersContainer.innerHTML = `
        <div class="empty-message" style="text-align: center; padding: 40px; font-size: 1.1rem; color: #64748b;">
          No orders found yet. <a href="products.html" style="color: #7c3aed; font-weight: 600;">Shop Now</a>
        </div>
      `;
      return;
    }

    ordersContainer.innerHTML = orders.map(order => {
      // Format date
      const orderDate = new Date(order.created_at).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      // Tracking state logic
      const status = order.status;
      const isCancelled = status === 'Cancelled';
      const isPendingActive = status === 'Pending' || status === 'Processing' || status === 'Shipped' || status === 'Delivered';
      const isShippedActive = status === 'Shipped' || status === 'Delivered';
      const isDeliveredActive = status === 'Delivered';

      // Build the tracking HTML
      let trackingHtml = '';
      if (isCancelled) {
        trackingHtml = `
          <div class="cancelled-badge" style="display: flex; align-items: center; gap: 8px; padding: 12px 16px; background: #fef2f2; border: 1px solid #fee2e2; border-radius: 8px; color: #dc2626; font-weight: 600; margin-top: 15px;">
            <span style="font-size: 1.2rem; line-height: 1;">✕</span>
            <span>Order Cancelled</span>
          </div>
        `;
      } else {
        trackingHtml = `
          <div style="margin-top: 20px;">
            <p style="font-size: 0.8rem; font-weight: 700; color: #64748b; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.05em;">Tracking Status</p>
            <div class="tracking-timeline" style="display: flex; align-items: center; justify-content: space-between; padding: 15px 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; position: relative;">
              
              <!-- Pending -->
              <div class="timeline-stage" style="display: flex; flex-direction: column; align-items: center; flex: 1; z-index: 2;">
                <div class="circle" style="width: 28px; height: 28px; border-radius: 50%; background: ${isPendingActive ? '#ff6a00' : '#cbd5e1'}; color: white; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; border: 3px solid #fff; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  ${status === 'Processing' || isShippedActive ? '✓' : '1'}
                </div>
                <span style="font-size: 0.8rem; font-weight: 600; margin-top: 6px; color: ${isPendingActive ? '#ff6a00' : '#64748b'};">
                  ${status === 'Processing' ? 'Processing' : 'Pending'}
                </span>
              </div>
              
              <!-- Line 1 -->
              <div style="height: 4px; background: ${isShippedActive ? '#ff6a00' : '#e2e8f0'}; flex: 1; margin: -18px -15px 0; z-index: 1;"></div>
              
              <!-- Shipped -->
              <div class="timeline-stage" style="display: flex; flex-direction: column; align-items: center; flex: 1; z-index: 2;">
                <div class="circle" style="width: 28px; height: 28px; border-radius: 50%; background: ${isShippedActive ? '#ff6a00' : '#cbd5e1'}; color: white; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; border: 3px solid #fff; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  ${isDeliveredActive ? '✓' : '2'}
                </div>
                <span style="font-size: 0.8rem; font-weight: 600; margin-top: 6px; color: ${isShippedActive ? '#ff6a00' : '#64748b'};">Shipped</span>
              </div>
              
              <!-- Line 2 -->
              <div style="height: 4px; background: ${isDeliveredActive ? '#ff6a00' : '#e2e8f0'}; flex: 1; margin: -18px -15px 0; z-index: 1;"></div>
              
              <!-- Delivered -->
              <div class="timeline-stage" style="display: flex; flex-direction: column; align-items: center; flex: 1; z-index: 2;">
                <div class="circle" style="width: 28px; height: 28px; border-radius: 50%; background: ${isDeliveredActive ? '#ff6a00' : '#cbd5e1'}; color: white; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; border: 3px solid #fff; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  3
                </div>
                <span style="font-size: 0.8rem; font-weight: 600; margin-top: 6px; color: ${isDeliveredActive ? '#ff6a00' : '#64748b'};">Delivered</span>
              </div>
              
            </div>
          </div>
        `;
      }

      // Build products list HTML
      const productsHtml = order.items.map(item => `
        <div class="order-item" style="display: flex; gap: 16px; align-items: center; margin-bottom: 12px;">
          <div style="width: 60px; height: 60px; border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0; flex-shrink: 0;">
            <img 
              src="${getProductImageUrl(item.product_image)}" 
              alt="${item.product_name}" 
              style="width: 100%; height: 100%; object-fit: cover;"
              onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1531403009284-440f085d1e12?w=800';"
            >
          </div>
          <div style="flex: 1;">
            <h4 style="margin: 0 0 4px; font-size: 0.95rem; color: #0f172a; font-weight: 600;">${item.product_name}</h4>
            <p style="margin: 0; font-size: 0.85rem; color: #64748b;">Quantity: ${item.quantity} × ₹${parseFloat(item.price).toLocaleString()}</p>
          </div>
        </div>
      `).join("");

      return `
        <div class="order-card" style="background: white; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.02); padding: 24px; margin-bottom: 24px; border: 1px solid rgba(124, 58, 237, 0.08);">
          
          <!-- Top Row -->
          <div class="order-top-row" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; padding-bottom: 16px; margin-bottom: 16px; border-bottom: 1px solid #f1f5f9;">
            
            <div style="display: flex; align-items: center; gap: 8px; color: #334155;">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              <span style="font-size: 0.9rem; font-weight: 600;">Placed on ${orderDate}</span>
            </div>
            
            <div style="font-size: 0.9rem; font-weight: 700; color: #6d28d9; background: rgba(109, 40, 217, 0.06); padding: 4px 10px; border-radius: 6px;">
              REF: TM-${order.id}
            </div>
            
            <div style="font-size: 0.95rem; font-weight: 600; color: #334155;">
              Total Payable: <span style="color: #ff6a00; font-weight: 800; font-size: 1.1rem;">₹${parseFloat(order.total_amount).toLocaleString()}</span>
            </div>
            
          </div>

          <!-- Products Section -->
          <div class="order-products" style="margin-bottom: 16px;">
            ${productsHtml}
          </div>

          <!-- Tracking Section -->
          ${trackingHtml}

        </div>
      `;
    }).join("");

  } catch (error) {
    ordersContainer.innerHTML = `
      <div class="empty-message" style="text-align: center; padding: 40px; font-size: 1.1rem; color: #64748b;">
        Failed to load orders. Please try refreshing.
      </div>
    `;
  }
});
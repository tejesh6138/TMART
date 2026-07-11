const API_BASE_URL = "https://tezmart-backend.onrender.com/api";


function getLoggedInUser() {
  return JSON.parse(localStorage.getItem("loggedInUser")) || null;
}


function setLoggedInUser(user) {
  localStorage.setItem(
    "loggedInUser",
    JSON.stringify(user)
  );
}


function logoutUser() {
  localStorage.removeItem("loggedInUser");

  window.location.href = "login.html";
}


function updateCartCount(count = null) {

  const cartCountElements =
    document.querySelectorAll("#cartCount");


  if (count !== null) {

    cartCountElements.forEach((el) => {
      el.textContent = count;
    });

    return;
  }


  const user = getLoggedInUser();


  if (!user) {

    cartCountElements.forEach((el) => {
      el.textContent = 0;
    });

    return;
  }


  fetch(
    `${API_BASE_URL}/cart/?user_id=${user.id}`
  )

    .then((res) => res.json())

    .then((data) => {

      const total = Array.isArray(data)

        ? data.reduce(
            (sum, item) =>
              sum + item.quantity,
            0
          )

        : 0;


      cartCountElements.forEach((el) => {

        el.textContent = total;

      });

    })

    .catch(() => {

      cartCountElements.forEach((el) => {

        el.textContent = 0;

      });

    });

}


async function fetchProducts() {

  const response = await fetch(
    `${API_BASE_URL}/store/products/`
  );


  if (!response.ok) {

    throw new Error(
      "Failed to fetch products"
    );

  }


  return await response.json();

}


async function fetchProductById(id) {

  const response = await fetch(
    `${API_BASE_URL}/store/products/${id}/`
  );


  if (!response.ok) {

    throw new Error(
      "Failed to fetch product details"
    );

  }


  return await response.json();

}


async function addToCart(productId, qty = 1) {

  const user = getLoggedInUser();


  if (!user) {

    alert(
      "Please login first to add items to cart."
    );

    window.location.href = "login.html";

    return;
  }


  const response = await fetch(
    `${API_BASE_URL}/cart/`,
    {

      method: "POST",

      headers: {

        "Content-Type": "application/json"

      },

      body: JSON.stringify({

        user_id: user.id,

        product_id: productId,

        quantity: qty

      })

    }
  );


  if (!response.ok) {

    throw new Error(
      "Failed to add product to cart"
    );

  }


  alert(
    "Product added to cart successfully"
  );


  updateCartCount();

}


function setupMenuToggle() {

  const menuToggle =
    document.getElementById("menuToggle");


  const sidebar =
    document.getElementById("tezSidebar");


  const overlay =
    document.getElementById("menuOverlay");


  const closeBtn =
    document.getElementById("sidebarClose");


  if (
    !menuToggle ||
    !sidebar ||
    !overlay
  ) {

    return;

  }


  function openMenu() {

    sidebar.classList.add("active");

    overlay.classList.add("active");

    menuToggle.classList.add("active");


    menuToggle.setAttribute(
      "aria-expanded",
      "true"
    );


    sidebar.setAttribute(
      "aria-hidden",
      "false"
    );


    document.body.style.overflow =
      "hidden";

  }


  function closeMenu() {

    sidebar.classList.remove("active");

    overlay.classList.remove("active");

    menuToggle.classList.remove("active");


    menuToggle.setAttribute(
      "aria-expanded",
      "false"
    );


    sidebar.setAttribute(
      "aria-hidden",
      "true"
    );


    document.body.style.overflow = "";

  }


  menuToggle.addEventListener(
    "click",
    function () {

      if (
        sidebar.classList.contains("active")
      ) {

        closeMenu();

      } else {

        openMenu();

      }

    }
  );


  overlay.addEventListener(
    "click",
    closeMenu
  );


  if (closeBtn) {

    closeBtn.addEventListener(
      "click",
      closeMenu
    );

  }


  document.addEventListener(
    "keydown",
    function (event) {

      if (event.key === "Escape") {

        closeMenu();

      }

    }
  );

}


function renderNavbarAuth() {

  const authLink =
    document.getElementById("authNavLink");


  if (!authLink) {

    return;

  }


  const user = getLoggedInUser();


  if (user) {

    authLink.href = "#";


    authLink.innerHTML =
      "<span>Logout</span>";


    authLink.title =
      `Logged in as ${user.username}`;


    authLink.addEventListener(
      "click",
      function (event) {

        event.preventDefault();

        logoutUser();

      }
    );

  } else {

    authLink.href = "login.html";


    authLink.innerHTML =
      "<span>Login</span>";

  }

}


async function renderFeaturedProducts() {

  const featuredContainer =
    document.getElementById(
      "featuredProducts"
    );


  if (!featuredContainer) {

    return;

  }


  try {

    const products =
      await fetchProducts();


    const featured =
      products.slice(0, 4);


    featuredContainer.innerHTML =
      featured.map((product) => `

        <div class="product-card">

          <div class="product-image">

            ${
              product.image

                ? `
                  <img
                    src="${product.image}"
                    alt="${product.name}"
                    style="
                      width:100%;
                      height:100%;
                      object-fit:cover;
                      border-radius:12px;
                    "
                  >
                `

                : product.name
            }

          </div>


          <h3>
            ${product.name}
          </h3>


          <p class="category">

            ${
              product.category?.name ||
              "Category"
            }

          </p>


          <div class="product-bottom">

            <span class="price">

              ₹${product.price}

            </span>


            <a
              href="product.html?id=${product.id}"
              class="btn btn-sm"
            >

              View

            </a>

          </div>

        </div>

      `).join("");


  } catch (error) {

    featuredContainer.innerHTML = `

      <div class="empty-message">

        Failed to load featured products.

      </div>

    `;

  }

}


document.addEventListener(
  "DOMContentLoaded",
  function () {

    setupMenuToggle();

    renderNavbarAuth();

    renderFeaturedProducts();

    updateCartCount();

  }
);
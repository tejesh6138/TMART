# Tmart E-Commerce Website

Tmart is a full-stack e-commerce website built for learning and portfolio purposes using **HTML, CSS, JavaScript, Django, Django REST Framework, and PostgreSQL**.

This project includes:

- A **premium modern frontend UI**
- A **Django + DRF backend**
- **PostgreSQL database integration**
- **Cart, Wishlist, Orders, Authentication**
- Frontend and backend **API integration**
- A structure that can be extended to **JWT auth, payment gateway integration, and deployment**

---

# Tech Stack

## Frontend
- HTML5
- CSS3
- JavaScript (Vanilla JS)

## Backend
- Python
- Django
- Django REST Framework

## Database
- PostgreSQL

## Tools
- VS Code
- Git / GitHub
- Postman (optional for API testing)

---

# Project Structure

## Frontend Structure

```bash
ecommerce-frontend/
│
├── index.html
├── products.html
├── product.html
├── cart.html
├── checkout.html
├── login.html
├── register.html
├── orders.html
├── wishlist.html
│
├── css/
│   └── style.css
│
├── js/
│   ├── app.js
│   ├── auth.js
│   ├── products.js
│   ├── product-detail.js
│   ├── cart.js
│   ├── checkout.js
│   ├── orders.js
│   └── wishlist.js
│
└── images/
```

## Backend Structure

```bash
shopsphere_backend/
│
├── manage.py
├── requirements.txt
│
├── shopsphere/
│   ├── settings.py
│   ├── urls.py
│   ├── asgi.py
│   └── wsgi.py
│
├── accounts/
├── store/
├── cart/
├── orders/
└── wishlist/
```

---

# Features

## User Features
- User registration
- User login
- Product browsing
- Product detail page
- Add to cart
- Update cart quantity
- Remove cart item
- Wishlist management
- Checkout form
- Place order
- View order history

## Admin Features
- Manage categories
- Manage products
- Manage orders
- Manage users using Django admin

---

# Backend Apps Overview

## 1. accounts
Handles:
- Custom user model
- Registration
- Login
- User profile

## 2. store
Handles:
- Categories
- Products
- Product listing
- Product detail API

## 3. cart
Handles:
- Add products to cart
- Update quantity
- Remove cart item
- Fetch user cart

## 4. orders
Handles:
- Create order
- Store order items
- Fetch order history

## 5. wishlist
Handles:
- Add to wishlist
- Remove from wishlist
- Fetch wishlist items

---

# Setup Instructions

## 1) Clone the project

```bash
git clone <your-repository-url>
cd your-project-folder
```

---

# Backend Setup

## 2) Create and activate virtual environment

### Windows
```bash
python -m venv venv
venv\Scripts\activate
```

### Mac/Linux
```bash
python3 -m venv venv
source venv/bin/activate
```

---

## 3) Install dependencies

```bash
pip install -r requirements.txt
```

---

## 4) PostgreSQL Database Setup

Create a PostgreSQL database:

- Database Name: `shopsphere_db`
- Username: `postgres`
- Password: `your_password`
- Host: `localhost`
- Port: `5432`

Update `shopsphere/settings.py`:

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'shopsphere_db',
        'USER': 'postgres',
        'PASSWORD': 'your_password',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
```

---

## 5) Run migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

---

## 6) Create superuser

```bash
python manage.py createsuperuser
```

---

## 7) Start backend server

```bash
python manage.py runserver
```

Backend runs at:

```bash
http://127.0.0.1:8000/
```

Admin panel:

```bash
http://127.0.0.1:8000/admin/
```

---

# Frontend Setup

## 8) Run frontend

Open the frontend folder in VS Code and use **Live Server**.

Recommended:
- Install **Live Server** extension
- Open `index.html`
- Right click → **Open with Live Server**

Frontend usually runs at:

```bash
http://127.0.0.1:5500/
```

or depending on your setup.

---

# API Endpoints

## Accounts
- `POST /api/accounts/register/` → Register user
- `POST /api/accounts/login/` → Login user
- `GET /api/accounts/profile/<id>/` → Get user profile

## Store
- `GET /api/store/categories/` → List categories
- `POST /api/store/categories/` → Create category
- `GET /api/store/products/` → List products
- `POST /api/store/products/` → Create product
- `GET /api/store/products/<id>/` → Product detail
- `PUT /api/store/products/<id>/` → Update product
- `DELETE /api/store/products/<id>/` → Delete product

## Cart
- `GET /api/cart/?user_id=1` → Fetch cart items
- `POST /api/cart/` → Add to cart
- `PUT /api/cart/<id>/` → Update cart item
- `DELETE /api/cart/<id>/` → Delete cart item

## Orders
- `GET /api/orders/?user_id=1` → Fetch user orders
- `POST /api/orders/` → Place order
- `GET /api/orders/<id>/` → Order detail

## Wishlist
- `GET /api/wishlist/?user_id=1` → Fetch wishlist
- `POST /api/wishlist/` → Add to wishlist
- `DELETE /api/wishlist/<id>/` → Remove wishlist item

---

# Frontend–Backend Flow

## Authentication
- `register.html` → calls `/api/accounts/register/`
- `login.html` → calls `/api/accounts/login/`

## Product Pages
- `products.html` → loads products from `/api/store/products/`
- `product.html` → loads a single product from `/api/store/products/<id>/`

## Cart
- Add to cart → `POST /api/cart/`
- Cart page → `GET /api/cart/?user_id=<id>`

## Checkout
- Checkout page sends order data to `/api/orders/`
- After successful order placement, cart items are deleted

## Orders
- Orders page fetches orders from `/api/orders/?user_id=<id>`

## Wishlist
- Wishlist page fetches items from `/api/wishlist/?user_id=<id>`

---

# Current Project Status

## Completed
- Frontend pages
- Django backend
- REST APIs
- PostgreSQL integration
- Frontend + backend API integration
- Tmart branding/logo/header updates

## Recommended Next Improvements
- JWT authentication using `djangorestframework-simplejwt`
- User-based authentication without passing `user_id` manually
- Product image uploads using `ImageField`
- Search and filter from backend
- Payment gateway integration
- Deployment setup

---

# Sample Test Flow

1. Register a new user
2. Login using username and password
3. Create categories in admin panel
4. Create products in admin panel
5. Open frontend home page
6. Browse products
7. Add product to cart
8. Checkout and place order
9. View orders
10. Add/remove wishlist items

---

# Common Issues

## 1. CORS issue
Make sure `django-cors-headers` is installed and enabled in `settings.py`.

## 2. PostgreSQL connection issue
Verify:
- database name
- username
- password
- PostgreSQL service is running

## 3. Frontend not loading API data
Check:
- Django server is running on port 8000
- `API_BASE_URL` in `js/app.js` is correct

---

# Future Enhancements

- JWT authentication
- Role-based admin/customer flows
- Coupon system
- Product reviews and ratings
- Order tracking timeline
- Payment integration (Razorpay / Stripe)
- Deployment on Render / Railway / VPS
- Frontend hosting on Netlify / Vercel

---

# Author

**Tejesh**  
B.Tech CSE student  
Tmart E-Commerce Full Stack Project

---

# License

This project is for **learning, academic use, portfolio, and personal development**.

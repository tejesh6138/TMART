from django.urls import path
from .views import CartItemListCreateView, CartItemDetailView

urlpatterns = [
    path('', CartItemListCreateView.as_view(), name='cart-list-create'),
    path('<int:pk>/', CartItemDetailView.as_view(), name='cart-detail'),
]
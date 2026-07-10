from rest_framework import generics
from .models import CartItem
from .serializers import CartItemSerializer


class CartItemListCreateView(generics.ListCreateAPIView):
    serializer_class = CartItemSerializer

    def get_queryset(self):
        user_id = self.request.query_params.get('user_id')
        if user_id:
            return CartItem.objects.filter(user_id=user_id).order_by('-added_at')
        return CartItem.objects.none()


class CartItemDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = CartItem.objects.all()
    serializer_class = CartItemSerializer
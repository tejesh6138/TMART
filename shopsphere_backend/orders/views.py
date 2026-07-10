from rest_framework import generics
from .models import Order
from .serializers import OrderSerializer

class OrderListCreateView(generics.ListCreateAPIView):
    serializer_class = OrderSerializer

    def get_queryset(self):
        user_id = self.request.query_params.get('user_id')
        if user_id:
            return Order.objects.filter(user_id=user_id).order_by('-created_at')
        return Order.objects.all().order_by('-created_at')


class OrderDetailView(generics.RetrieveAPIView):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
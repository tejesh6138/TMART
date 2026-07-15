from rest_framework import generics
from .models import WishlistItem
from .serializers import WishlistItemSerializer

class WishlistListCreateView(generics.ListCreateAPIView):
    serializer_class = WishlistItemSerializer

    def get_queryset(self):
        user = self.request.user
        if user and user.is_authenticated:
            return WishlistItem.objects.filter(user=user).order_by('-added_at')
        user_id = self.request.query_params.get('user_id')
        if user_id:
            return WishlistItem.objects.filter(user_id=user_id).order_by('-added_at')
        return WishlistItem.objects.none()


class WishlistDetailView(generics.RetrieveDestroyAPIView):
    queryset = WishlistItem.objects.all()
    serializer_class = WishlistItemSerializer
from rest_framework import serializers
from .models import WishlistItem
from accounts.models import User
from store.models import Product
from store.serializers import ProductSerializer


class WishlistItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    user_id = serializers.IntegerField(write_only=True)
    product_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = WishlistItem
        fields = ['id', 'user_id', 'product_id', 'product', 'added_at']

    def create(self, validated_data):
        request = self.context.get('request')
        if request and request.user and request.user.is_authenticated:
            user = request.user
            validated_data.pop('user_id', None)
        else:
            user_id = validated_data.pop('user_id', None)
            user = User.objects.get(id=user_id) if user_id else None

        product_id = validated_data.pop('product_id')
        product = Product.objects.get(id=product_id)

        wishlist_item, created = WishlistItem.objects.get_or_create(
            user=user,
            product=product
        )
        return wishlist_item
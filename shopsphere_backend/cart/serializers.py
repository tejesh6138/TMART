from rest_framework import serializers
from .models import CartItem
from store.serializers import ProductSerializer
from accounts.models import User
from store.models import Product


class CartItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    user_id = serializers.IntegerField(write_only=True)
    product_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = CartItem
        fields = ['id', 'user_id', 'product_id', 'product', 'quantity', 'added_at']

    def create(self, validated_data):
        user = User.objects.get(id=validated_data.pop('user_id'))
        product = Product.objects.get(id=validated_data.pop('product_id'))
        quantity = validated_data.get('quantity', 1)

        cart_item, created = CartItem.objects.get_or_create(
            user=user,
            product=product,
            defaults={'quantity': quantity}
        )

        if not created:
            cart_item.quantity += quantity
            cart_item.save()

        return cart_item

    def update(self, instance, validated_data):
        quantity = validated_data.get('quantity', instance.quantity)
        instance.quantity = quantity
        instance.save()
        return instance
from rest_framework import serializers
from .models import Order, OrderItem
from accounts.models import User
from store.models import Product


class OrderItemReadSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_image = serializers.CharField(source='product.image', read_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_name', 'product_image', 'quantity', 'price']


class OrderItemWriteSerializer(serializers.Serializer):
    product = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1)
    price = serializers.DecimalField(max_digits=10, decimal_places=2)


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemReadSerializer(many=True, read_only=True)
    order_items = OrderItemWriteSerializer(many=True, write_only=True)
    user_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Order
        fields = [
            'id',
            'user_id',
            'full_name',
            'email',
            'phone',
            'address',
            'city',
            'pincode',
            'payment_method',
            'status',
            'total_amount',
            'created_at',
            'items',
            'order_items'
        ]
        read_only_fields = ['status', 'total_amount', 'created_at']

    def create(self, validated_data):
        order_items_data = validated_data.pop('order_items')
        user_id = validated_data.pop('user_id')

        user = User.objects.get(id=user_id)

        order = Order.objects.create(user=user, **validated_data)

        total = 0
        for item in order_items_data:
            product = Product.objects.get(id=item['product'])
            quantity = item['quantity']
            price = item['price']

            OrderItem.objects.create(
                order=order,
                product=product,
                quantity=quantity,
                price=price
            )

            total += float(price) * quantity

        order.total_amount = total
        order.save()
        return order
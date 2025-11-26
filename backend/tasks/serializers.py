from rest_framework import serializers

class TaskSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=200)
    due_date = serializers.DateField()
    estimated_hours = serializers.FloatField(min_value=0.1)
    importance = serializers.IntegerField(min_value=1, max_value=10)
    dependencies = serializers.ListField(
        child=serializers.IntegerField(min_value=1),
        required=False,
        default=list
    )
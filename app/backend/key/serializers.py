from rest_framework import serializers
from .models import Students, AttendanceItems, Activity, Users

class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        fields = (
            'first_name',
            'last_name',
            'id',
            'first_attendance',
            'number_visits',
        )
        model = Students

class AttendanceItemSerializer(serializers.ModelSerializer):
    class Meta:
        fields = (
            'student_id',
            'date',
            'time',
            'activity_id',
            'id',
        )
        model = AttendanceItems

class ActivitySerializer(serializers.ModelSerializer):
    class Meta:
        fields = (
            'name',
            'ordering',
            'is_showing',
            'activity_id'
        )
        model = Activity

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        fields = (
            'username',
        )
        model = Users
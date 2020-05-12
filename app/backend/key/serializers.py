from rest_framework import serializers
from rest_framework_jwt.settings import api_settings
from django.contrib.auth.models import User, Group, Permission
from .models import Volunteers, VolunteerAttendanceItems, Students, AttendanceItems, Activity, Reports, StudentInfo, StudentColumn, StudentSuggestions, CitySpanStudents

class VolunteerSerializer(serializers.ModelSerializer):
    class Meta:
        fields = (
            'first_name',
            'last_name',
            'id',
        )
        model = Volunteers

class VolunteerAttendanceItemSerializer(serializers.ModelSerializer):
    class Meta:
        fields = (
            'volunteer_id',
            'date',
            'check_in',
            'check_out',
            'id',
            'checked_out',
            'location',
            'description',
        )
        model = VolunteerAttendanceItems

class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        fields = (
            'first_name',
            'last_name',
            'id',
            'student_key',
        )
        model = Students
        
class StudentInfoSerializer(serializers.ModelSerializer):
    class Meta:
        fields = (
            'student_id',
            'info_id',
            'int_value',
            'str_value',
            'bool_value',
            'date_value',
            'time_value',
            'id',
            'photo_value',
            'photo_url'
        )
        model = StudentInfo
      
class StudentColumnSerializer(serializers.ModelSerializer):
    class Meta:
        fields = (
            'info_id',
            'is_showing',
            'quick_add',
            'name',
            'type',
            'defined_options'
        )
        model = StudentColumn

class AttendanceItemSerializer(serializers.ModelSerializer):
    class Meta:
        fields = (
            'student_id',
            'date',
            'time',
            'activity_id',
            'id',
            'str_value',
            'num_value'
        )
        model = AttendanceItems

class PermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Permission
        fields = ('id', 'name', 'content_type_id', 'codename')

class GroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = ('id', 'name', 'permissions',)

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('username', 'first_name', 'last_name', 'last_login', 'is_active', 'id', 'groups')

class UserSerializerEdit(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        groups = validated_data.pop('groups', None)
        instance = self.Meta.model(**validated_data)
        if password is not None:
            instance.set_password(password)
        instance.save()
        if groups is not None:
            instance.groups.set(groups)
        instance.save()
        return instance

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        if password is not None:
            instance.set_password(password)
        instance.is_active = validated_data.pop('is_active', instance.is_active)
        instance.last_name = validated_data.pop('last_name', instance.last_name)
        instance.first_name = validated_data.pop('first_name', instance.first_name)
        instance.groups.set(validated_data.pop('groups', instance.groups))
        instance.save()
        return instance
        
    class Meta:
        model = User
        fields = ('username', 'password', 'first_name', 'last_name', 'last_login', 'is_active', 'id', 'groups',)

class ActivitySerializer(serializers.ModelSerializer):
    class Meta:
        fields = (
            'name',
            'ordering',
            'is_showing',
            'activity_id',
            'type'
        )
        model = Activity

class ReportSerializer(serializers.ModelSerializer):
    class Meta:
        fields = (
            'date',
            'daily_visits',
        )
        model = Reports

class SuggestionSerializer(serializers.ModelSerializer):
    class Meta:
        fields = (
            'student_id',
            'match_name',
            'match_key'
        )
        model = StudentSuggestions

class CitySpanStudentSerializer(serializers.ModelSerializer):

    class Meta:
        fields = (
            'first_name',
            'last_name',
            'student_key'
        )
        model = CitySpanStudents
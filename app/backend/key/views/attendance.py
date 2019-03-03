from django.core import serializers
from ..models import AttendanceItems, Students, Activity
from ..serializers import AttendanceItemSerializer
from ..helpers import isValidDateTime, isValidTime, getCurrentDate
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db import transaction
from django.db import IntegrityError
from django.contrib.auth.models import User

class Attendance(APIView):

    # Validate input for the.query_params request of this endpoint - if there are parameters that we care 
    # about, they should be valid dates that won't make django yell at me.
    def validateGet(self, request):
        if 'day' in request.query_params and not isValidDateTime(request.query_params['day']):
            return False
        elif 'startdate' in request.query_params and not isValidDateTime(request.query_params['startdate']):
            return False
        elif 'enddate' in request.query_params and not isValidDateTime(request.query_params['enddate']):
            return False
        return True

    # Validate input for the DELETE request of this endpoint - should reference a valid key
    def validateDelete(self, request):
        if not 'key' in request.query_params:
            return False
        try:
            AttendanceItems.objects.get(pk=request.query_params['key'])
        except:
            return False
        return True

    # Validate input for POST request of this endpoint - checks student_id and activity_id are present and valid
    # If timestamps are provided, validates they are in the correct format
    # Makes sure that a duplicate attendance item doesn't exist.
    def validatePost(self, request):
        if not 'student_id' in request.data or not 'activity_id' in request.data:
            return False
        try:
            Students.objects.get(id=request.data['student_id'])
        except:
            return False
        try:
            Activity.objects.get(activity_id=request.data['activity_id'])
        except:
            return False
        try: 
            if 'date' in request.data:
                date = request.data['date']
            else:
                date = getCurrentDate()
            if len(AttendanceItems.objects.filter(activity_id=request.data['activity_id']).filter(date=date).filter(student_id=request.data['student_id'])) > 0:
                return False
        except: 
            return True

        if 'date' in request.data and request.data['date'] != '' and not isValidDateTime(request.data['date']):
            return False
        if 'time' in request.data and request.data['date'] != '' and not isValidTime(request.data['time']):
            return False
        return True

    def get(self, request):
        if not request.user.has_perm('key.view_attendanceitems'):
            return Response({'error':'You are not authorized to view attendance items.'}, status='401')
        if not self.validateGet(request):
            return Response({'error':'Invalid Parameters'}, status='400')

        items = AttendanceItems.objects.all()
        if 'day' in request.query_params:
            items = items.filter(date=request.query_params['day'])
        if 'startdate' in request.query_params:
            items = items.filter(date__gte=request.query_params['startdate'])
        if 'enddate' in request.query_params:
            items = items.filter(date__lte=request.query_params['enddate'])

        serializer = AttendanceItemSerializer(items, many=True)
        return Response(serializer.data, content_type='application/json')

    def delete(self, request):
        if not request.user.has_perm('key.delete_attendanceitems'):
            return Response({'error':'You are not authorized to delete attendance items.'}, status='401')
        if not self.validateDelete(request):
            return Response({'error':'Invalid Parameters'}, status='400')

        attendanceItem = AttendanceItems.objects.get(pk=request.query_params['key'])
        attendanceItem.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    def post(self, request):
        if not request.user.has_perm('key.add_attendanceitems'):
            return Response({'error':'You are not authorized to create attendance items.'}, status='401')
        if not self.validatePost(request):
            return Response({'error':'Invalid Parameters'}, status='400')
        
        serializer = AttendanceItemSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
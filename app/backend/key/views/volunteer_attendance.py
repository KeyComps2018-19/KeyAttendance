from django.core import serializers
from ..models import VolunteerAttendanceItems, Volunteers
from ..serializers import VolunteerAttendanceItemSerializer
from ..helpers import isValidDateTime, isValidTime, getCurrentDate
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db import transaction
from django.db import IntegrityError
from django.contrib.auth.models import User
import json

class VolunteerAttendance(APIView):
    # Create new volunteer attendance item 
    def post(self, request):
        if not request.user.has_perm('key.add_volunteerattendanceitems'):
            print("401 Unauthorized: POST /api/volunteer_attendance/")
            return Response({'error':'You are not authorized to create volunteer attendance items.'}, status='401')
        if not self.validatePost(request):
            print("400 Bad Request: POST /api/volunteer_attendance/")
            print(json.dumps(request.data))
            return Response({'error':'Invalid Parameters'}, status='400')
        
        serializer = VolunteerAttendanceItemSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    # Delete volunteer attendance item
    def delete(self, request):
        if not request.user.has_perm('key.delete_volunteerattendanceitems'):
            print("401 Unauthorized: DELETE /api/volunteer_attendance/")
            return Response({'error':'You are not authorized to delete volunteer attendance items.'}, status='401')
        if not self.validateDelete(request):
            print("400 Bad Request: DELETE /api/volunteer_attendance/")
            return Response({'error':'Invalid Parameters'}, status='400')

        attendanceItem = VolunteerAttendanceItems.objects.get(pk=request.query_params['key'])
        attendanceItem.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    # Get volunteer attendance item
    def get(self, request):
        if not request.user.has_perm('key.view_volunteerattendanceitems'):
            print("401 Unauthorized: GET /api/volunteer_attendance/")
            return Response({'error':'You are not authorized to view volunteer attendance items.'}, status='401')
        if not self.validateGet(request):
            print("400 Bad Request: GET /api/volunteer_attendance/")
            return Response({'error':'Invalid Parameters'}, status='400')

        items = VolunteerAttendanceItems.objects.all()
        if 'day' in request.query_params:
            items = items.filter(date=request.query_params['day'])
        if 'startdate' in request.query_params:
            items = items.filter(date__gte=request.query_params['startdate'])
        if 'enddate' in request.query_params:
            items = items.filter(date__lte=request.query_params['enddate'])

        serializer = VolunteerAttendanceItemSerializer(items, many=True)
        return Response(serializer.data, content_type='application/json')

 

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
        
    #test comment

    # Validate input for the DELETE request of this endpoint - should reference a valid key
    def validateDelete(self, request):
        if not 'key' in request.query_params:
            return False
        try:
            VolunteerAttendanceItems.objects.get(pk=request.query_params['key'])
        except:
            return False
        return True

    # Validate input for POST request of this endpoint - checks student_id and activity_id are present and valid
    # If timestamps are provided, validates they are in the correct format
    # Makes sure that a duplicate attendance item doesn't exist.
    def validatePost(self, request):
        if not 'volunteer_id' in request.data:
            return False
        try:
            Volunteers.objects.get(id=request.data['volunteer_id'])
        except:
            return False
        try: 
            if 'date' in request.data:
                date = request.data['date']
            else:
                date = getCurrentDate()
            if len(VolunteerAttendanceItems.objects.filter(date=date).filter(volunteer_id=request.data['volunteer_id'])) > 0:
                return False
        except: 
            return True

        if 'date' in request.data and request.data['date'] != '' and not isValidDateTime(request.data['date']):
            return False
        if 'check_in' in request.data and request.data['date'] != '' and not isValidTime(request.data['check_in']):
            return False
        return True

    
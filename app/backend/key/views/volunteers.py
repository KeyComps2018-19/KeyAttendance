from django.core import serializers
from ..models import Volunteers as VolunteerModel
from ..models import VolunteerAttendanceItems
from ..serializers import VolunteerSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import time
import json

class Volunteers(APIView):
    # Removing an existing volunteer 
    def delete(self, request):
        if not request.user.has_perm('key.delete_volunteers'):
            print("401 Unauthorized: DELETE /api/volunteers/")
            return Response({'error':'You are not authorized to delete volunteers.'}, status='401')
        if not self.validateDelete(request):
            print("400 Bad Request: DELETE /api/volunteers/")
            print(json.dumps(request.data))
            return Response({'error':'Invalid Parameters'}, status='400')
        id = request.data['id']
        volunteer = VolunteerModel.objects.get(pk=id)
        volunteer_attendance_items = VolunteerAttendanceItems.objects.filter(volunteer_id=id)
        for attendance_item in volunteer_attendance_items:
            attendance_item.delete()
        volunteer.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    # Update an existing volunteer
    def patch(self, request):
        if not request.user.has_perm('key.change_volunteers'):
            print("401 Unauthorized: PATCH /api/volunteers/")
            return Response({'error':'You are not authorized to update volunteer.'}, status='401')
        if not self.validatePatch(request):
            print("400 Bad Request: PATCH /api/volunteers/ - We caught the error.")
            print(json.dumps(request.data))
            return Response({'error':'Invalid Parameters'}, status='400')
        obj = VolunteerModel.objects.get(pk=request.data['id'])
        serializer = VolunteerSerializer(obj, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            print("SUCCESSFULLY PATCHED VOLUNTEER")
            print(json.dumps(request.data))
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        print("400 Bad Request: PATCH /api/volunteers/ - Django caught the error.")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # Get existing student data
    def get(self, request):
        if not request.user.has_perm('key.view_volunteers') and not request.user.has_perm('key.view_volunteerattendanceitems'):
            print("401 Unauthorized: GET /api/volunteers/")
            return Response({'error':'You are not authorized to view volunteers.'}, status='401')
        if not self.validateGet(request):
            print("400 Bad Request: GET /api/volunteers/")
            return Response({'error':'Invalid Parameters'}, status='400')
        if 'id' in request.query_params:
            volunteer = VolunteerModel.objects.get(pk=request.query_params['id'])
            serializer = VolunteerSerializer(volunteer)
        else:
            volunteers = VolunteerModel.objects.all()
            serializer = VolunteerSerializer(volunteers, many=True)
        
        return Response(serializer.data, content_type='application/json')
    # Create a new volunteer
    def post(self, request):
        if not request.user.has_perm('key.add_volunteers'):
            print("401 Unauthorized: POST /api/volunteers/")
            return Response({'error':'You are not authorized to create volunteers.'}, status='401')

        serializer = VolunteerSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            print("SUCCESSFULLY CREATED VOLUNTEER")
            print(json.dumps(request.data))
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        print("400 Bad Request: POST /api/volunteers/")
        print(json.dumps(request.data))
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def validateGet(self, request):
        if 'id' in request.query_params:
            try:
                VolunteerModel.objects.get(pk=int(request.query_params['id']))
            except Exception as e:
                return False
        return True

    def validatePatch(self, request):
        try:
            VolunteerModel.objects.get(pk=request.data['id'])
        except:
            return False
        return True
    
    # Validate input for the DELETE request of this endpoint - should reference a valid key
    def validateDelete(self, request):
        try:
            VolunteerModel.objects.get(pk=request.data['id'])
        except:
            return False
        return True
      
    

  
    
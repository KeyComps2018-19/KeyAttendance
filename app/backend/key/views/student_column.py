from django.core import serializers
from ..models import StudentColumn as StudentColumnModel
from ..serializers import StudentColumnSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import time


class StudentColumn(APIView):

    def validateGet(self, request):
        if 'info_id' in request.query_params:
            try:
                StudentColumnModel.objects.get(pk=int(request.query_params['info_id']))
            except Exception as e:
                return False
        return True
      
    def validatePatch(self, request):
        try:
            StudentColumnModel.objects.get(pk=request.data['info_id'])
        except:
            return False
        return True

    # Get existing column data
    def get(self, request):
        if not self.validateGet(request):
            return Response({'error':'Invalid Parameters'}, status='400')
  
        students = StudentColumnModel.objects.all()
        if 'quick_add' in request.query_params and request.query_params['quick_add'] == 'True':
            students = students.filter(quick_add=True)
        serializer = StudentColumnSerializer(students, many=True)
        
        return Response(serializer.data, content_type='application/json')
      
    # Create a new column
    def post(self, request):
        serializer = StudentColumnSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # Update an existing column
    def patch(self, request):
        if not self.validatePatch(request):
            return Response({'error':'Invalid Paremeters'}, status='400')

        obj = StudentColumnModel.objects.get(pk=request.data['info_id'])
        serializer = StudentColumnSerializer(obj, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

from django.core import serializers
from ..models import StudentInfo as StudentInfoModel
from ..models import Students, StudentColumn
from ..serializers import StudentInfoSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import time


class StudentInfo(APIView):

    def validateGet(self, request):
        if 'student_id' in request.query_params:
            try:
                StudentInfoModel.objects.filter(student_id=int(request.query_params['student_id']))
            except:
                return False
        return True
      
    def validatePatch(self, request):
        try:
            StudentInfoModel.objects.get(pk=request.data['id'])
        except:
            return False
        return True

    def validateInfo(self, info):
        if not 'student_id' in info or not 'info_id' in info:
            return False
        try:
            Students.objects.get(pk=info['student_id'])
            StudentColumn.objects.get(pk=info['info_id'])
        except:
            return False
        return True

    def validatePost(self, request):
        if (isinstance(request.data, list)):
            for item in request.data:
                if (not self.validateInfo(item)):
                    return False
            return True
        else:
            return self.validateInfo(request.data)

    # Get existing student data
    def get(self, request):
        if not self.validateGet(request):
            return Response({'error':'Invalid Parameters'}, status='400')
        
        info = StudentInfoModel.objects.filter(student_id=request.query_params['student_id'])
        serializer = StudentInfoSerializer(info, many=True)
        
        return Response(serializer.data, content_type='application/json')
      
    # Create a new student
    def post(self, request):
        if not self.validatePost(request):
            return Response({'error':'Invalid Paremeters'}, status='400')
        is_many = True if isinstance(request.data, list) else False

        serializer = StudentInfoSerializer(data=request.data, many=is_many)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # Update an existing student
    def patch(self, request):
        if not self.validatePatch(request):
            return Response({'error':'Invalid Paremeters'}, status='400')

        obj = StudentInfoModel.objects.get(pk=request.data['id'])
        serializer = StudentInfoSerializer(obj, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

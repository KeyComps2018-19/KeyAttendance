from rest_framework import generics
from django.http import HttpResponse, JsonResponse
from django.views import View
from django.core import serializers
from ..models import Students, AttendanceItems
from ..serializers import StudentSerializer
from ..helpers import isValidDateTime

# Create your views here.
class ListStudents(generics.ListCreateAPIView):
	queryset = Students.objects.all()
	serializer_class = StudentSerializer

class DetailStudents(generics.RetrieveUpdateDestroyAPIView):
	queryset = Students.objects.all()
	serializer_class = StudentSerializer
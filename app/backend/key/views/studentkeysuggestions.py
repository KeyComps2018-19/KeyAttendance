from django.core import serializers
from ..models import Students as StudentModel
from ..models import StudentSuggestions, CitySpanStudents
from ..serializers import StudentSerializer, SuggestionSerializer, CitySpanStudentSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import time;

# Levenschtein implementation ruthlessly borrowed from https://www.python-course.eu/levenshtein_distance.php
def memoize(func):
    mem = {}
    def memoizer(*args, **kwargs):
        key = str(args) + str(kwargs)
        if key not in mem:
            mem[key] = func(*args, **kwargs)
        return mem[key]
    return memoizer

# This is fairly inefficient, but it works well for this purpose.
@memoize
def levenshtein(s, t):
    if s == "":
        return len(t)
    if t == "":
        return len(s)
    if s[-1] == t[-1]:
        cost = 0
    else:
        cost = 1
        
    res = min([levenshtein(s[:-1], t)+1,
            levenshtein(s, t[:-1])+1, 
            levenshtein(s[:-1], t[:-1]) + cost])
    return res

class StudentKeySuggestions(APIView):

    def validateGet(self, request, reqType):
        if reqType == 'student':
            if 'id' in request.query_params:
                try:
                    # There needs to be a matching student to get suggestions.
                    StudentModel.objects.get(pk=int(request.query_params['id'])) 
                except:
                    return False
            else:
                return False
        return True

    def get(self, request, reqType):
        if not request.user.has_perm('key.change_cityspanstudents'):
            return Response({'error':'You are not authorized to view student key suggestions.'}, status='401')
        if not self.validateGet(request, reqType):
            return Response({'error':'Invalid Parameters'}, status='400')

        if reqType == 'unmatchedstudents':
            students = StudentModel.objects.filter(student_key__exact = None)
            serializer = StudentSerializer(students, many=True)
            return Response(serializer.data, content_type='application/json')
        elif reqType == 'student':
            return self.suggestions(request)
        elif reqType == 'cityspanstudents':
            students = CitySpanStudents.objects.all()
            serializer = CitySpanStudentSerializer(students, many=True)
            return Response(serializer.data, content_type='application/json')
        else: # unknown request
            return Response({'error':'Not Found'}, status='404')
    
    def patch(self, request, reqType):
        if not request.user.has_perm('key.change_cityspanstudents'):
            return Response({'error':'You are not authorized to change student keys.'}, status='401')
        # as it turns out, django doesn't have a great way to bulk patch objects, especially when
        # we're updating based on first and last name instead of the primary key.
        # ...so we have to implement this ourselves
        if reqType == 'cityspanstudents':
            try:
                 # iterate over request.data
                for obj in request.data['students']:
                    # check to see if we have firstname/lastname match. if so, manually update the student key of that value
                    try: 
                        match = CitySpanStudents.objects.filter(first_name=obj['first_name']).get(last_name=obj['last_name'])
                        match.student_key = obj['student_key']
                        match.save()
                    except:  # else, create a new cityspanstudent.
                        serializer = CitySpanStudentSerializer(data=obj)
                        if serializer.is_valid():
                            serializer.save()
                        else:
                            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)     
                
                # If we got here, we succesfully updated the database. So we should wipe our existing suggestions as they're out of date.
                StudentSuggestions.objects.all().delete()
                return Response(status=status.HTTP_201_CREATED)   
            except:
                return Response({'error':'Invalid Body'}, status='400')
        else: # unknown request
            return Response({'error':'Not Found'}, status='404')

    def suggestions(self, request):
        suggestions = StudentSuggestions.objects.filter(student_id=request.query_params['id'])
        if suggestions.count() > 0:
            serializer = SuggestionSerializer(suggestions, many=True)
            return Response(serializer.data, content_type='application/json')
        else: # Generate our own suggestions
            student = StudentModel.objects.get(pk=int(request.query_params['id']))
            studentName = student.first_name + " " + student.last_name
            suggestions = []
            for knownStudent in CitySpanStudents.objects.all():
                if knownStudent.first_name == None or knownStudent.last_name == None:
                    continue
                knownStudentName = knownStudent.first_name + " " + knownStudent.last_name # TypeError: unsupported operand type(s) for +: 'NoneType' and 'str'
                result = {"name":knownStudentName, "studentKey": knownStudent.student_key, "editDistance":levenshtein(knownStudentName, studentName)}
                suggestions.append(result)
            suggestions = sorted(suggestions, key=lambda item: item["editDistance"])
            for obj in suggestions[0:3]:
                StudentSuggestions.objects.create(match_name = obj['name'], student_id = request.query_params['id'], match_key = obj['studentKey'])

            # Return the suggestions we just made.
            suggestions = StudentSuggestions.objects.filter(student_id=request.query_params['id'])
            serializer = SuggestionSerializer(suggestions, many=True)
            return Response(serializer.data, content_type='application/json')

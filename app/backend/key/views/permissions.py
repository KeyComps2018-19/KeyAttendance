from django.http import HttpResponseRedirect
from django.contrib.auth.models import Permission
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from ..serializers import PermissionSerializer
from django.db.models import Q
from django.contrib.contenttypes.models import ContentType

class Permissions(APIView):

    def get(self, request):
        if not request.user.has_perm('auth.view_group'):
            return Response({'error':'You are not authorized to view group permissions.'}, status='401')
        content_types = ContentType.objects.filter(Q(model='activity') | 
            Q(model='attendanceitems') | Q(model='studentcolumn') | Q(model='studentinfo') |
            Q(model = 'volunteers')|Q(model = 'volunteerattendanceitems') | Q(model='students') | 
            Q(model='group') | Q(model='reports') | Q(model='user') | Q(model='cityspanstudents'))
        permissionsList = []
        for content_type in content_types:
            permissions = Permission.objects.filter(content_type_id=content_type.id)
            permissions = permissions.filter(~Q(codename = 'view_activity') & ~Q(codename = 'delete_activity') & 
                ~Q(codename = 'change_attendanceitems') & ~Q(codename = 'change_volunteerattendanceitems') &
                ~Q(codename = 'delete_studentcolumn') & ~Q(codename = 'view_studentcolumn') &
                ~Q(codename = 'delete_studentinfo') & ~Q(codename = 'change_reports') & ~Q(codename = 'delete_reports') &
                ~Q(codename = 'add_reports') & ~Q(codename = 'add_cityspanstudents') & ~Q(codename = 'delete_cityspanstudents') & 
                ~Q(codename = 'view_cityspanstudents'))
            permissionsList.extend(list(permissions))
        serializer = PermissionSerializer(permissionsList, many=True)
        return Response(serializer.data, content_type='application/json')
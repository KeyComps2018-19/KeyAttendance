from django.urls import path, re_path
from key.views import volunteers, volunteer_attendance, attendance, students, activities, users, studentkeysuggestions, misc, reports, groups, permissions, student_info, student_column, history
from django.conf.urls.static import static
from django.conf import settings

urlpatterns = [
    path('activities/', activities.Activities.as_view()),
    path('volunteers/', volunteers.Volunteers.as_view()),
    path('volunteer_attendance/', volunteer_attendance.VolunteerAttendance.as_view()),
    path('students/', students.Students.as_view()),
    path('attendance/', attendance.Attendance.as_view()),
    path('users/', users.Users.as_view()),
    path('groups/', groups.Groups.as_view()),
    path('permissions/', permissions.Permissions.as_view()),
    path('history/', history.History.as_view()),
    path('student_info/', student_info.StudentInfo.as_view()),
    path('student_column/', student_column.StudentColumn.as_view()),
    re_path(r'^reports/(?P<vizType>\w*)/$', reports.Reports.as_view()),
    #above regex maps to: /api/reports/vizType/?arg1=blah&arg2=blah
    re_path(r'^suggestions/(?P<reqType>\w*)/$', studentkeysuggestions.StudentKeySuggestions.as_view())
]

if settings.DEBUG:
  urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

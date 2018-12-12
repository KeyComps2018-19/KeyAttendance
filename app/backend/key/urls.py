from django.urls import path
from key.security import setup
from key.views import attendance, students, activities, users, login

urlpatterns = [
    path('activities/', activities.Activities.as_view()),
    path('students/', students.Students.as_view()),
    path('attendance/', attendance.Attendance.as_view()),
    path('users/', users.UserView.as_view()),
    path('login/', login.Login.as_view()),
] 

setup()
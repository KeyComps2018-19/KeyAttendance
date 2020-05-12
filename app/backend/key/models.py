# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey has `on_delete` set to the desired behavior.
#   * Remove `managed = True` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from django.db import models
from .helpers import getCurrentDate, getCurrentTime
import datetime
from simple_history.models import HistoricalRecords



class Volunteers(models.Model):
    first_name = models.TextField(blank=True, null=True)
    last_name = models.TextField(blank=True, null=True)
    id = models.AutoField(blank=True, primary_key=True)
    history = HistoricalRecords()

    class Meta:
        managed = True
        db_table = 'volunteers'


# class VolunteerInfo(models.Model):
#     volunteer_id = models.IntegerField(blank=True, null=True)
#     total_hours = models.FloatField(blank =True, null = True)
#     birthday = models.DateField(blank=True, null=True)
#     photo_value = models.ImageField(blank=True, null=True, upload_to='profile_pictures/')
#     photo_url = models.TextField(blank=True, null=True)
#     history = HistoricalRecords()
#     class Meta: 
#         managed = True
#         db_table = 'volunteerinfo'

class VolunteerAttendanceItems(models.Model):
    volunteer_id = models.IntegerField(blank=True, null=True)
    date = models.DateField(default=getCurrentDate)
    check_in = models.TimeField(default=getCurrentTime)
    check_out = models.TimeField(default=getCurrentTime)
    checked_out = models.BooleanField(blank = True, null = True)
    location = models.CharField(max_length=255, blank=True, null=True)
    description = models.CharField(max_length=20000, blank=True, null=True)
    visit_number = models.IntegerField(blank=True, null=True)
    history = HistoricalRecords()
    id = models.AutoField(primary_key=True, unique=True)

    class Meta:
        managed = True
        db_table = 'volunteerattendance'

class Activity(models.Model):
    activity_id = models.AutoField(unique=True, primary_key=True)
    is_showing = models.BooleanField(blank=True, null=True)
    name = models.CharField(max_length=255, blank=True, null=True)
    type = models.CharField(max_length=255, blank=True, null=True)
    is_parent = models.BooleanField(blank=True, null=True)
    parent = models.CharField(max_length=255, blank=True, null=True)
    ordering = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = True
        db_table = 'activities'

class AttendanceItems(models.Model):
    student_id = models.IntegerField(blank=True, null=True)
    date = models.DateField(default=getCurrentDate)
    time = models.TimeField(default=getCurrentTime)
    activity_id = models.IntegerField(blank=True, null=True)
    visit_number = models.IntegerField(blank=True, null=True)
    str_value = models.TextField(blank=True, null=True)
    num_value = models.FloatField(blank=True, null=True)
    history = HistoricalRecords()
    id = models.AutoField(primary_key=True, unique=True)

    class Meta:
        managed = True
        db_table = 'dailyattendance'

class Reports(models.Model):
    student_id = models.IntegerField(blank=True, primary_key=True)
    date = models.DateField(default=getCurrentDate)
    time = models.TimeField(default=getCurrentTime)
    activity_id = models.IntegerField(blank=True, null=True)
    visit_number = models.IntegerField(blank=True, null=True)
    daily_visits = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = True
        db_table = 'dailyattendance'

class StudentColumn(models.Model):
    info_id = models.AutoField(unique=True, primary_key=True)
    is_showing = models.BooleanField(blank=True, null=True)
    quick_add = models.BooleanField(blank=True, null=True)
    name = models.CharField(max_length=255, blank=True, null=True)
    type = models.CharField(max_length=255, blank=True, null=True)
    defined_options = models.CharField(max_length=1000, blank=True, null=True)

    class Meta:
        managed = True
        db_table = 'studentcolumns'


class StudentInfo(models.Model):
    id = models.AutoField(primary_key=True, unique=True)
    student_id = models.IntegerField(blank=True, null=True)
    info_id = models.IntegerField(blank=True, null=True)
    int_value = models.IntegerField(blank=True, null=True)
    str_value = models.CharField(max_length=20000, blank=True, null=True)
    bool_value = models.BooleanField(blank=True, null=True)
    date_value = models.DateField(blank=True, null=True)
    time_value = models.TimeField(blank=True, null=True)
    photo_value = models.ImageField(blank=True, null=True, upload_to='profile_pictures/')
    photo_url = models.TextField(blank=True, null=True)
    history = HistoricalRecords()

    class Meta:
        managed = True
        db_table = 'studentinfo'    

class Students(models.Model):
    first_name = models.TextField(blank=True, null=True)
    last_name = models.TextField(blank=True, null=True)
    id = models.AutoField(blank=True, primary_key=True)
    student_key = models.TextField(blank=True, null=True)
    history = HistoricalRecords()
    #photo = models.ImageField(blank=True, null=True, upload_to='profile_photos/')

    class Meta:
        managed = True
        db_table = 'students'

class StudentSuggestions(models.Model):
    student_id = models.IntegerField(blank=True, null=True)
    match_name = models.TextField(blank=True, null=True)
    match_key = models.TextField(null=False)
    id = models.AutoField(primary_key=True, unique=True)

    class Meta:
        managed = True
        db_table = 'studentsuggestions'

# Stores student names and student keys imported from CitySpan
class CitySpanStudents(models.Model):
    first_name = models.TextField(blank=True, null=True)
    last_name = models.TextField(blank=True, null=True)
    student_key = models.TextField(null=False)
    id = models.AutoField(primary_key=True, unique=True)

    class Meta:
        managed = True
        db_table = 'cityspanstudents'
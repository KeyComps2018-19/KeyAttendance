# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey has `on_delete` set to the desired behavior.
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from django.db import models
from .helpers import getCurrentDate, getCurrentTime
import datetime


class Activity(models.Model):
    activity_id = models.AutoField(unique=True, primary_key=True)
    is_showing = models.BooleanField(blank=True, null=True)
    name = models.CharField(max_length=255, blank=True, null=True)
    type = models.CharField(max_length=255, blank=True, null=True)
    is_parent = models.BooleanField(blank=True, null=True)
    parent = models.CharField(max_length=255, blank=True, null=True)
    ordering = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'activities'


class Alert(models.Model):
    id = models.AutoField(unique=True, primary_key=True)
    alert = models.TextField(blank=True, null=True)
    completed = models.BooleanField(blank=True, null=True)
    student_id = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'alerts'


class AttendanceItems(models.Model):
    student_id = models.IntegerField(blank=True, null=True)
    date = models.DateField(default=getCurrentDate)
    time = models.TimeField(default=getCurrentTime)
    activity_id = models.IntegerField(blank=True, null=True)
    visit_number = models.IntegerField(blank=True, null=True)
    id = models.AutoField(primary_key=True, unique=True)

    class Meta:
        managed = False
        db_table = 'dailyattendance'


class Feedback(models.Model):
    date = models.DateField(blank=True, null=True)
    comment = models.CharField(max_length=2000, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'feedback'


class OldStudent(models.Model):
    first_name = models.TextField(blank=True, null=True)
    last_name = models.TextField(blank=True, null=True)
    id = models.IntegerField(blank=True, primary_key=True)
    first_attendance = models.DateField(blank=True, null=True)
    number_visits = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'old_students'


class StudentColumn(models.Model):
    info_id = models.AutoField(unique=True, primary_key=True)
    is_showing = models.BooleanField(blank=True, null=True)
    quick_add = models.BooleanField(blank=True, null=True)
    name = models.CharField(max_length=255, blank=True, null=True)
    type = models.CharField(max_length=255, blank=True, null=True)
    defined_options = models.CharField(max_length=1000, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'studentcolumns'


class StudentInfo(models.Model):
    student_id = models.IntegerField(blank=True, null=True)
    info_id = models.IntegerField(blank=True, null=True)
    int_value = models.IntegerField(blank=True, null=True)
    str_value = models.CharField(max_length=500, blank=True, null=True)
    bool_value = models.BooleanField(blank=True, null=True)
    date_value = models.DateField(blank=True, null=True)
    time_value = models.TimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'studentinfo'


class Students(models.Model):
    first_name = models.TextField(blank=True, null=True)
    last_name = models.TextField(blank=True, null=True)
    id = models.IntegerField(blank=True, primary_key=True)
    first_attendance = models.DateField(blank=True, null=True)
    number_visits = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'students'

class Users(models.Model):
    username = models.TextField(primary_key=True)
    salt = models.TextField()
    passwordhash = models.TextField()

    class Meta:
        managed = True
        db_table = 'users'

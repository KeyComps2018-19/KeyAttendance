from ..models import AttendanceItems, Students, Activity, StudentInfo, StudentColumn
from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

class History(APIView):

    def validateGet(self, request):
        if 'user_id' in request.query_params:
            try:
                User.objects.get(pk=request.query_params['user_id'])
                return True
            except Exception:
                return False
        return False

    def buildActionString(self, history_type, model):
        action = ''
        if history_type == '+':
            action = 'Create'
        elif history_type == '-':
            action = 'Delete'
        elif history_type == '~':
            action = 'Update'
        return '{} {}'.format(action, model)

    def buildAttendanceValuesString(self, item, activity, student_name):
        activity_value = ''
        if activity.type == 'string':
            activity_value = ' | Text Value: {}'.format(item['str_value'])
        elif activity.type == 'float':
            number = int(item['num_value']) if item['num_value'].is_integer() else item['num_value']
            activity_value = ' | Number Value: {}'.format(number)
        return 'Date: {} | Time: {} | Student Name: {} | Activity: {}{}'.format(str(item['date']), 
                    str(item['time']), student_name, activity.name, activity_value)

    def buildStudentInfoValuesString(self, item, column, student_name):
        info_value = ' | Field: {} | Value: '.format(column.name)
        if column.type == 'str':
            info_value += str(item['str_value'])
        elif column.type == 'int':
            info_value += str(item['int_value'])
        elif column.type == 'date':
            info_value += str(item['date_value'])
        return 'Student Name: {}{}'.format(student_name, info_value)

    def getAttendanceHistory(self, user_id, activities, students):
        compiled_history = []
        history = AttendanceItems.history.all().filter(history_user_id=user_id)
        for item in history.values():
            entry = {}
            activity = activities.get(pk=item['activity_id'])
            student = students.get(pk=item['student_id'])
            student_name = student.first_name + ' ' + student.last_name
            entry['datetime'] = str(item['history_date']).split('.')[0]
            entry['action'] = self.buildActionString(item['history_type'], 'attendance_item')
            entry['values'] = self.buildAttendanceValuesString(item, activity, student_name)
            compiled_history.append(entry)
        return compiled_history

    def getStudentHistory(self, user_id):
        compiled_history = []
        history = Students.history.all().filter(history_user_id=user_id)
        for item in history.values():
            entry = {}
            entry['datetime'] = str(item['history_date']).split('.')[0]
            entry['action'] = self.buildActionString(item['history_type'], 'student')
            entry['values'] = 'First Name: {} | Last Name: {}'.format(item['first_name'], item['last_name'])
            compiled_history.append(entry)
        return compiled_history

    def getStudentInfoHistory(self, user_id, students, student_columns):
        compiled_history = []
        history = StudentInfo.history.all().filter(history_user_id=user_id)
        for item in history.values():
            entry = {}
            column = student_columns.get(info_id=item['info_id'])
            student = students.get(pk=item['student_id'])
            student_name = student.first_name + ' ' + student.last_name
            entry['datetime'] = str(item['history_date']).split('.')[0]
            entry['action'] = self.buildActionString(item['history_type'], 'student profile info')
            entry['values'] = self.buildStudentInfoValuesString(item, column, student_name)
            compiled_history.append(entry)
        return compiled_history  

    def get(self, request):
        compiled_history = []
        user_id = request.query_params['user_id']
        activities = Activity.objects.all()
        students = Students.objects.all()
        student_columns = StudentColumn.objects.all()
        compiled_history.extend(self.getAttendanceHistory(user_id, activities, students))
        compiled_history.extend(self.getStudentHistory(user_id))
        compiled_history.extend(self.getStudentInfoHistory(user_id, students, student_columns))
        return Response(compiled_history)

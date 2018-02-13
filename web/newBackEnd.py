import json
import psycopg2
import sys
import datetime
import flaskEnd





def executeSingleQuery(query, params = [], fetch = False):
    print(query, params)
    dbName = 'compsTestDB'
    user = 'ubuntu'
    password = 'keyComps'
    hostName = 'ec2-34-213-2-88.us-west-2.compute.amazonaws.com'
    conn = psycopg2.connect(database=dbName, user=user, password=password, host=hostName)
    cur = conn.cursor()
    if len(params) == 0:
        cur.execute(query)
    else:
        cur.execute(query, params)
    conn.commit()
    result = cur.fetchall() if fetch else  None
    cur.close()
    conn.close()
    return result


# Gets student attendance data (date + time)
def getStudentAttendance(student):
    nameList = student.split()
    first = nameList[0]
    last = nameList[1]
    queryID = "SELECT id FROM students WHERE first_name = \'" + first + "\' AND last_name = \'" + last + "\';"
    studentID = json.loads(json.dumps(executeSingleQuery(queryID, fetch=True)))[0][0]
    queryAttendance = "SELECT DISTINCT date, time FROM dailyattendance WHERE student_id = " + str(studentID) + ";"
    
    return json.dumps(executeSingleQuery(queryAttendance, fetch = True), indent=4, sort_keys=True, default=str)

    #return getStudentInfo(studentID)



# Put the data in a format similar to how it is presented in javascript
#Input: date
#Output: all activity data for a specific date
def getAttendance(date):
    totalQuery = "SELECT DISTINCT student_id, time INTO temp0 FROM dailyattendance WHERE date = " + date + " AND activity_id = -1;"
    queryAddName= "SELECT temp0.student_id, temp0.time, students.first_name, students.last_name INTO temp1 "
    queryAddName = queryAddName + "FROM temp0 LEFT JOIN students ON temp0.student_id = students.id;"
    totalQuery = totalQuery + queryAddName
    #executeSingleQuery(query1, [])
    
    queryColumns = "SELECT activity_id, name FROM activities WHERE is_showing = 'true' ORDER BY ordering;"
    columnResults = json.dumps(executeSingleQuery(queryColumns, fetch=True))
    columns =json.loads(columnResults)
    newTable = "temp1"
    tempCount = 1
    
    for i in range(len(columns)):
        name = columns[i][1]
        colID = columns[i][0]
        tempCount = tempCount + 1
        rightTable = "temp" + str(tempCount)
        
        queryTemp = "SELECT DISTINCT student_id, activity_id INTO " + rightTable + " FROM dailyattendance WHERE date = " + date
        queryTemp = queryTemp + " AND activity_id = " + str(colID) + ";"
        #executeSingleQuery(queryTemp, [])
        
        leftTable = newTable
        tempCount = tempCount + 1
        newTable = "temp" + str(tempCount)
        queryJoin = "SELECT " + leftTable + ".student_id, "+ leftTable + ".time, "
        
        
        if (i > 0):
            for act in range(1, i + 1):
                queryJoin = queryJoin + leftTable + ".act" + str(act) + ", "
            
        
        queryJoin = queryJoin + rightTable + ".activity_id as act" + str(i + 1) + " INTO "
        queryJoin = queryJoin + newTable + " FROM " + leftTable + " LEFT JOIN "
        queryJoin = queryJoin + rightTable + " ON " + leftTable + ".student_id = " + rightTable + ".student_id;"
        totalQuery = totalQuery + " " + queryTemp + " " + queryJoin
    
    executeSingleQuery(totalQuery, [])
        
    returnQuery = "SELECT * FROM " + newTable + ";"
    
    result = json.dumps(executeSingleQuery(returnQuery, fetch = True), indent=4, sort_keys=True, default=str)
    print(result)
    #return result

    queryDrop = ""
    
    for table in range(0, tempCount + 1):
        queryDrop = queryDrop + "DROP TABLE temp" + str(table) + "; "
    executeSingleQuery(queryDrop, [])

    return result    
    
    
#Add new student to system
#Input: first name and last name
#Output: none    
def addNewStudent(request):
    firstName = request.form.get('firstName')
    lastName  = request.form.get('lastName')
    executeSingleQuery("INSERT INTO students VALUES (%s, %s)", [firstName, lastName])

    return "\nHello frontend:)\n"


#Add info on a student
#Input: name (first and last concatenated
#column name
#value - aka data to be entered for that column
#Output: None
def updateStudentInfo(request):
    name = request.form.get('name')
    nameList = name.split()
    first = nameList[0]
    last = nameList[1]
    col = request.form.get('column')
    value = request.form.get('value')
    queryColID = "SELECT info_id FROM activities WHERE name = \'" + col + "\';"

    colID = json.loads(json.dumps(executeSingleQuery(queryColID, fetch=True)))[0][0]
    
     
    queryID = "SELECT id FROM students WHERE first_name = \'" + first + "\' AND last_name = \'" + last + "\';"
    studentID = json.loads(json.dumps(executeSingleQuery(queryID, fetch=True)))[0][0]
    queryDelete = "DELETE FROM studentinfo WHERE studentid = " + str(studentID) + " AND info_id = " + str(colID) + ";"
    
    queryColumnName = "SELECT name, type FROM studentcolumns WHERE info_id = + " + str(colID) + ";"
    nameResult = json.dumps(executeSingleQuery(queryColumnName, fetch=True))
    columnInfo =json.loads(nameResult)
    columnName = columnInfo[0][0]
    columnType = columnInfo[0][1]
    
    colName = ""
    if (columnType == "varchar"):
        colName = "str_value"
        value = "\'" + value + "\'"
    elif (columnType == "int"):
        colName = "int_value"
    elif (columnType == "boolean"):
        colName = "bool_value"
    elif (columnType == "date"):
        colName = "date_value"
    elif (columnType == "boolean"):
        colName = "time_value"


    
    queryUpdate = "INSERT INTO studentinfo (student_id, info_id, " + colName 
    queryUpdate = queryUpdate + ") VALUES (" + str(studentID) + ", " + str(colID) + ", " + value + ";"
        
    queryTotal = queryDelete + " " + queryUpdate
    executeSingleQuery(queryTotal,[])
    return "done"
    

# create full table for student data
##NEEDS to be implemented in flaskEnd.py
#Input: none
#Output: all student data concatenated in one table
def createStudentInfoTable(request):
    
    totalQuery = "SELECT DISTINCT id INTO temp1 FROM students;"
    #executeSingleQuery(query1, [])
    
    queryColumns = "SELECT info_id, name, type FROM studentcolumns WHERE is_showing = 'true' ORDER BY info_id;"
    columnResults = json.dumps(executeSingleQuery(queryColumns, fetch=True))
    columns =json.loads(columnResults)
    newTable = "temp1"
    tempCount = 1
    
    for i in range(len(columns)):
        name = columns[i][1]
        colID = columns[i][0]
        colType = columns[i][2]
        tempCount = tempCount + 1
        rightTable = "temp" + str(tempCount)
        # key difference - select from differnt column based on type
        colToSelect = ""
        if (colType == "varchar"):
            colToSelect = "str_value"
        elif (colType == "int"):
            colToSelect = "int_value"
        elif (colType == "boolean"):
            colToSelect = "bool_value"
        elif (colType == "date"):
            colToSelect = "date_value"
        elif (colType == "boolean"):
            colToSelect = "time_value"
        
        queryTemp = "SELECT DISTINCT student_id, " +  colToSelect + " INTO " + rightTable + " FROM studentinfo WHERE info_id = " + str(colID) + ";"
        #executeSingleQuery(queryTemp, [])
        
        leftTable = newTable
        tempCount = tempCount + 1
        newTable = "temp" + str(tempCount)
        queryJoin = "SELECT " + leftTable + ".id, "
        
        
        if (i > 0):
            for act in range(1, i + 1):
                queryJoin = queryJoin + leftTable + ".act" + str(act) + ", "
            
        
        queryJoin = queryJoin + rightTable + "." + colToSelect + " as act" + str(i + 1) + " INTO "
        queryJoin = queryJoin + newTable + " FROM " + leftTable + " LEFT JOIN "
        queryJoin = queryJoin + rightTable + " ON " + leftTable + ".id = " + rightTable + ".id;"
        totalQuery = totalQuery + " " + queryTemp + " " + queryJoin
    
    executeSingleQuery(totalQuery, [])
        
    returnQuery = "SELECT * FROM " + newTable + ";"
    
    result = json.dumps(executeSingleQuery(returnQuery, fetch = True), indent=4, sort_keys=True, default=str)
    print(result)
    #return result

    queryDrop = ""
    
    for table in range(1, tempCount + 1):
        queryDrop = queryDrop + "DROP TABLE temp" + str(table) + "; "
    executeSingleQuery(queryDrop, [])

    return result    


# the same process as entire table, but for just one student
#Input: student ID
#Output: all info on said student - in one row
#totalQuery = "SELECT DISTINCT id INTO temp1 FROM students WHERE id = " + str(studID) + ";"
#queryTemp = "SELECT DISTINCT id, " +  columnToSelect + " INTO " + rightTable + " FROM students WHERE activity_id = " + str(colID)
#        queryTemp = queryTemp + " AND id = " + str(studID) +  ";"
def getStudentInfo(studID):
    totalQuery = "SELECT DISTINCT id INTO temp1 FROM students;"
    #executeSingleQuery(query1, [])
    
    queryColumns = "SELECT info_id, name, type FROM studentcolumns WHERE is_showing = 'true' ORDER BY info_id;"
    columnResults = json.dumps(executeSingleQuery(queryColumns, fetch=True))
    columns =json.loads(columnResults)
    newTable = "temp1"
    tempCount = 1
    
    for i in range(len(columns)):
        name = columns[i][1]
        colID = columns[i][0]
        colType = columns[i][2]
        tempCount = tempCount + 1
        rightTable = "temp" + str(tempCount)
        # key difference - select from differnt column based on type
        colToSelect = ""
        if (colType == "varchar"):
            colToSelect = "str_value"
        elif (colType == "int"):
            colToSelect = "int_value"
        elif (colType == "boolean"):
            colToSelect = "bool_value"
        elif (colType == "date"):
            colToSelect = "date_value"
        elif (colType == "boolean"):
            colToSelect = "time_value"
        
        queryTemp = "SELECT DISTINCT student_id, " +  colToSelect + " INTO " + rightTable + " FROM studentinfo WHERE info_id = " + str(colID) + ";"
        #executeSingleQuery(queryTemp, [])
        
        leftTable = newTable
        tempCount = tempCount + 1
        newTable = "temp" + str(tempCount)
        queryJoin = "SELECT " + leftTable + ".id, "
        
        
        if (i > 0):
            for act in range(1, i + 1):
                queryJoin = queryJoin + leftTable + ".act" + str(act) + ", "
            
        
        queryJoin = queryJoin + rightTable + "." + colToSelect + " as act" + str(i + 1) + " INTO "
        queryJoin = queryJoin + newTable + " FROM " + leftTable + " LEFT JOIN "
        queryJoin = queryJoin + rightTable + " ON " + leftTable + ".id = " + rightTable + ".id;"
        totalQuery = totalQuery + " " + queryTemp + " " + queryJoin
    
    executeSingleQuery(totalQuery, [])
        
    returnQuery = "SELECT * FROM " + newTable + " WHERE id = studID;"
    
    result = json.dumps(executeSingleQuery(returnQuery, fetch = True), indent=4, sort_keys=True, default=str)
    print(result)
    #return result

    queryDrop = ""
    
    for table in range(1, tempCount + 1):
        queryDrop = queryDrop + "DROP TABLE temp" + str(table) + "; "
    executeSingleQuery(queryDrop, [])

    return result


#Create new category for studentinfo
#input: name, type
#Output: nothing
def addStudentColumn(request):
    #make sure column name not in use
    name = request.form.get("name")
    colType = request.form.get("type")
    definedOptions = request.form.get("definedOptions")

    
    
    #query = "INSERT INTO studentColumns VALUES ('true','false', '" + name + "', '"+ colType + "', '" + definedOptions + "');"
    #queryAttendance = "ALTER TABLE testStudents ADD " + name + " " + colType + ";"
    query = "INSERT INTO studentcolumns (is_showing, quick_add, name, type) VALUES (" 
    query = query + "'true', 'false', '" + name + "', '" + colType + "');"
    
    executeSingleQuery(query, [])
    #executeSingleQuery(queryAttendance, [])
    return "done"


# INPUTS HAVE CHANGED
#Input: name = column name, column =  isshowing/isquick
#Output: nothing
def alterStudentColumn(request):
    name = request.form.get("name")
    column = request.form.get("column")
    
    queryStatus = "SELECT " + column + " FROM studentColumns WHERE name = '" + name + "';"
    result = json.dumps(executeSingleQuery(queryStatus,fetch = True))
    newResult =json.loads(result)
    isChecked = newResult[0][0]

    if (isChecked):
        query = "UPDATE studentColumns SET " + column + "  = 'false' WHERE name = '" + name + "';"
    else:
        query = "UPDATE studentColumns SET " + column + "  = 'true' WHERE name = '" + name + "';"
    executeSingleQuery(query, [])
    return "done"



#This method might not be neccessary anymore
def deleteStudentColumn(request):
    '''name = request.form.get("name")
    query = "DELETE FROM studentColumns WHERE name = '" + name + "';"
    query2 = "ALTER TABLE testStudents DROP COLUMN " + name + ";"
    executeSingleQuery(query, [])
    executeSingleQuery(query2, [])'''
    name = request.form.get("name")
    query = "UPDATE studentColumns SET is_showing  = 'false' WHERE name = '" + name + "';"
    query2 = "UPDATE studentColumns SET quick_add  = 'false' WHERE name = '" + name + "';"
    executeSingleQuery(query, [])
    executeSingleQuery(query2, [])
    

#Get student column info
#Input: nothing
#Output: contents of studentColumns table
def getStudentColumns():
    query = "SELECT * FROM studentcolumns ORDER BY info_id"
    return json.dumps(executeSingleQuery(query, fetch = True), indent=4, sort_keys=True, default=str)


#Not sure if this will end up being in use
def sendFeedback(request):
    feedback = request.form.get('feedback')
    date = request.form.get('date')
    query = "INSERT INTO feedback VALUES ('" + date +"', '" + feedback + "');"
    executeSingleQuery(query,[])



"""
Theoretically not necessary anymore
def getAttendance(date):
    queryColumns = "SELECT name FROM attendanceColumns ORDER BY ordering;"
    cols = json.dumps(executeSingleQuery(queryColumns, fetch = True), indent=4, sort_keys=True, default=str)
    colList = json.loads(cols) # this is strange... anyone have any idea why?
    query = "SELECT firstName, lastName, time, " + colList[0][0];
    for i in range(1, len(colList)):
        query = query + ", " + colList[i][0]
    query = query + " FROM dailyAttendance WHERE date= '" + date + "' ORDER BY time ASC;"

    queryResult = executeSingleQuery(query, fetch = True)
    result = json.dumps(queryResult, indent=4, sort_keys=True, default=str)
    return result
    
"""

"""
Not currently in use I think
def getLogin(login):
    nameList = login.split()
    user = nameList[0]
    password = nameList[1]
    query = "SELECT * FROM login WHERE username = '" + user + "' AND password = '" + password + "';"
    return json.dumps(executeSingleQuery(query,
        fetch = True), indent=4, sort_keys=True, default=str)
"""

# NEEDS to either be taken out, or retrieve id and call other method
def getStudentAttendance(student):
    nameList = student.split()
    first = nameList[0]
    last = nameList[1]
    queryID = "SELECT id FROM students WHERE first_name = \'" + first + "\' AND last_name = \'" + last + "\';"
    studentID = json.loads(json.dumps(executeSingleQuery(queryID, fetch=True)))[0][0]
    
    
    return getStudentInfo(studentID)


##NOT EVEN CLOSE TO DONE NEEDS TO BE IMPLEMENTED
def getMasterAttendance():
    totalQuery = "SELECT DISTINCT date INTO temp1 FROM rachelAtten ORDER BY date DESC;"
    #executeSingleQuery(query1, [])
    
    queryColumns = "SELECT id, name FROM rachelAct WHERE inuse = 'true' ORDER BY ordering;"
    columnResults = json.dumps(executeSingleQuery(queryColumns, fetch=True))
    columns =json.loads(columnResults)
    newTable = "temp1"
    tempCount = 1
    
    for i in range(len(columns)):
        name = columns[i][1]
        colID = columns[i][0]
        tempCount = tempCount + 1
        rightTable = "temp" + str(tempCount)
        
        queryTemp = "SELECT DISTINCT id, activity_id INTO " + rightTable + " FROM rachelAtten WHERE dtime = " + date
        queryTemp = queryTemp + " AND activity_id = " + str(colID) + ";"
        #executeSingleQuery(queryTemp, [])
        
        leftTable = newTable
        tempCount = tempCount + 1
        newTable = "temp" + str(tempCount)
        queryJoin = "SELECT " + leftTable + ".id, "
        
        
        if (i > 0):
            for act in range(1, i + 1):
                queryJoin = queryJoin + leftTable + ".act" + str(act) + ", "
            
        
        queryJoin = queryJoin + rightTable + ".activity_id as act" + str(i + 1) + " INTO "
        queryJoin = queryJoin + newTable + " FROM " + leftTable + " LEFT JOIN "
        queryJoin = queryJoin + rightTable + " ON " + leftTable + ".id = " + rightTable + ".id;"
        totalQuery = totalQuery + " " + queryTemp + " " + queryJoin
    
    executeSingleQuery(totalQuery, [])
        
    returnQuery = "SELECT * FROM " + newTable + ";"
    
    result = json.dumps(executeSingleQuery(returnQuery, fetch = True), indent=4, sort_keys=True, default=str)
    print(result)
    #return result

    queryDrop = ""
    
    for table in range(1, tempCount + 1):
        queryDrop = queryDrop + "DROP TABLE temp" + str(table) + "; "
    executeSingleQuery(queryDrop, [])

    return result    
    
    
    """queryColumns = "SELECT name FROM attendanceColumns ORDER BY ordering;"
    cols = json.dumps(executeSingleQuery(queryColumns, fetch = True), indent=4, sort_keys=True, default=str)
    colList = json.loads(cols) # this is strange... anyone have any idea why?
    query = "SELECT date, numattend, " + colList[0][0];
    for i in range(1, len(colList)):
        query = query + ", " + colList[i][0]
    query = query + " FROM masterAttendance ORDER BY date DESC;"
    #"SELECT DISTINCT * FROM masterAttendance ORDER BY date DESC;"
    
    return json.dumps(executeSingleQuery(query,
        fetch = True)[:10], indent=4, sort_keys=True, default=str)"""


#Switch a column's placement with the column above it
#Input: column name
#Output: none
def moveAttendanceColumnUp(request):
    print("got to column up")
    name = request.form.get("name")
    query = "SELECT name, ordering FROM activities ORDER BY ordering;"
    result = json.dumps(executeSingleQuery(query,fetch = True))
    print(result)
    ids =json.loads(result)
    colID = 0
    prevCol = ""
    prevID = 0
    print(name)
    for i in range(1, len(ids)):
        print(ids[i][0])
        if (ids[i][0] == name):
            if (i < 2):
                return ""
            
            colID = ids[i][1]
            prevCol = ids[i-1][0]
            prevID = ids[i-1][1]
    if (colID == 0 or prevID == 0):
        print("did not find... oops!")
        return 
    query1 = "UPDATE activities SET ordering = " + str(prevID) + " WHERE name = \'" + name + "\';"
    query2 = "UPDATE activities SET ordering = " + str(colID) + " WHERE name = \'" + prevCol + "\';"
    executeSingleQuery(query1, [])
    executeSingleQuery(query2, [])
            
    return "Done"

#Add new item to track in attendance
#INPUT HAS CHANGED - doesn't use coltype however for now we'll send it anyway
#Input: name
#Output: none
def addAttendanceColumn(request):
    #make sure column name not in use
    name = request.form.get("name")
    colType = request.form.get("type")
    isParent = "false"
    query = "INSERT INTO activities (is_showing, name, is_parent) VALUES ('true','" + name + "', '"+ isParent + "');"
    executeSingleQuery(query, [])
    query2 = "SELECT activity_id FROM activities WHERE name = \'" + name + "\'; "
    result = json.dumps(executeSingleQuery(query2,fetch = True))
    newResult =json.loads(result)
    prio = newResult[0][0]
    query3 = "UPDATE activities SET ordering = " + str(prio) + " WHERE name = \'" + name + "\'; "
    executeSingleQuery(query3, [])
    return "done"


#Should no longer be neccessary
def deleteAttendanceColumn(request):
    name = request.form.get("name")
    '''query = "DELETE FROM attendanceColumns WHERE name = '" + name + "';"
    queryAttendance = "ALTER TABLE dailyAttendance DROP COLUMN " + name + ";"
    queryMaster = "ALTER TABLE masterAttendance DROP COLUMN " + name + ";"

    executeSingleQuery(query, [])
    executeSingleQuery(queryAttendance, [])
    executeSingleQuery(queryMaster, [])'''
    query = "UPDATE activities SET is_showing  = 'false' WHERE name = '" + name + "';"
    executeSingleQuery(query, [])
    return "done"
    


#Not sure if this is currently being used...
def updateAttendanceColumn(request):
    name = request.form.get("name")

    queryMaster = "SELECT isShowing FROM attendanceColumns WHERE name = '" + name + "';"
    result = json.dumps(executeSingleQuery(queryMaster,fetch = True))
    newResult =json.loads(result)
    isShowing = newResult[0][0]
    if (isShowing):
        query = "UPDATE attendanceColumns SET isShowing = 'false' WHERE name = '" + name + "';"
    else:
        query = "UPDATE attendanceColumns SET isShowing = 'true' WHERE name = '" + name + "';"

    executeSingleQuery(query, [])


#get attendance columns
#Input: none
#Output: all data from table...for now...NEED TO CHECK JAVASCRIPT
def getAttendanceColumns():
    query = "SELECT * FROM activities ORDER BY ordering;"
    return json.dumps(executeSingleQuery(query, fetch = True), indent=4, sort_keys=True, default=str)


#NOT EVEN CLOSE MUST BE REWRITTEN
def getMasterAttendanceDate(dates):
    dateList = dates.split()
    start = dateList[0]
    end = dateList[1]
    return json.dumps(executeSingleQuery("SELECT DISTINCT * FROM masterAttendance WHERE date >= '" + start + "' AND date <= '" + end + "' ORDER BY date ASC;",
        fetch = True), indent=4, sort_keys=True, default=str)

"""
Should no longer be neccessary
def decreaseActivityCount(column, date, increase):
    queryMaster = "SELECT "+ column + " FROM masterAttendance WHERE date = '" + date + "';"
    result = json.dumps(executeSingleQuery(queryMaster,fetch = True))
    newResult =json.loads(result)
    numAttend = newResult[0][0]
    if increase:
        numAttend += 1
    else:
        numAttend -= 1

    alterQuery = "UPDATE masterAttendance SET " + column + " = '" + str(numAttend) + "' WHERE date = '" + date + "';"
    executeSingleQuery(alterQuery, [])
"""

#Delete someone from attendance sheet
#Input: name + date
#Output: none
def deleteAttendant(request):
    name = request.form.get("name")
    date = request.form.get("date")

    nameList = name.split()
    first = nameList[0]
    last = nameList[1]
    queryID = "SELECT id FROM students WHERE first_name = \'" + first + "\' AND last_name = \'" + last + "\';"
    
    studentID = json.loads(json.dumps(executeSingleQuery(queryID, fetch=True)))[0][0]
    queryDelete = "DELETE FROM dailyattendance WHERE student_id = " + str(studentID) + " AND date = " + date + ";"
    executeSingleQuery(queryDelete, [])
    return "done"
    

"""
I don't think this is used...
def getActiveCols():
    query = "SELECT name FROM attendanceColumns ORDER BY isshowing DESC;"
    colsRaw = json.dumps(executeSingleQuery(query, fetch = True), indent=4, sort_keys=True, default=str)
    cols = json.loads(colsRaw)
    activeCols = []
    for i in range(len(cols)):
        if cols[i][0]:
            activeCols.append(cols[i][0])
    return activeCols
"""
"""
Don't think this is used either...
def getColsStr(cols):
    colsStr = ""
    for i in range(len(cols)-1):
        colsStr += cols[i] + ", "
    colsStr += cols[len(cols)-1]
    return colsStr
"""

#Get attendance dates
#Input: none
#Output: list of dates
def getDates():
    query = "SELECT DISTINCT date FROM dailyattendance ORDER BY date DESC"
    return json.dumps(executeSingleQuery(query,fetch = True)[:10], indent=4, sort_keys=True, default=str)


#Select or de-select an activity
#Input: column (activity)
# date
# name of student
#Output: none
def selectActivity(request):
    column = request.form.get("column")
    column = column.lower()
    date = request.form.get("date")
    name = request.form.get("name")
    nameList = name.split()

    first = nameList[0]
    last = nameList[1]
    queryID = "SELECT id FROM students WHERE first_name = \'" + first + "\' AND last_name = \'" + last + "\';"
    studentID = json.loads(json.dumps(executeSingleQuery(queryID, fetch=True)))[0][0]
    queryColID = "SELECT info_id FROM activities WHERE name = \'" + column + "\';"

    colID = json.loads(json.dumps(executeSingleQuery(queryColID, fetch=True)))[0][0]
    

    query = "SELECT * FROM dailyattendance WHERE student_id = " + str(studentID) + " AND date = '" + date + "' AND activity_id = " + str(colID) + ";"
    result = json.loads(json.dumps(executeSingleQuery(query, fetch=True)))
    if (len(result) < 1):
        queryUpdate = "INSERT INTO dailyattendance VALUES (" + str(studentID) + ", '" + date + "', null, " + str(colID) + ");"
    else:
        queryUpdate = "DELETE FROM dailyattendance WHERE student_id = " + str(studentID) + " AND date = '" + date + "' AND activity_id = " + str(colID) + ";"
    executeSingleQuery(queryUpdate)    
        
    return "done"

    



#Add someone new to an attendance sheet - mark them
# as attending the key
#Input: name, date, time
#Output: none
def addAttendant(request):
    #print(json.decode(request.data))
    first = request.form.get('firstName')
    last  = request.form.get( 'lastName')
    date = request.form.get('date')
    time = request.form.get('time')
    queryID = "SELECT id FROM students WHERE first_name = \'" + first + "\' AND last_name = \'" + last + "\';"
    studentID = json.loads(json.dumps(executeSingleQuery(queryID, fetch=True)))[0][0]
    
    querykeyID = "SELECT info_id FROM activities WHERE name = 'key';"

    keyID = json.loads(json.dumps(executeSingleQuery(querykeyID, fetch=True)))[0][0]
    
    queryAdd = "INSERT INTO dailyattendance VALUES (" + str(studentID) + ", '" + date + "', '" + time +  "', -1);"
    queryAddKey = "INSERT INTO dailyattendance VALUES (" + str(studentID) + ", '" + date + "', '" + time +  "', " + str(keyID) + ");"
    queryTotal = queryAdd + " " + queryAddKey
    executeSingleQuery(queryTotal, [])

    return "done"


######################This is where I stopped editing ################

"""
    Literally just takes a string. Compares both first and last name.
"""
def autofill(partialString):
    if(partialString == ""):
        return json.dumps([])
    nameList = partialString.split()
    if (len(nameList) > 1):
        first = nameList[0].upper()
        last = nameList[1].upper()
        query = "SELECT * FROM students WHERE UPPER(firstName) LIKE '%" + first + "%' OR UPPER(lastName) LIKE '%" + last + "%';"
    else:
        q = partialString.upper()
        query = "SELECT * FROM students WHERE UPPER(firstName) LIKE '%" + q + "%' OR UPPER(lastName) LIKE '%" + q + "%';"
    databaseResult = executeSingleQuery(query, fetch = True)
    suggestions = json.dumps(databaseResult[:10], indent=4, sort_keys=True, default=str)
    return suggestions

def frequentPeers(name):
    studentID = getJustID(name)
    query = "SELECT date, time FROM dailyattendance WHERE id = '" + studentID + "';"

    result = json.dumps(executeSingleQuery(query, fetch = True), indent=4, sort_keys=True, default=str)
    result = result.replace("\n","").replace(" ","").replace("[", "").replace("]", "").replace("\"","")
    result = result.split(",")


    studentDict = {}
    peersDict = {}

    for i in range(0, len(result), 2):
        if result[i] not in studentDict.keys():
            studentDict[result[i]] = []
        # studentDict[result[i]].append(result[i + 1])
        timeList = result[i + 1].replace("\"", "").replace("\'","").split(":")
        timeNum = int(timeList[0]) + (int(timeList[1]) / 60) + (int(timeList[2]) / 3600)
        studentDict[result[i]] = timeNum

    for key in studentDict:
        print(key)
        if key not in peersDict.keys():
            peersDict[key] = {}

        query2 = "SELECT id, time FROM dailyAttendance WHERE date = '" + key + "';"
        print(query2)
        curResult = json.dumps(executeSingleQuery(query2, fetch = True), indent=4, sort_keys=True, default=str)
        curResult = curResult.replace("\n", "").replace("[q", "").replace(" ", "").replace("]","").replace("[","")

        curResult = curResult.split(",")
        print(curResult)

        for i in range(0, len(curResult), 2):
            if curResult[i] not in peersDict[key].keys():
                peersDict[key][curResult[i]] = []
            timeList = curResult[i + 1].replace("\"", "").replace("\'","").split(":")
            timeNum = int(timeList[0]) + (int(timeList[1]) / 60) + (int(timeList[2]) / 3600)
            print(timeList)
            # peersDict[key][curResult[i]].append(curResult[i + 1])
            peersDict[key][curResult[i]] = timeNum

    closeAppearancesDict = {}
    testString = ""

    for key in studentDict.keys():
        if key != studentID:
            curDate = key
            curTime = studentDict[key]
            for key2 in peersDict[curDate]:
                peerDate = key2
                peerTime = peersDict[curDate][key2]
                if abs(curTime - peerTime) < 2:
                    if key2 not in closeAppearancesDict:
                        closeAppearancesDict[key2] = 1
                    else:
                        closeAppearancesDict[key2] += 1


    closeAppearancesList = sorted(closeAppearancesDict.items(), key=lambda x: x[1])[::-1]
    frequentPeersList = []

    for i in range(5):
        frequentPeer = getStudentByID(closeAppearancesList[i][0])
        frequentPeersList.append(frequentPeer)

    return str(frequentPeersList)

def studentProfile(string):
    nameList = string.split()
    first = nameList[0]
    last = nameList[1]
    query = "SELECT id FROM testStudents WHERE firstName LIKE '%" + first + "%' OR lastName LIKE '%" + last + "%';"
    databaseResult = executeSingleQuery(query, fetch = True)
    result = json.dumps(databaseResult)
    return result

#
# def getStudentID(string):
#     nameList = string.split()
#     first = nameList[0].upper()
#     last = nameList[1].upper()
#     query = "SELECT id FROM teststudents WHERE UPPER(firstname) LIKE '%" + first + "%' AND UPPER(lastname) LIKE '%" + last + "%';"
#     databaseResult = executeSingleQuery(query, fetch = True)
#     return databaseResult;

def getStudentID(string):
    print("GetID called")
    return autofill(string)

def getStudentByID(string):

    print("CALLED")

    query = "SELECT firstname FROM teststudents WHERE id = '" + string + "';"
    databaseResult = executeSingleQuery(query, fetch = True)
    result = json.dumps(databaseResult[0][0]).replace("\"","")

    query2 = "SELECT lastname FROM teststudents WHERE id = '" + string + "';"
    databaseResult2 = executeSingleQuery(query2, fetch = True)
    result2 = json.dumps(databaseResult2[0][0]).replace("\"","")

    print(result + " " +  result2)

    return result + " " +  result2

# WE SHOULD do a query that sees if fullName can be found from firstName+lastName in DB
# This would account for problems with multiple spaces in students' names.
def getJustID(string):
    nameList = string.split()
    first = nameList[0].upper()
    last = nameList[1].upper()
    query = "SELECT id FROM teststudents WHERE UPPER(firstname) LIKE '%" + first + "%' AND UPPER(lastname) LIKE '%" + last + "%';"
    databaseResult = executeSingleQuery(query, fetch = True)
    print(databaseResult[0][0])
    result = json.dumps(databaseResult[0][0])
    return result

def getAlerts():
    query = "SELECT testStudents.firstName, testStudents.lastName, alerts.alert, alerts.studentid FROM testStudents, alerts WHERE alerts.completed = FALSE AND alerts.studentid = testStudents.id;"
    databaseResult = executeSingleQuery(query, fetch = True)
    return json.dumps(databaseResult)

def addAlert(request):
    id = request.form.get('id')
    alert = request.form.get('alertText')
    executeSingleQuery("INSERT INTO alerts VALUES (default, %s, %s, %s);", [alert, 'f', id])

def checkAlert(request):
    id = request.form.get('id')
    executeSingleQuery("UPDATE alerts SET completed = 't' WHERE studentid = %s;", [id])   

        
        
    
    
import datetime

# Helper function that determines if an input string is a valid datetime
def isValidDateTime(text):
	try:
		datetime.datetime.strptime(text, '%Y-%m-%d')
		return True
	except ValueError:
		return False

# Determines if string is valid time
def isValidTime(text):
	try:
		datetime.datetime.strptime(text, '%H:%M:%S')
		return True
	except ValueError:
		return False

# Returns current date in format YYYY-mm-dd
def getCurrentDate():
	return datetime.datetime.now().date()

# Returns current time in format HH:MM:SS
def getCurrentTime():
	return datetime.datetime.now().time()
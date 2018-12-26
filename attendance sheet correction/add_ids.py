'''
Notes:

This program was designed to be run from the command line with the file name of the attendance csv you want
to manipulate passed in, ie 'python3 add_ids.py Attendance_2018-10-27.csv'. If you don't specify a filename,
the program will ask you nicely once you boot it up, but this may be annoying as you won't be able to take
advantage of terminal autocomplete features.

Also, it expects a students.csv file to be present in the working directory, and students.csv needs to at
least have columns with students' First Name, Last Name, and Student Key.
'''
import sys
import csv

# Progress bars make me feel productive.
def progress(count, total, prefix=''):
	bar_len = 30
	filled_len = int(round(bar_len * count / float(total)))
 
	percents = round(100.0 * count / float(total), 1)
	bar = '=' * filled_len + ' ' * (bar_len - filled_len)
 
	sys.stdout.write('%s: [%s] %s%s completed.\r' % (prefix, bar, percents, '%'))
	sys.stdout.flush()

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

def getSuggestions(name, students):
	suggestions = []
	for student in students.keys():
		result = {"name":student, "editDistance":levenshtein(name, student)}
		suggestions.append(result)

	suggestions = sorted(suggestions, key=lambda item: item["editDistance"])
	return suggestions[0:3]

def importStudents():
	students = {}
	try:
		with open('students.csv', 'r') as studentFile:
			reader = csv.DictReader(studentFile)
			for row in reader:
				students["{0} {1}".format(row['First Name'], row['Last Name'])] = row['Student Key']

	except Exception as e:
		print("Error opening students.csv ({0}), exiting.".format(e))
		sys.exit(1)

	return students

def importAttendance():
	attendance = []
	path = ""
	if len(sys.argv) > 1: 
		path = sys.argv[1]

	else: # Prompt for file path
		path = input("Please enter attendance sheet file name: ")

	try:
		with open(path, 'r') as attendanceFile:
			reader = csv.reader(attendanceFile)
			header = next(reader)
			header.insert(3, "StudentKey")
			attendance.append(header)
			for row in reader:
				row.insert(3, "")
				attendance.append(row)

	except Exception as e:
		print("Error opening {0} ({1}), exiting.".format(path, e))
		sys.exit(1)

	return attendance, path

def main():
	# Set up our tables
	students = importStudents()
	attendance, fileName = importAttendance()
	unmatched = {}

	# Run through students and attempt to match them. Failing that, come up with suggestions.
	total = len(attendance)
	for i in range(1, len(attendance)):
		progress(i, total, "Matching Student Names")
		studentName = "{0} {1}".format(attendance[i][1], attendance[i][2])
		if studentName in students.keys():
			attendance[i][3] = students[studentName]
		else:
			unmatched[i] = getSuggestions(studentName, students)
	progress(total, total, "Matching Student Names")
	print()
	print("{0} Students Matched, {0} Unmatched.".format(total - 1 - len(unmatched.keys()), len(unmatched.keys())))

	# Ask the user about unmatched students, give them suggestions.
	for row, suggestions in unmatched.items():
		print("No matches found for '{0}', suggestions:".format(attendance[row][1] + " " + attendance[row][2]))
		print("1) {0}".format(suggestions[0]['name']))
		print("2) {0}".format(suggestions[1]['name']))
		print("3) {0}".format(suggestions[2]['name']))
		print("4) Leave Student Key Blank")
		print("5) Enter Name")

		result = input("Please select an option 1-5: ")
		while True:
			if "1" in result or "2" in result or "3" in result or "4" in result or "5" in result:
				break
			else:
				print("Could not find option selection in input.")
				result = input("Please select an option 1-5: ")

		if "1" in result: # Select first name
			attendance[row][3] = students[suggestions[0]['name']]
		elif "2" in result: # Select second name
			attendance[row][3] = students[suggestions[1]['name']]
		elif "3" in result: # Select third name
			attendance[row][3] = students[suggestions[2]['name']]
		# Don't need to care about 4, student key is blank by default.
		elif "5" in result: # Enter custom name
			while True:
				name = input("Please enter a name: ")
				if name in students.keys():
					attendance[row][3] = name
					break
				else:
					while True:
						suggestions = getSuggestions(name, students)
						print("\nCould not find '{0}' in the list of students. Did you mean:".format(name))
						print("1) {0}".format(suggestions[0]['name']))
						print("2) {0}".format(suggestions[1]['name']))
						print("3) {0}".format(suggestions[2]['name']))
						print("4) Leave Student Key Blank")
						print("5) Try another name")

						result = input("Please select an option 1-5: ")
						if "1" in result or "2" in result or "3" in result or "4" in result or "5" in result:
							break
						else:
							print("Could not find option selection in input.")
							result = input("Please select an option 1-5: ")

					if "1" in result: # Select first name
						attendance[row][3] = students[suggestions[0]['name']]
						break
					elif "2" in result: # Select second name
						attendance[row][3] = students[suggestions[1]['name']]
						break
					elif "3" in result: # Select third name
						attendance[row][3] = students[suggestions[2]['name']]
						break
					elif "4" in result: # Leave blank, break out of loop
						break
		print()

	# Write updates to file.
	print("Writing updates to attendance CSV")
	with open(fileName, 'w', newline='') as f:
		writer = csv.writer(f)
		writer.writerows(attendance)
	print("Written to file.")

if __name__ == '__main__':
	main()

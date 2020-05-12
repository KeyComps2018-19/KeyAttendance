# Troubleshooting

This document serves as a running list of problems we encountered, as well as steps we took to solve them. Keep it updated to make the work of future groups easier!

### virtualenv not found
This likely resulted from multiple versions of python on your system (especially if it's a Mac). You can see all versions of python (or whatever other command/program you're searching for) by typing `which -as python` and `which -as python3`. The output will be lines in the form `pathToThing` or `pathSynonym/Link -> actualPath`, and is ordered by the order your machine uses the program (so the top one is what's being called). You'll want to try calling `which -as` on python, python3, pip, and pip3, and making sure the ones you're using are linked to the same space. You can see the packages a version of pip has installed by typing `pip list` or `pip3 list` (these might be different, which means you've probably found the problem). The simplist solution is to install virtualenv to all pip versions. [More on virtualenv](https://pypi.org/project/virtualenv/).




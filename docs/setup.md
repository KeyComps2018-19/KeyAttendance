# First Time Setup Reference

## Backend Setup

Make sure that you have python3 and pip installed. If you are using Homebrew on MacOS, `brew install python` [takes care of both](https://docs.brew.sh/Homebrew-and-Python). 

### Setting up the Virtual Development Environment

First, install [virtualenv](https://pypi.org/project/virtualenv/):

* `pip install virtualenv`

This is a package that allows you to isolate a python environment. Any changes you make to a virtual environment will be present anytime you re-open the virtual environment. 

Once this is complete, cd to `KeyAttendance/app/backend/` and run:

* `virtualenv env`. This creates a virtual environment named `env/`. All the settings/packages/etc that you make will now be recorded in the folders `env/bin`, `env/lib`, etc.
* `"env/Scripts/activate"` if you're using Windows, or `source env/bin/activate` if you're using a Unix-based OS. This activates the virtual environment. You'll see an indicator that you're in the virtual environment named `(env)`. To exit the virtual environment use `deactivate` or hit Ctrl-d.
* `pip install -r requirements.txt`. This installs the python dependencies listed in `requirements.txt` into your virtual environment. Remember that these are isolated in your virtual environment `env`, so these packages won't work elsewhere unless you also have them installed elsewhere. You can check this by running `pip list` inside and outside your virtual environment.

Huzzah! You now have a virtual environment in the project folder will the necessary python dependencies.

## Frontend Setup

Make sure you have node and npm installed. You'll want to make sure that npm is added to your system path.

* `cd KeyAttendance/app/frontend`
* `npm install`

## Database Setup

First, you'll want to [download postgres](https://www.postgresql.org/download/). When creating your database, set up a user where the username and password are both `postgres`. This is what Django currently expects the credentials to be. Additionally, you may want to add postgres to your system path for ease of access in the terminal.

Now, open up the postgres CLI, and run:

* `CREATE DATABASE keydb;`

Close postgres. Now, change directories to make sure you're in `KeyAttendance/app/backend`, activate your virtual environment(`source env/bin/activate`), and run: 

* `python manage.py migrate`
* `python manage.py createsuperuser`
* `python manage.py dbshell` -- perhaps unnecessary? 


This will create the necessary tables in your postgres database and create a new admin account to access our website. Now, open the postgres CLI (`psql keydb -U postgres`) again, and run -- perhaps unnecessary?

* `INSERT INTO auth_group VALUES (1, 'Admin');`
* `INSERT INTO auth_group_permissions(group_id, permission_id) select 1, id from auth_permission;`
* `INSERT INTO auth_user_groups(user_id, group_id) VALUES (1, 1);`

This will create the 'Admin' role on the website, which has access to all endpoints and views, and assigns it to your new superuser. Now, run:

* `INSERT INTO activities (activity_id, is_showing, name, type, is_parent, ordering) VALUES (7, true, 'Key', 'boolean', false, 1);`
* `INSERT INTO studentcolumns (info_id, is_showing, quick_add, name, type) VALUES (1, true, false, 'Birthday', 'date');`

This creates basic activity type and student data information that the site expects when loading data.

## All together now!

To see if everything is working properly, first edit `app/frontend/src/components/Helpers.js` such that the local development domain and protocol are uncommented and the remote domain and protocol are commented. This is pretty important, as it sets the front end to grab all its data locally instead of actually messing with live data.

Then, open two terminal windows. In the first:

* cd to `KeyAttendance/app/frontend/`
* `npm start`

Then, in the second, activate the virtual environment of your choice in `KeyAttendance/app/backend`and run:

* `python manage.py runserver` if you're on a Windows machine, or `python3 manage.py runserver` if you're on a Unix machine.

If everything was installed correctly, this should open a browser pointed at `localhost:3000` with the website in it, and the username and password for the superuser you created in the database should grant access to the local site.

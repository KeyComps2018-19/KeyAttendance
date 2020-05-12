# Back-end Reference

## Overview

The back-end of this project is coded in Python, and uses django for serving the compiled front end alongside the API.

## Organization

The major files and folders in `/backend/` are:

* `/build/`: This contains the compiled frontend assets produced by Webpack.
* `/env/`: If you're using virtualenv or on the server, this file contains all virtualenv installations and is not tracked through version control.
* `/key/`: This contains the bulk of our code, such as migrations, views, helper functions and data management classes.
* `/key_api/`: This largely contains configuration code that django uses to run the server.
* `/static/`: This contains static resources for the server when hosted on AWS.
* `key_api_uwsgi.ini`: This contains the configuration for uWSGI on the AWS server.
* `manage.py`: This is the python file that runs django from the command line.
* `requirements.txt`: This contains configuration details for virtualenv
* `uwsgi_params`: This contains some configuration details for nginx on the AWS server.

## Virtual Environments

As Python doesn't have a built-in method for syncing installed packages across verion control, virtual environments provide this functionality. The tools originally used with this project in 2019 and are known to be compatible are [pipenv](https://pypi.org/project/pipenv/) and [virtualenv](https://virtualenv.pypa.io/en/latest/), each of which keep track of local python versions and dependencies used in the project, albeit in different ways. Either work equally fine for running the project locally, although the server must use virtualenv given configuration details for uWSGI. The 2020 iteration only used virtualenv, so check the origiginal repository if you are looking for files related to pipenv.

To run virtualenv, cd into `app/backend/` and running `source /env/bin/activate` on a unix machine or `"env/Scripts/activate"` on a windows machine to run the terminal within the virtual environment. If you're running virtualenv for the first time, run `virtualenv env` to initialize the virtual environment, then run `pip install -r requirements.txt` to install any packages you have yet to download.

## Django

Django is the back-end framework we use to run the server and our API. It provides more 'out of the box' features than other python web frameworks, such as flask, speeding up our development cycle by avoiding the necessity of implementing protocols and features that have already been written and largely approved by a larger development community.

Django also manages the state of our database, abstracting raw SQL queries into python methods to make it easier for programmers to access and modify data while promoting security.

One feature in particular that is important to familiarize yourself with is django's migrations. This allows us to keep track of and synchronise database changes using version control tools, making everyone's life easier. To create a migration, modify an existing model or create a new model in `models.py`, then run `manage.py makemigrations`. Then, to implement these changes, run `manage.py migrate`. Should there be any issues, django's command line interface will alert you  and tell you what needs to be fixed.

We use several additional packages that complement django in adding extra features, namely djangorestframework, djangorestframework-jwt, and django-simple-history among others. Django Rest Framework makes it easier to build RESTful APIs in django, providing tools such as serializers that facilitate quick and easy manipulation of the database through HTTP requests. Django Rest Framework-jwt helps us implement endpoint security using JSON Web Tokens, a cryptographic method of making sure only those with adequate permissions have access to the proper endpoints. Finally, django-simple-history makes it easier for us to track user actions, saving database modifications for later access.

## Security

The live backend is generally secured with HTTPS, meaning it is infeasible to intercept and read data sent between the server and any given client. See the server documentation for more details on how this is implemented.

We use [JSON Web Tokens](https://jwt.io/) ([RFC-7519](https://tools.ietf.org/html/rfc7519)) to secure our endpoints, making sure that users have to be authorized to access API data. In short, these tokens work as follows:

* The client logs into the server by posting their username and password to `/api_token_auth/`
* If the username and password check out, the server sends back a base-64 encoded token. This has three main parts: a header that states that the token implements JWT, a body that stores the permissions and username associated with your login, and a signature produced by the server to verify the authenticity of the token.
* The client then sends this token to the server every time it wants to access our API to prove that it has access to the resource.
* Eventually the token will expire. At this point, the server will tell the client that it is unauthorized, and the client will automatically log out.

## Notable Console Commands

* `manage.py runserver` runs the local server
* `manage.py makemigrations` creates migrations
* `manage.py migrate` applies migrations
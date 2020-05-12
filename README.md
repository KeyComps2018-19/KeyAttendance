# Key Comps 2018-19

## Running the application

The folder "app" contains a django app (located in `/backend`) and a react frontend (located in `/frontend`).

To start up the backend locally, you'll first need to install "virtualenv". If you're using virtualenv for the first time, cd into `/app/backend/` and run `virtualenv env` to initialize the virtual environment. For all further uses of virtualenv, first activate virtualenv by running `source /env/bin/activate` on a unix machine or `"env/Scripts/activate` on a windows machine, then run `pip install -r requirements.txt` to install any packages you have yet to download, and finally `manage.py runserver` to run the backend.

To run the frontend, you'll need to install Node. In a new terminal window, cd into `app/frontend/`, run `npm install` to update your javascript dependencies, then `npm start` to run the development server. This should automatically open `localhost:3000` in your browser, and will automatically update for any changes you make in your local javascript files.

The initial tutorial the 2019 group followed to set up this arrangement can be found [here](https://wsvincent.com/django-rest-framework-react-tutorial/)

## Git Workflow

* When starting to work on an issue, create a new branch off of 'develop' using git flow-ish naming style of a prefix followed by an objective summary. For instance, if you are adding a feature that installs a bouncy house in the living room, the branch would be called 'feature/add_bouncy_house_to_living_room'
* When you're done with a branch, create a pull request back to develop. Ideally 1 or 2 people should approve the pull request prior to merging it to ensure that we don't miss any obvious issues.

## Further Reading

Under `/docs/`, there is documentation covering the API endpoints, more specific backend function and organization, specific frontend function and organization, database design, and server management.

It's also advisable to read the basic documentation on [React](https://reactjs.org/docs/getting-started.html), [Django](https://docs.djangoproject.com/en/2.1/) and [Django Rest Framework](https://www.django-rest-framework.org/tutorial/quickstart/) if you are unfamiliar with any.
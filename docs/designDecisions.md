# Design 
This document serves as a log of the decision made when designing The Key Attendance system. Note that the "options" label is not inclusive of all possible options, just the one we considered at the time. This document was started during the 3rd iteration, so not all relvant design decisions are listed (yet).

## Virtual Environment
Options: pipenv, venv, virtualenv
Decision: virtualenv
Reason: Most popular, most support, easiset to use, sustainable between python versions

## Database Type
Options: SQL/RDBS, NoSQL
Decision: SQL/RDBS
Reason: A relational database system has the structre that makes sense for storing the information we need to. We care more about ACID than big data analysis, flexibility, or scalability. We aren't storing graphs, documents, or any abnormal datatype. 

## Database Management System
Options: PostgreSQL, MongoDB
Decision: PostgreSQL
Reason: MongoDB specializes in NoSQL. PostgreSQL has a lot of support and is very flexible.

## Hosting
Options: Cloud services, In-House server
Decision: Cloud services
Reason: The Key has expressed they care more about minimizing maintenance than the cost they incur from hosting on the cloud.

## Host
Options: EC2, ...

## Framework
Options: Django, ...

## File Renewals
Options: .gitignore
Decision: adding all folders of auto-generated files made during instance startup to the .gitignore file
Reason: For the sake of 1) robustness, 2) not encountering unexpected problems during re-instancing, 3) allowing the students working on this project to see how Django, 


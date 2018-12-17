from django.core import serializers
from ..models import Users
from ..serializers import UserSerializer
from ..helpers import isValidDateTime, isValidTime
from ..security import buildToken
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from os import urandom
import hashlib

class Login(APIView):

	# Validate input for POST request of this endpoint
	def validatePost(self, request):
		if not 'username' in request.data or not 'password' in request.data:
			return False
		try:
			Users.objects.get(username=request.data['username'])
		except:
			return False
		return True

	# Checks username and password against db, returns token if they check out
	def post(self, request):
		if not self.validatePost(request):
			return Response({'error':'Invalid Parameters'}, status='400')
		
		# Grab our user
		user = Users.objects.get(username=request.data['username'])

		# Calculate sha256 hash of password + hash
		sha = hashlib.sha256()
		preHash = user.salt + request.data['password']
		sha.update(preHash.encode())
		postHash = sha.hexdigest()

		# Compare the hash and the stored hash
		if postHash == user.passwordhash:
			# Build a token
			token = buildToken(request.data['username'], 'user') # TODO: implement role checking.
			return Response({'token': token})
		else:
			return Response({'error':'Invalid Parameters'}, status=status.HTTP_400_BAD_REQUEST) # Make sure that this and the other error return the same string, else you can guess usernames.
		
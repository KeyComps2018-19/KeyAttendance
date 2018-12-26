from django.core import serializers
from ..models import Users
from ..security import validateRequest
from ..serializers import UserSerializer
from ..helpers import isValidDateTime, isValidTime
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from os import urandom
import hashlib

class UserView(APIView):

	# Validate input for the DELETE request of this endpoint - should reference a valid user
	def validateDelete(self, request):
		if not 'username' in request.query_params:
			return False
		try:
			Users.objects.get(pk=request.query_params['username'])
		except:
			return False
		return True

	# Validate input for POST request of this endpoint - makes sure a matching username doesnt exist
	def validatePost(self, request):
		if not 'username' in request.data or not 'password' in request.data:
			return False
		try:
			Users.objects.get(username=request.data['username'])
			return False
		except:
			pass
		return True

	# Validate input for PATCH request of this endpoint - makes sure that a matching username exists
	def validatePatch(self, request):
		if not 'username' in request.data or not 'password' in request.data:
			return False
		try:
			Users.objects.get(username=request.data['username'])
		except:
			return False
		return True
		
	# Fetch a list of all usernames
	def get(self, request):
		valid, msg = validateRequest(request, 'user')
		if not valid:
			return Response({'error':msg}, status='403')

		items = Users.objects.all()
		serializer = UserSerializer(items, many=True)
		return Response(serializer.data, content_type='application/json')

	# Remove a user
	def delete(self, request):
		valid, msg = validateRequest(request, 'user')
		if not valid:
			return Response({'error':msg}, status='403')

		if not self.validateDelete(request):
			return Response({'error':'Invalid Parameters'}, status='400')

		user = Users.objects.get(username=request.query_params['username'])
		user.delete()
		return Response(status=status.HTTP_204_NO_CONTENT)

	# Create a user
	def post(self, request):
		valid, msg = validateRequest(request, 'user')
		if not valid:
			return Response({'error':msg}, status='403')

		if not self.validatePost(request):
			return Response({'error':'Invalid Parameters'}, status='400')
		
		# Generate a salt
		salt = str(urandom(64))

		# Calculate sha256 hash of password + hash
		sha = hashlib.sha256()
		preHash = salt + request.data['password']
		sha.update(preHash.encode())
		passwordHash = sha.hexdigest()

		try:
			user = Users(username=request.data['username'], salt=salt, passwordhash=passwordHash)
			user.save()
			return Response({'username':request.data['username']}, status=status.HTTP_201_CREATED)
		except Exception as e:
			print(e)
			return Response({'error':'Invalid Parameters'}, status=status.HTTP_400_BAD_REQUEST)

	# Update a user's password
	def patch(self, request):
		valid, msg = validateRequest(request, 'user')
		if not valid:
			return Response({'error':msg}, status='403')
			
		if not self.validatePatch(request):
			return Response({'error':'Invalid Parameters'}, status='400')

		# Generate a salt
		salt = str(urandom(64))

		# Calculate sha256 hash of password + hash
		sha = hashlib.sha256()
		preHash = salt + request.data.password
		sha.update(preHash.encode())
		passwordHash = hash.hexdigest()

		try:
			user = Users.objects.get(username=request.data['username'])
			user.salt = salt
			user.passwordHash = passwordHash
			user.Save()
			return Response({'username':username}, status=status.HTTP_201_CREATED)
		except:
			return Response({'error':'Invalid Parameters'}, status=status.HTTP_400_BAD_REQUEST)
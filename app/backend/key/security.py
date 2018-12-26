from os import urandom
from base64 import urlsafe_b64encode, urlsafe_b64decode
import time
import hashlib
import json
import hmac
from rest_framework.response import Response

# Cryptographic key for signing tokens
key = b""

# Generates a signed JSON Web Token
def buildToken(username, role):
	global key
	expireTime = round(time.time()) + 57600 # Tokens expire in 16 hours to mitigate token theft.
	tokenHeader = urlsafe_b64encode(json.dumps({'alg':'HS256', 'typ':'JWT'}).encode('utf8'))
	tokenBody = urlsafe_b64encode(json.dumps({'username': username, 'role': role, 'exp': expireTime}).encode('utf8'))

	hs256 = hmac.new(key, msg=(str(tokenHeader) + '.' + str(tokenBody)).encode(), digestmod=hashlib.sha256)
	tokenSignature = urlsafe_b64encode(hs256.digest())
	print("encoded signature")
	print(hs256.digest().hex())
	print(tokenHeader)
	print(tokenBody)
	return tokenHeader.decode('ascii') + "." + tokenBody.decode('ascii') + "." + tokenSignature.decode('ascii')

# Checks if a token is valid for a given role
# Returns true if valid, else returns false
def validateToken(token, role):
	components = token.split('.')
	if len(components) != 3: 
		return False, "Invalid Token"

	try: 
		tokenHeader = json.loads(urlsafe_b64decode(components[0].encode('ascii').decode()))
		tokenBody = json.loads(urlsafe_b64decode(components[1].encode('ascii').decode()))
		tokenSignature = urlsafe_b64decode(components[2].encode('ascii'))
	
		# Validate header
		if tokenHeader['alg'] != 'HS256' or tokenHeader['typ'] != 'JWT':
			return False, "Invalid Token"

		# Validate body
		if tokenBody['role'] != role:
			return False, "Insufficient Permissions"

		if tokenBody['exp'] <= time.time():
			return False, "Invalid Token"

		# Validate signature
		header = components[0].encode('ascii')
		body = components[1].encode('ascii')
		signedHash = hmac.new(key, msg=(str(header) + '.' + str(body)).encode(), digestmod=hashlib.sha256)
		if signedHash.digest() != tokenSignature:
			return False, "Invalid Token"

	except Exception as e:
		return False, "Invalid Token"

	return True, "Validated"

def validateRequest(request, role):
	if not 'HTTP_AUTHORIZATION' in request.META:
		return False, "Missing Token"

	return validateToken(request.META['HTTP_AUTHORIZATION'], role)

# To be called on startup
# Generates a cryptographically random key
def setup():
	global key
	print('Generating key')
	key = urandom(64)
	print(key.hex())
	
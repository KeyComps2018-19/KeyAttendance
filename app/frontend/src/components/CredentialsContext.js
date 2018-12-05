import React from 'react';

export const CredentialsContext = React.createContext({
	token: '',
	updateToken: () => {},
});
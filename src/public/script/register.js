const elements = {
	username: id('username'),
	password: id('password'),
	submit: id('submit')
}

const RegisterOpcode = 
{
	ACCOUNT_CREATED: 0,
	ACCOUNT_EXISTS_ALREADY: 1,
	INVALID_USERNAME: 2,
	INVALID_PASSWORD: 3
}

const sendForm = () => {
	console.log('Sending register request to server...');
	
	axios.post('/api/register', {
		username: elements.username.value,
		password: elements.password.value
	}).then((response) => {
		const data = response.data;
		
		if (data == RegisterOpcode.ACCOUNT_EXISTS_ALREADY)
		{
			console.log('Server responoded with ACCOUNT_EXISTS_ALREADY');
			updateMessage('Account exists already!');
			return;
		}
		
		if (data == RegisterOpcode.INVALID_USERNAME)
		{
			console.log('Server responoded with INVALID_USERNAME');
			updateMessage('Username is invalid!');
			return;
		}
		
		if (data == RegisterOpcode.INVALID_PASSWORD)
		{
			console.log('Server responded with INVALID_PASSWORD');
			updateMessage('Password is invalid!');
			return;
		}
		
		if (data == RegisterOpcode.ACCOUNT_CREATED) 
		{
			console.log('Server responded with ACCOUNT_CREATED');
			updateMessage('Account created successfully!');
			return;
		}
	}).catch((error) => {
		console.log(error);
	});
}

elements.submit.addEventListener('click', () => {
	if (!validUsername(elements.username))
		return;
	
	if (!validPassword(elements.password))
		return;
	
	sendForm();
});
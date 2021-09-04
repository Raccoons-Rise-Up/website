const elements = {
	username: id('username'),
	password: id('password'),
	submit: id('submit')
}

const LoginOpcode =
{
	LoginSuccess: 0,
	InvalidUsernameOrPassword: 1,
	AccountDoesNotExist: 2,
	PasswordsDoNotMatch: 3
}

elements.submit.addEventListener('click', () => {
	elements.username.value = elements.username.value.trim()
	sendForm();
});

const sendForm = () => {
	axios.post('/api/login', {
		username: elements.username.value,
		password: elements.password.value,
		from: 'Web-Client'
	}).then((response) => {
		const data = response.data;
		const opcode = data.opcode;
		const message = data.message;

		switch (opcode) {
			case LoginOpcode.AccountDoesNotExist:
			case LoginOpcode.InvalidUsernameOrPassword:
			case LoginOpcode.PasswordsDoNotMatch:
			case LoginOpcode.LoginSuccess:
				updateMessage(message)
				break
		}
	}).catch((error) => {
		const res = error.response
		const status = res.status

		switch (status) {
			case 405:
				updateMessage('Web server is offline')
				break;
			case 429:
				updateMessage(error.response.data)
				break;
		}
	});
}
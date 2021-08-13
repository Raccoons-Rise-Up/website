const updateMessage = (text) => {
    const element = document.getElementById('message')
    element.style.visibility = 'visible'
    element.innerHTML = text
}

const validEmail = (element) => {
    if (!/^\S+@\S+$/.test(element.value) || element.value === "") {
        updateMessage('Invalid email')
        return false
    }
    
    if (element.value.length < 4 || element.value.length > 50) {
        updateMessage('Email must be between 4 and 50 characters')
        return false
    }

    return true
}

const validUsername = (element) => {
    if (!/[a-zA-Z0-9_]/.test(element.value) || element.value === "") {
        updateMessage('Username must contain only alphanumeric characters')
        return false
    }
    
    if (element.value.length < 2 || element.value.length > 20) {
        updateMessage('Username must be between 2 to 20 characters')
        return false
    }

    return true
}

const validPassword = (element) => {
    if (element.value === "" || element.value.length < 5 || element.value.length > 200) {
        updateMessage('Password must be between 5 to 200 characters')
        return false
    }

    return true
}

const validConfirmPassword = (password, confirmPassword) => {
    if (password.value !== confirmPassword.value || confirmPassword.value === '') {
        updateMessage('Passwords do not match')
        return false
    }

    return true
}
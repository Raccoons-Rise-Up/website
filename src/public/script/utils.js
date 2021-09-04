const id = (id) => document.getElementById(id)
const removeMessage = (id) => {
    const element = document.getElementById(id)
    if (element != null) element.parentNode.removeChild(element)
}
const updateMessage = (text) => {
    const element = document.getElementById('message')
    element.style.visibility = 'visible'
    element.innerHTML = text
}
const {useState, useEffect} = React
// import React, {useState} from 'react'

function Test(){
    const [counter, setCounter] = useState(1)

    function render(){return(
        <div>
            <h1>Hello World</h1>
            <h2>Counter: {counter}</h2>
            <button onClick={addCounter} value='1'>Add 1</button>
        </div>
    )}

    function addCounter(e){
        setCounter(counter+parseInt(e.target.value))
    }

    return render()
}

document.addEventListener('DOMContentLoaded', function(){
    ReactDOM.render(<Test/>, document.querySelector('#react'))
})
const {
  useState,
  useEffect
} = React; // import React, {useState} from 'react'

function Test() {
  const [counter, setCounter] = useState(1);

  function render() {
    return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", null, "Hello World"), /*#__PURE__*/React.createElement("h2", null, "Counter: ", counter), /*#__PURE__*/React.createElement("button", {
      onClick: addCounter,
      value: "1"
    }, "Add 1"));
  }

  function addCounter(e) {
    setCounter(counter + parseInt(e.target.value));
  }

  return render();
}

document.addEventListener('DOMContentLoaded', function () {
  ReactDOM.render( /*#__PURE__*/React.createElement(Test, null), document.querySelector('#react'));
});
import * as React from 'react';
import * as ReactDOM from 'react-dom';

class App extends React.Component<any, any> {
    render() {
        return (
            <h1>Hello, Seona!</h1>
        )
    }
}

ReactDOM.render(<App/>, document.querySelector('body'));
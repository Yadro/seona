
import * as React from 'react';

const text = 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Accusamus cum distinctio doloribus dolorum ea error et facere illo incidunt ipsam iste maiores non omnis perferendis quasi, quidem quo reprehenderit sit.';

export default class Help extends React.Component<any, any> {
    constructor(props) {
        super(props);
        this.onClick = this.onClick.bind(this);
        this.state = {
            show: false
        }
    }

    onClick() {
        this.setState({show: !this.state.show});
    }

    render() {
        return (
            <div>
                <a onClick={this.onClick} href="#">{this.state.show ? '-' : '+'} help</a>
                {this.state.show ?
                    <div>{text}</div>: null}
                <br/><br/>
            </div>
        )
    }
}
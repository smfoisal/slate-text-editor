import React, {Component} from 'react';
import SlateEditor from './components/SlateEditor'
import DocList from './components/DocList'

class App extends Component {
    constructor (props) {
        super (props);
        this.state = {
            document: null
        }
    }
    loadDocument = index => {
        console.log('loadDocument', index);
        this.setState({document: index});
    };
    render() {
        const {document} = this.state;
        return (
            <div className="wrapper">
                <div className="clList">
                    <DocList loadDocument={this.loadDocument}/>
                </div>
                <div className="clEditor">
                    <SlateEditor document={document}/>
                </div>
            </div>
        );
    }
}

export default App;

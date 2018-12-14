import React, {Component} from 'react';
import { Editor } from 'slate-react'
import { Value } from 'slate';
import Toolbar from './Toolbar';
import '../assets/css/css_slate.css';
import MaterialIcon from 'material-icons-react';

const initialValue = Value.fromJSON({
    document: {
        nodes: [
            {
                object: 'block',
                type: 'paragraph',
                nodes: [
                    {
                        object: 'text',
                        leaves: [
                            {
                                text: 'A line of text in a paragraph.',
                            },
                        ],
                    },
                ],
            },
        ],
    },
})

class SlateEditor extends Component {
    constructor (props) {
        super(props);
        this.state = {
            value: initialValue,
        }
    }

    onChange = ({ value }) => {
        this.setState({ value })
    }

    render() {
        return (
            <div className="wrapper">
                <div className="column_3">
                    <div className="composeNew">
                        <button className="composeBtn">
                            <MaterialIcon icon="add_circle" size={24} />
                            Compose
                        </button>
                    </div>
                </div>
                <div className="column_9">
                    <div className="slateBox">
                        <Toolbar />
                        <Editor
                            value={this.state.value}
                            onChange={this.onChange}
                        />
                    </div>
                </div>
            </div>
        );
    }
}

export default SlateEditor;
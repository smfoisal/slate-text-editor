import React, {Component} from 'react';
import { Editor } from 'slate-react'
import { Value } from 'slate';
import Toolbar from './Toolbar';
import '../assets/slate.css';

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
                <Toolbar />
                <Editor value={this.state.value} onChange={this.onChange} />
            </div>
        );
    }
}

export default SlateEditor;
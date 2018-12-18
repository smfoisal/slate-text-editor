import React, {Component, Fragment} from 'react';
import { Value } from 'slate';
import { Editor } from 'slate-react';
import MaterialIcon from 'material-icons-react';
import {getBase64, insertImage} from '../handler';
import '../assets/css/index.css';

const DEFAULT_NODE = 'paragraph';
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
});
const toolbarIconColor = '#90A4AE';

class SlateRichEditor extends Component {

    constructor (props) {
        super (props);
        this.state = {
            docIndex: null,
            value: initialValue,
            title: 'Untitled Document',
        }
    }
    componentDidMount () {
        const {document} = this.props;

        console.log(document);

        if(document !== null) {
            let list = localStorage.getItem('doc_list');
            list = list === null ? [] : JSON.parse(list);
            this.setState({
                docIndex: document,
                value: list[document].body,
            });
        }
        console.log(this.state.docIndex);
    }
    onChange = ({ value }) => {
        this.setState({value});
    }

    hasMark = type => {
        const { value } = this.state;
        return value.activeMarks.some(mark => mark.type === type);
    }
    hasBlock = type => {
        const { value } = this.state;
        return value.blocks.some(node => node.type === type);
    }

    onKeyDown = (event, editor, next) => {

        const TAB_KEY = 9;
        if( event.keyCode === TAB_KEY ) {
            event.preventDefault();

            const { value } = editor;
            const { document } = value;

            const isList = value.blocks.some(block => block.type === 'list-item');
            const isUl =  value.blocks.some(block => {
                return !!document.getClosest(block.key, parent => parent.type === 'bulleted-list')
            });

            if(event.shiftKey) {
                editor.unwrapBlock(isUl ? 'bulleted-list' : 'numbered-list');

                const listEnds =  value.blocks.some(block => {
                    return !!document.getClosest(block.key, parent => parent.type === 'bulleted-list' || parent.type === 'numbered-list')
                });
                console.log(listEnds)

                if(!listEnds)
                    editor.setBlocks(DEFAULT_NODE);

                return;
            }

            if (isList)
                editor
                    .setBlocks('list-item')
                    .wrapBlock(isUl ? 'bulleted-list' : 'numbered-list');

            return;
        }
        return next();
    }

    onClickMark = (event, type) => {
        event.preventDefault()
        this.editor.toggleMark(type)
    }

    onClickBlock = (event, type) => {
        event.preventDefault();

        const { editor } = this;
        const { value } = editor;
        const { document } = value;

        // Handle everything but list buttons.
        if (type !== 'bulleted-list' && type !== 'numbered-list') {
            const isActive = this.hasBlock(type);
            const isList = this.hasBlock('list-item');

            if (isList) {
                editor
                    .setBlocks(isActive ? DEFAULT_NODE : type)
                    .unwrapBlock('bulleted-list')
                    .unwrapBlock('numbered-list');
            } else {
                editor.setBlocks(isActive ? DEFAULT_NODE : type);
            }
        } else {
            // Handle the extra wrapping required for list buttons.
            const isList = this.hasBlock('list-item');
            const isType = value.blocks.some(block => {
                return !!document.getClosest(block.key, parent => parent.type === type)
            });

            if (isList && isType) {
                editor
                    .setBlocks(DEFAULT_NODE)
                    .unwrapBlock('bulleted-list')
                    .unwrapBlock('numbered-list');
            } else if (isList) {
                editor
                    .unwrapBlock(type === 'bulleted-list' ? 'numbered-list' : 'bulleted-list')
                    .wrapBlock(type);
            } else {
                editor.setBlocks('list-item').wrapBlock(type);
            }
        }
    }

    onClickImage = event => {
        event.preventDefault()
        const src = window.prompt('Enter the URL of the image:')
        if (!src) return
        this.editor.command(insertImage, src)
    }

    onUploadImage = event => {
        const selectedFile= event.target.files[0];
        getBase64(selectedFile).then(base64 => {
            this.editor.command(insertImage, base64)
        });
    };

    saveDoc = () => {
        const {value, title} = this.state;
        const list= localStorage.getItem('doc_list');

        let docList = list !== null ? JSON.parse(list) : [];
        console.log(docList);

        const content = {
            title: title,
            time: Date.now(),
            body: value.toJSON()
        }
        docList.push(content);

        localStorage.setItem('doc_list', JSON.stringify(docList));
    };

    cancelDoc = () => {

    }

    /**
     * RENDER METHODS
     */
    render() {
        const {value, title} = this.state;
        return (
            <div className='slateContainer'>
                <div className="titleBar">
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => this.setState({title: e.target.value})}
                    />
                    <div className='actionButtons'>
                        <button onClick={this.saveDoc}>Save</button>
                        <button onClick={this.cancelDoc}>Cancel</button>
                    </div>
                </div>
                <Fragment>
                    <div className='toolbar'>
                        {this.renderMarkButton('bold', 'format_bold')}
                        {this.renderMarkButton('italic', 'format_italic')}
                        {this.renderMarkButton('underlined', 'format_underlined')}
                        {this.renderMarkButton('code', 'code')}
                        {this.renderBlockButton('heading-one', 'looks_one')}
                        {this.renderBlockButton('heading-two', 'looks_two')}
                        {this.renderBlockButton('block-quote', 'format_quote')}
                        {this.renderBlockButton('numbered-list', 'format_list_numbered')}
                        {this.renderBlockButton('bulleted-list', 'format_list_bulleted')}
                        <div className="imgSection">
                            <span>Add Image:</span>
                            {this.renderImageButton()}
                            {this.renderUploadImageButton()}
                        </div>
                    </div>
                    <Editor
                        placeholder="Enter some text..."
                        ref={(editor) => this.editor = editor}
                        className='editor'
                        value={value}
                        onChange={this.onChange}
                        onKeyDown={this.onKeyDown}
                        renderNode={this.renderNode}
                        renderMark={this.renderMark}
                    />
                </Fragment>

            </div>
        );
    }

    renderMarkButton = (type, icon) => {
        // const isActive = this.hasMark(type);
        return (
            <button
                onMouseDown={event => this.onClickMark(event, type)}
                className='iconButton'>
                <MaterialIcon
                    icon={icon}
                    color={toolbarIconColor}
                    size='tiny'
                />
            </button>
        )
    }

    renderBlockButton = (type, icon) => {
        let isActive = this.hasBlock(type);
        if (['numbered-list', 'bulleted-list'].includes(type)) {
            const { value: { document, blocks } } = this.state;
            if (blocks.size > 0 && blocks.first()) {
                const parent = document.getParent(blocks.first().key)
                isActive = this.hasBlock('list-item') && parent && parent.type === type
            }
        }
        return (
            <button
                onMouseDown={event => this.onClickBlock(event, type)}
                className='iconButton'
            >
                <MaterialIcon
                    icon={icon}
                    color={toolbarIconColor}
                    size='tiny'
                />
            </button>
        )
    }

    renderImageButton = () => {
        return (
            <button
                onMouseDown={this.onClickImage}
                className='iconButton'>
                <MaterialIcon
                    icon='insert_link'
                    color={toolbarIconColor}
                    size='tiny'
                />
            </button>
        );
    }

    renderUploadImageButton = () => {
        return (
            <button
                id="test"
                onMouseDown={() =>  this.refs.fileField.click()}
                className='iconButton'>
                <input
                    ref="fileField"
                    type="file"
                    name="image1"
                    accept=".jpg,.jpeg,.png,.gif,.bmp"
                    style={{display: 'none'}}
                    onChange={this.onUploadImage} />
                <MaterialIcon
                    icon='add_photo_alternate'
                    color={toolbarIconColor}
                    size='tiny'
                />
            </button>
        );
    }

    renderNode = (props, editor, next) => {
        const { attributes, children, node, isFocused } = props

        switch (node.type) {
            case 'block-quote':
                return <blockquote {...attributes}>{children}</blockquote>
            case 'bulleted-list':
                return <ul {...attributes}>{children}</ul>
            case 'heading-one':
                return <h1 {...attributes}>{children}</h1>
            case 'heading-two':
                return <h2 {...attributes}>{children}</h2>
            case 'list-item':
                return <li {...attributes}>{children}</li>
            case 'numbered-list':
                return <ol {...attributes}>{children}</ol>
            case 'image':
                const src = node.data.get('src')
                return  <img src={src}
                             alt='img'
                             selected={isFocused} {...attributes}
                             className='editorImg'/>
            default:
                return next()
        }
    }

    renderMark = (props, editor, next) => {
        const { children, mark, attributes } = props

        switch (mark.type) {
            case 'bold':
                return <strong {...attributes}>{children}</strong>
            case 'code':
                return <code {...attributes}>{children}</code>
            case 'italic':
                return <em {...attributes}>{children}</em>
            case 'underlined':
                return <u {...attributes}>{children}</u>
            default:
                return next()
        }
    }
}

export default SlateRichEditor;
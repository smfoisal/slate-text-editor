import React, {Component, Fragment} from 'react';
import { Value } from 'slate';
import { Editor, getEventRange, getEventTransfer } from 'slate-react';
import MaterialIcon from 'material-icons-react';
import isUrl from 'is-url';
import imageExtensions from 'image-extensions';

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

function isImage(url) {
    return !!imageExtensions.find(url.endsWith)
}
function insertImage(editor, src, target) {
    if (target) {
        editor.select(target)
    }

    editor.insertBlock({
        type: 'image',
        data: { src },
    })
}
class SlateRichEditor extends Component {
    constructor (props) {
        super (props);
        this.state = {
            value: initialValue,
        }
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
            if (blocks.size > 0) {
                const parent = document.getParent(blocks.first().key)
                isActive = this.hasBlock('list-item') && parent && parent.type === type
            }
        }
        return (
            <button
                onMouseDown={event => this.onClickBlock(event, type)}
                className='iconButton'>
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
                    icon='add_photo_alternate'
                    color={toolbarIconColor}
                    size='tiny'
                />
            </button>
        );
    }

    renderUploadImageButton = () => {
        return (
            <div>
                <input type="file" style={{display: 'none'}} />
                <button
                    onMouseDown={this.uploadImage}
                    className='iconButton'>
                    <MaterialIcon
                        icon='attach_file'
                        color={toolbarIconColor}
                        size='tiny'
                    />
                </button>
            </div>
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

    onDropOrPaste = (event, editor, next) => {
        const target = getEventRange(event, editor)
        if (!target && event.type === 'drop') return next()

        const transfer = getEventTransfer(event)
        const { type, text, files } = transfer

        if (type === 'files') {
            for (const file of files) {
                const reader = new FileReader()
                const [mime] = file.type.split('/')
                if (mime !== 'image') continue

                reader.addEventListener('load', () => {
                    editor.command(insertImage, reader.result, target)
                })

                reader.readAsDataURL(file)
            }
            return
        }

        if (type === 'text') {
            if (!isUrl(text)) return next()
            if (!isImage(text)) return next()
            editor.command(insertImage, text, target)
            return
        }

        next()
    }

    render() {
        const {value} = this.state;
        return (
            <div className='slateContainer'>
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
                        ref={(editor) => this.editor = editor}
                        placeholder="Enter some text..."
                        className='editor'
                        value={value}
                        onChange={this.onChange}
                        onKeyDown={this.onKeyDown}
                        renderNode={this.renderNode}
                        renderMark={this.renderMark}
                        onDrop={this.onDropOrPaste}
                        onPaste={this.onDropOrPaste}
                    />
                </Fragment>
            </div>
        );
    }
}


export default SlateRichEditor;
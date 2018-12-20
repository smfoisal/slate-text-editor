import React, {PureComponent, Fragment} from 'react'
import { Editor, getEventRange, getEventTransfer } from 'slate-react'
import { Block, Value } from 'slate'
import isUrl from 'is-url'
import {connect} from 'react-redux'
import Plain from 'slate-plain-serializer'
import * as actions from '../actions'
import MaterialIcon from 'material-icons-react'
import WordCount from './plugin/wordCount'
import {getBase64, insertImage, isImage} from './handler'
import '../assets/css/index.css'

const DEFAULT_NODE = 'paragraph';
const defaultTitle = 'Untitled Document'
const initialValue = Plain.deserialize('');
const schema = {
    document: {
        last: { type: 'paragraph' },
        normalize: (editor, { code, node, child }) => {
            switch (code) {
                case 'last_child_type_invalid': {
                    const paragraph = Block.create('paragraph')
                    return editor.insertNodeByKey(node.key, node.nodes.size, paragraph)
                }
            }
        },
    },
    blocks: {
        image: {
            isVoid: true,
        },
    },
}
const plugins = [WordCount()];

class SlateRichEditor extends PureComponent {

    constructor (props) {
        super (props);
        this.state = {
            value: initialValue,
            title: defaultTitle,
            loadDocIndex: null,
        }
    }

    componentDidUpdate () {
        if (this.state.loadDocIndex !== null && typeof this.props.loadDoc === typeof undefined) {
            this.setState({
                value: initialValue,
                title: defaultTitle,
                loadDocIndex: null,
            });
            return;
        }
        if (typeof this.props.loadDoc === typeof undefined) return;

        const {loadDoc, document} = this.props;
        const {loadDocIndex} = this.state;

        // Check if new Document is selected
        if (loadDocIndex !== loadDoc) {
            // New document is selected from the Left List
            const value = Value.fromJSON(document.body);

            this.setState({
                title: document.title,
                loadDocIndex: loadDoc,
                value: value,
            });
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
            try {
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
            } catch (e) {
                // handle error here!
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

    saveDoc = () => {
        const {value, title} = this.state;

        if(Plain.serialize(value).replace(/\s/g, '') === '') {
            window.alert("Can not save blank Document!");
            return;
        }

        // Save new Article!
        if (typeof this.props.loadDoc === typeof undefined) {
            const payload = {
                title: title,
                time: Date.now(),
                body: value
            }
            this.props.addNewDoc (payload);
            return;
        }

        // update old Article
        const {loadDoc} = this.props;
        const payload = {
            index: loadDoc,
            title: title,
            time: Date.now(),
            body: value
        }
        this.props.updateDoc (payload);
    };

    cancelDoc = () => {
        if (typeof this.props.loadDoc === typeof undefined) {
            this.setState({
                title: defaultTitle,
                value: initialValue,
            });
            return;
        }
        const {loadDoc, document} = this.props;
        const value = Value.fromJSON(document.body);

        this.setState({
            title: document.title,
            loadDocIndex: loadDoc,
            value: value,
        });
    }

    deleteDoc = () => {
        if (window.confirm('Are you sure Delete This Document?')) {
            this.props.deleteDoc(this.props.loadDoc);
            this.props.composeNew();
        }
    }

    /**
     * RENDER METHODS
     */
    render() {
        const {value, title} = this.state;
        const {loadDoc} = this.props;

        return (
            <div>
                <div className='slateContainer'>
                    <div className="titleBar">
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => this.setState({title: e.target.value})}
                        />
                        <div className='actionButtons'>
                            <button onClick={this.saveDoc}>
                                {typeof loadDoc !== typeof undefined ? <div>Update</div> : <div>Save</div>}
                            </button>
                            <button onClick={this.cancelDoc}>Cancel</button>
                        </div>
                    </div>
                    <Fragment>
                        <div className='toolbar'>
                            <div style={{display: 'flex', flexDirection: 'row'}}>
                                {this.renderMarkButton('bold', 'format_bold')}
                                {this.renderMarkButton('italic', 'format_italic')}
                                {this.renderMarkButton('underlined', 'format_underlined')}
                                {this.renderMarkButton('code', 'code')}
                                {this.renderBlockButton('heading-one', 'looks_one')}
                                {this.renderBlockButton('heading-two', 'looks_two')}
                                {this.renderBlockButton('block-quote', 'format_quote')}
                                {this.renderBlockButton('numbered-list', 'format_list_numbered')}
                                {this.renderBlockButton('bulleted-list', 'format_list_bulleted')}
                            </div>
                            <div className="imgSection">
                                <span>Add Image:</span>
                                {this.renderImageButton()}
                                {this.renderUploadImageButton()}
                            </div>
                        </div>
                        <Editor
                            plugins={plugins}
                            placeholder="Enter some text..."
                            ref={(editor) => this.editor = editor}
                            className='editor'
                            value={value}
                            onChange={this.onChange}
                            onKeyDown={this.onKeyDown}
                            schema={schema}
                            onDrop={this.onDropOrPaste}
                            onPaste={this.onDropOrPaste}
                            renderNode={this.renderNode}
                            renderMark={this.renderMark}
                        />
                    </Fragment>
                </div>
                {typeof loadDoc !== typeof undefined ?
                    <button className="deleteButton" onClick={this.deleteDoc}>
                        Delete This Document
                    </button> : null
                }
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
                    color='#90A4AE'
                    size='tiny'
                />
            </button>
        )
    }

    renderBlockButton = (type, icon) => {
        // let isActive = this.hasBlock(type);
        // if (['numbered-list', 'bulleted-list'].includes(type)) {
        //     const { value: { document, blocks } } = this.state;
        //     if (blocks.size > 0 && blocks.first()) {
        //         const parent = document.getParent(blocks.first().key)
        //         isActive = this.hasBlock('list-item') && parent && parent.type === type
        //     }
        // }
        return (
            <button
                onMouseDown={event => this.onClickBlock(event, type)}
                className='iconButton'
            >
                <MaterialIcon
                    icon={icon}
                    color='#90A4AE'
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
                    color='#90A4AE'
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
                    color='#90A4AE'
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
                             style={isFocused? {borderWidth: 1, borderColor: 'grey'}:null}
                             {...attributes}
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

const mapStateToProps = state => {
    if(state.loadDoc !== null) {
        return {
            document: state.documents[state.loadDoc],
            loadDoc: state.loadDoc,
            valid: state.valid
        }
    }
    return {};
};

export default connect(mapStateToProps,actions)(SlateRichEditor);
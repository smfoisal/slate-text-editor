import React, {PureComponent, Fragment} from 'react'
import { Editor, getEventRange, getEventTransfer } from 'slate-react'
import { Value } from 'slate'
import isUrl from 'is-url'
import Plain from 'slate-plain-serializer'
import MaterialIcon from 'material-icons-react'
import '../assets/css/index.css'

// redux libraries
import {connect} from 'react-redux'
import * as actions from '../actions'

// Slate custom Libraries
import schema from '../slate/schema'
import value from '../slate/initValue.json'
import {onDropOrPaste, onKeyDown} from "../slate/lib";
import {renderMark, renderNode} from "../slate/renderer";
import WordCount from '../slate/plugin/wordCount'
import {getBase64, insertImage, isImage} from '../slate/handler'

// import components
import {MarkButton, BlockButton, ImageButton, UploadImageButton} from './toolbar'
/**
 * VARS
 */
const DEFAULT_NODE = 'paragraph';
const defaultTitle = 'Untitled Document';
const initialValue = Value.fromJSON(value);
const plugins = [WordCount()];

/**
 * MAIN
 */
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

    //
    onChange = ({ value }) => {
        this.setState({value});
    }

    // CHECK IF SLECTED SECTION IS MARKED
    hasMark = type => {
        const { value } = this.state;
        return value.activeMarks.some(mark => mark.type === type);
    }

    // CHECK IF BLOCK SECTION IS MARKED
    hasBlock = type => {
        const { value } = this.state;
        return value.blocks.some(node => node.type === type);
    }

    // UPDATE MARK ON SELECTED SECTION
    onClickMark = (event, type) => {
        event.preventDefault()
        this.editor.toggleMark(type)
    }

    // UPDATE MARK ON SELECTED SECTIONS FULL BLOCK
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

    // ADD IMAGE URL ON PRESS
    onClickImage = event => {
        event.preventDefault()
        const src = window.prompt('Enter the URL of the image:')
        if (!src) return
        this.editor.command(insertImage, src)
    }

    // UPLOAD IMAGE EVENT
    onUploadImage = event => {
        const selectedFile= event.target.files[0];
        getBase64(selectedFile).then(base64 => {
            this.editor.command(insertImage, base64)
        });
    };

    // SAVE OR UPDATE DOCUMENT
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

    // RETURNS LAST SAVED DOCUMENT
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

    // DELETE DOCUMENT
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
                                <MarkButton icon='format_bold' onPress={(e) => this.onClickMark(e, 'bold') }/>
                                <MarkButton icon='format_italic' onPress={(e) => this.onClickMark(e, 'italic') }/>
                                <MarkButton icon='format_underlined' onPress={(e) => this.onClickMark(e, 'underlined') }/>
                                <MarkButton icon='code' onPress={(e) => this.onClickMark(e, 'code') }/>
                                <BlockButton icon='looks_one' onPress={(e) => this.onClickBlock(e, 'heading-one')}/>
                                <BlockButton icon='looks_two' onPress={(e) => this.onClickBlock(e, 'heading-two')}/>
                                <BlockButton icon='format_quote' onPress={(e) => this.onClickBlock(e, 'block-quote')}/>
                                <BlockButton icon='format_list_numbered' onPress={(e) => this.onClickBlock(e, 'numbered-list')}/>
                                <BlockButton icon='format_list_bulleted' onPress={(e) => this.onClickBlock(e, 'bulleted-list')}/>
                            </div>
                            <div className="imgSection">
                                <span>Add Image:</span>
                                <ImageButton onPress={this.onClickImage}/>
                                {/*<UploadImageButton onPress={this.onUploadImage}/>*/}
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
                            onKeyDown={onKeyDown}
                            schema={schema}
                            onDrop={onDropOrPaste}
                            onPaste={onDropOrPaste}
                            renderNode={renderNode}
                            renderMark={renderMark}
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

    // UPLOAD IMAGE BUTTON
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
}

/**
 * REDUX
 */
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
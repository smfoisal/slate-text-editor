import {combineReducers} from 'redux';
import DocumentReducer from './DocumentReducer'
import LoadDocumentReducer from './LoadDocumentReducer'
import ValidReducer from './ValidReducer'

export default combineReducers({
    documents: DocumentReducer,
    loadDoc: LoadDocumentReducer,
    valid: ValidReducer,
});
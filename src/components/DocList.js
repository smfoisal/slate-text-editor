import React, {PureComponent} from 'react'
import {connect} from 'react-redux'
import * as actions from '../actions'

const monthList = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

class DocList extends PureComponent {
    constructor (props) {
        super (props);
        this.state = {
            loading: true,
        }
    }

    componentDidMount () {
        this.props.initialSet();
        this.setState({
            loading: false
        })
    }

    loadDoc = index => {
        const {loadDoc} = this.props;
        if (loadDoc === index) return;

        this.props.loadDocument(index);
    }
    render() {
        const {loading} = this.state;
        const {documents, loadDoc} = this.props;
        console.log(documents);

        const docList = documents.map((doc, index) => {
            const _date = new Date(doc.time);

            const date = _date.getDate();
            const month = _date.getMonth();
            const year = _date.getFullYear();

            const hours = "0" + _date.getHours();
            const minutes = "0" + _date.getMinutes();
            const seconds = "0" + _date.getSeconds();
            const formattedTime = date + ' ' + monthList[month] + ', ' + year+ ' ' +hours.substr(-2) + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);

            return (
                <div
                    className={index === loadDoc ? "singleDocActive" : "singleDoc"}
                    key={index}
                    onClick={() => this.loadDoc(index)}>
                    <div className="docTitle">{doc.title}</div>
                    <div className="docUpdate">
                        {formattedTime}
                    </div>
                </div>
            );
        });
        const noDoc = (
            <div className="infoText">
                No Document Found
            </div>
        );
        const checkNew = loadDoc === null ? true : false;

        if(!loading) {
            return (
                <div>
                    <button
                        className="composeNewButton"
                        onClick={() => this.props.composeNew()}
                        disabled={checkNew}>
                        Compose New
                    </button>
                    <div className="listContainer">
                        { documents.length > 0 ? docList : noDoc }
                    </div>
                </div>
            );
        }
        return (
            <div className="listContainer">
                <div className="infoText">
                    Loading ...
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => {
    return {
        documents: state.documents,
        loadDoc: state.loadDoc
    }
};

export default connect(mapStateToProps, actions)(DocList);
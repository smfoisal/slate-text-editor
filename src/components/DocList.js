import React, {Component} from 'react';

const monthList = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

class DocList extends Component {
    constructor (props) {
        super (props);
        this.state = {
            loading: true,
            list: []
        }
    }

    componentDidMount () {
        let list = localStorage.getItem('doc_list');
        list = list === null ? [] : JSON.parse(list);

        this.setState({
            list: list,
            loading: false
        })
    }
    loadDoc = index => {
        this.props.loadDocument(index);
    }
    render() {
        const {loading, list} = this.state;

        const docList = list.map((doc, index) => {
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
                    className="singleDoc"
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

        if(!loading) {
            return (
                <div className="listContainer">
                    { list.length > 0 ? docList : noDoc }
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

export default DocList;
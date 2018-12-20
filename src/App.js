import React, {Component} from 'react'
import {Provider} from 'react-redux'
import {createStore} from 'redux'
import reducers from './reducers'
import SlateEditor from './components/SlateEditor'
import DocList from './components/DocList'
import Header from './components/common/Header'

const store = createStore(reducers);


class App extends Component {

    render() {
        return (
            <Provider store={store}>
                <div>
                    <Header />
                    <div className="wrapper">
                        <div className="clList">
                            <DocList />
                        </div>
                        <div className="clEditor">
                            <SlateEditor />
                        </div>
                    </div>
                </div>
            </Provider>
        );
    }

}

export default App;

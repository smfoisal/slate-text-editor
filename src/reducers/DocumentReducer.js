const list= localStorage.getItem('doc_list');

let docList = list !== null ? JSON.parse(list) : [];

export default (state = [], action) => {
    switch (action.type) {
        case 'initial_set':
            return docList;

        case 'add_new_document':
            docList = [
                ...state,
                action.payload
            ];
            localStorage.setItem('doc_list', JSON.stringify(docList));
            return docList;

        case 'update_document':
            const newList = state.map((doc, index) => {
                if (index === action.payload.index) {
                    return {
                        ...doc,
                        title: action.payload.title,
                        time: action.payload.time,
                        body: action.payload.body
                    };
                } else return {...doc}
            });
            localStorage.setItem('doc_list', JSON.stringify(newList));
            return newList;

        case 'delete_document':
            let newArr = [...state.filter((elem, idx) => { // [1,2,3,5]
                return idx !== action.index
            })];
            localStorage.setItem('doc_list', JSON.stringify(newArr));
            return newArr;

        default:
            return state;
    }
};
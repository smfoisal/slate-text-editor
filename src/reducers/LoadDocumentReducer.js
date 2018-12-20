export default (state = null, action) => {
    switch (action.type) {
        case 'load_document':
            return action.index;
        case 'go_to_compose':
            return null;
        default:
            return state;
    }
};
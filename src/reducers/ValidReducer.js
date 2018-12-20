export default (state = true, action) => {
    switch (action.type) {
        case 'limit_crossed':
            return false;
        default:
            return state;
    }
};
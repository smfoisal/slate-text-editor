export const initialSet = () => {
    return {
        type: 'initial_set',
    };
};

export const composeNew = () => {
    return {
        type: 'go_to_compose',
    };
};

export const loadDocument = payload => {
    return {
        type: 'load_document',
        index: payload
    }
};

export const addNewDoc = payload => {
    return {
        type: 'add_new_document',
        payload: payload
    }
};

export const updateDoc = payload => {
    return {
        type: 'update_document',
        payload: payload
    }
};
export const limitCrossed = () => {
    return {
        type: 'limit_crossed',
    }
};

export const deleteDoc = index => {
    return {
        type: 'delete_document',
        index: index
    }
}
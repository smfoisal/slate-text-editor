import React from 'react';

const IconButton = props => {
    return (
        <span style={{padding: 8, display: 'flex', flexDirection: 'row', cursor: 'pointer'}}>
            {props.children}
        </span>
    );
};

export { IconButton };
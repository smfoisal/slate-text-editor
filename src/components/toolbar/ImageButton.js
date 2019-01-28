import React from 'react'
import MaterialIcon from "material-icons-react"
import '../../assets/css/index.css'

const ImageButton = props => {
    const {icon, onPress} = props;
    return (
        <button
            onMouseDown={onPress}
            className='iconButton'>
            <MaterialIcon
                icon='insert_link'
                color='#90A4AE'
                size='tiny'
            />
        </button>
    );
}

export {ImageButton};
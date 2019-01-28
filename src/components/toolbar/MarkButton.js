import React from 'react'
import MaterialIcon from "material-icons-react"
import '../../assets/css/index.css'

const MarkButton = props => {
    const {icon, onPress} = props;
    return (
        <button
            onMouseDown={onPress}
            className='iconButton'>
            <MaterialIcon
                icon={icon}
                color='#90A4AE'
                size='tiny'
            />
        </button>
    );
}

export {MarkButton};
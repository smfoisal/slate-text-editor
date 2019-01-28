import React from 'react'
import MaterialIcon from "material-icons-react"
import '../../assets/css/index.css'

const UploadImageButton = props => {
    const {icon, onPress} = props;
    return (
        <button
            id="test"
            onMouseDown={() => this.refs.fileField.click()}
            className='iconButton'>
            <input
                ref="fileField"
                type="file"
                name="image1"
                accept=".jpg,.jpeg,.png,.gif,.bmp"
                style={{display: 'none'}}
                onChange={onPress} />
            <MaterialIcon
                icon='add_photo_alternate'
                color='#90A4AE'
                size='tiny'
            />
        </button>
    );
}

export {UploadImageButton};
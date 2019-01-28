import React from "react";

const renderMark = (props, editor, next) => {
    const { children, mark, attributes } = props

    switch (mark.type) {
        case 'bold':
            return <strong {...attributes}>{children}</strong>
        case 'code':
            return <code {...attributes}>{children}</code>
        case 'italic':
            return <em {...attributes}>{children}</em>
        case 'underlined':
            return <u {...attributes}>{children}</u>
        default:
            return next()
    }
}

export {renderMark};
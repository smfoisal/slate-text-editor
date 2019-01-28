import React from "react";

const renderNode = (props, editor, next) => {
    const { attributes, children, node, isFocused } = props

    switch (node.type) {
        case 'block-quote':
            return <blockquote {...attributes}>{children}</blockquote>
        case 'bulleted-list':
            return <ul {...attributes}>{children}</ul>
        case 'heading-one':
            return <h1 {...attributes}>{children}</h1>
        case 'heading-two':
            return <h2 {...attributes}>{children}</h2>
        case 'list-item':
            return <li {...attributes}>{children}</li>
        case 'numbered-list':
            return <ol {...attributes}>{children}</ol>
        case 'image':
            const src = node.data.get('src')
            return  <img src={src}
                         alt='img'
                         style={isFocused? {borderWidth: 1, borderColor: 'grey'}:null}
                         {...attributes}
                         className='editorImg'/>
        default:
            return next()
    }
}

export {renderNode};
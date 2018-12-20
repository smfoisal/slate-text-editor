import React from 'react'
import '../../assets/css/index.css'

const WordCount = options => {
    return {
        renderEditor(props, editor, next) {
            const children = next();
            const wordCount = props.value.document
                .getBlocks()
                .reduce((memo, b) => memo + b.text.trim().split(/\s+/).length, 0)

            return (
                <div>
                    <div>{children}</div>
                    <div className="wordCount">Counter: {wordCount}</div>
                </div>
            )
        },
    }
};

export default WordCount;
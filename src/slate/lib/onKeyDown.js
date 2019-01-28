import React from 'react'

const DEFAULT_NODE = 'paragraph';

// KEYBOARD KEY PRESS EVENTS
// todo: ADD MORE KEY EVENTS
const onKeyDown = (event, editor, next) => {

    const TAB_KEY = 9;
    if( event.keyCode === TAB_KEY ) {
        event.preventDefault();

        const { value } = editor;
        const { document } = value;

        const isList = value.blocks.some( block => {
            if(document.getDepth(block.key) > 3)
                return false;
            return block.type === 'list-item'
        });

        const isUl =  value.blocks.some(block => {
            return !!document.getClosest(block.key, parent => parent.type === 'bulleted-list')
        });

        if(event.shiftKey) {
            editor.unwrapBlock(isUl ? 'bulleted-list' : 'numbered-list');

            const listEnds =  value.blocks.some(block => {
                return !!document.getClosest(block.key, parent => parent.type === 'bulleted-list' || parent.type === 'numbered-list')
            });

            if(!listEnds)
                editor.setBlocks(DEFAULT_NODE);

            return;
        }

        if (isList)
            editor
                .setBlocks('list-item')
                .wrapBlock(isUl ? 'bulleted-list' : 'numbered-list');

        return;
    }
    return next();
}

export {onKeyDown};
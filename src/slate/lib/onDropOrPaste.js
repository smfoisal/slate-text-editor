import {getEventRange, getEventTransfer} from "slate-react";
import {insertImage, isImage} from "../handler";
import isUrl from "is-url";

const onDropOrPaste = (event, editor, next) => {
    const target = getEventRange(event, editor)
    if (!target && event.type === 'drop') return next()

    const transfer = getEventTransfer(event)
    const { type, text, files } = transfer

    if (type === 'files') {
        for (const file of files) {
            const reader = new FileReader()
            const [mime] = file.type.split('/')
            if (mime !== 'image') continue

            reader.addEventListener('load', () => {
                editor.command(insertImage, reader.result, target)
            })

            reader.readAsDataURL(file)
        }
        return
    }

    if (type === 'text') {
        if (!isUrl(text)) return next()
        if (!isImage(text)) return next()
        editor.command(insertImage, text, target)
        return
    }

    next()
}

export {onDropOrPaste};
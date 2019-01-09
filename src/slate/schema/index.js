import {Block} from "slate";

const schema = {
    document: {
        last: { type: 'paragraph' },
        normalize: (editor, { code, node, child }) => {
            switch (code) {
                case 'last_child_type_invalid': {
                    const paragraph = Block.create('paragraph')
                    return editor.insertNodeByKey(node.key, node.nodes.size, paragraph)
                }
                default: return;
            }
        },
    },
    blocks: {
        image: {
            isVoid: true,
        },
    },
}

export default schema;
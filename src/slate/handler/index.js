import imageExtensions from 'image-extensions'

export const getBase64 = (file) => {
    return new Promise((resolve,reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });
}

export const insertImage = (editor, src, target) => {
    if (target) {
        editor.select(target)
    }
    editor.insertBlock({
        type: 'image',
        data: { src },
    })
};

export const isImage = url => {
    return !!imageExtensions.find(url.endsWith)
}
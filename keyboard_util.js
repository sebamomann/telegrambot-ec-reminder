export function createKeyboardArrayWithWidthOf(width, elements) {
    var outputArray = [];
    var currentArray = []

    for (var i = 0; i < elements.length; i++) {
        if (i % width === 0) {
            if (i > 0) {
                outputArray.push([...currentArray]);
            }
            currentArray = [elements[i]];
        } else {
            currentArray.push(elements[i]);
        }
    }

    outputArray.push([...currentArray]);

    return [...outputArray];
}
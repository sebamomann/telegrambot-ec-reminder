export const sendMessage = function (ctx, message, options, isEdit) {
    if (isEdit) {
        ctx.editMessageText(message, options)
    } else {
        ctx.reply(message, options)
    }
}
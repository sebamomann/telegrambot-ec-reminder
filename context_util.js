export const parseUserIdFromContext = function (ctx) {
    var userId = 0;
    
    if (ctx.message?.from.id) {
        userId = ctx.message.from.id;
    } else {
        userId = ctx.callbackQuery.from.id;
    }

    return userId;
}
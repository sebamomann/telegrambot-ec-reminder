import { timeInputToSeconds, secondsToTimeObject } from "../distance_parser.js";
import * as db from "../mysql_requests.js";

export const init = async (ctx, isEdit = false) => {

}

export const create = async (ctx, eventId, isEdit = false) => {
    const event = await db.getEventById(eventId);

    var messageText = `Du möchtest also für das Event **${event.name}** eine Erinnerung erstellen. Sende mir hierzu die Zeitangabe, wie lang vorher ich dich an den Termin Erinnern soll.

Zum Beispiel

    - 1d für 1 Tag vorher
    - 10m für 10 Minuten vorher
    - 01d03h für 1 Tag und 3 Stunden vorher`;

    ctx.session.nextAction = "reminder/create_save";
    ctx.session.nextActionData = eventId;

    if (isEdit) {
        ctx.editMessageText(messageText)
    } else {
        ctx.reply(messageText)
    }
}

export const create_save = async (ctx, eventId, isEdit = false) => {
    const event = await db.getEventById(eventId);

    console.log(`Saving reminder for event ${eventId}`);

    const secondsBefore = timeInputToSeconds(ctx.message.text);
    if (secondsBefore === 0) {
        ctx.reply("Das hat nicht geklappt. Bitte gebe eine korrekte Zeitangabe an!");
    } else {
        await db.getEventById(eventId);
        await db.saveReminder(eventId, ctx.message.from.id, secondsBefore);

        var message = "Cool, das war's. Ich werde dich ";
        const timeObj = secondsToTimeObject(secondsBefore);

        if (timeObj.d) {
            message += (timeObj.d === 1 ? (timeObj.d + " Tag ") : (timeObj.d + " Tagen "));
        }

        if (timeObj.h) {
            message += (timeObj.h === 1 ? (timeObj.h + " Stunde ") : (timeObj.h + " Stunden "));
        }

        if (timeObj.m) {
            message += (timeObj.m === 1 ? (timeObj.m + " Minute ") : (timeObj.m + " Minuten "));
        }

        message += `vorher an das Event **${event.name}** erinnern!`;

        ctx.reply(message, { parse_mode: "Markdown" });

        ctx.session = null;
    }
}
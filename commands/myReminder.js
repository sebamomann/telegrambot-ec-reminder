import { timeInputToSeconds, secondsToTimeObject } from "../distance_parser.js";
import * as db from "../mysql_requests.js";

export const init = async (ctx, isEdit = false) => {
    const events = await db.getAllEvents();

    if (events.length === 0) {
        ctx.reply("Sorry, aktuell gibt es keine Veranstaltung für die eine Erinnerung einstellbar ist!")
        return;
    }

    var nrOfElements = events.length;
    var events_output = [];

    const until = nrOfElements % 2 === 0 ? nrOfElements : nrOfElements - 1;

    for (var i = 0; i <= until - 1; i += 2) {
        const element1 = { text: events[i].name, callback_data: CALLBACK_PREFIX_EVENTMENU + events[i].id };
        const element2 = { text: events[i + 1].name, callback_data: CALLBACK_PREFIX_EVENTMENU + events[i + 1].id };

        events_output.push([element1, element2]);
    }

    if (until !== nrOfElements) {
        events_output.push([{ text: events[nrOfElements - 1].name, callback_data: CALLBACK_PREFIX_EVENTMENU + events[nrOfElements - 1].id }]);
    }

    var options = {
        reply_markup: JSON.stringify({
            inline_keyboard: events_output
        })
    };

    const messageText = 'Hier sind die Veranstaltungen, für die Erinnerungen einstellbar sind!'

    if (isEdit) {
        ctx.editMessageText(messageText, options)
    } else {
        ctx.reply(messageText, options)
    }
}
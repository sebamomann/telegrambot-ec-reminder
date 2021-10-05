import * as db_event from "../mysql_request_event.js";
import * as db_reminder from "../mysql_request_reminder.js";
import * as fs from 'fs'
import { createKeyboardArrayWithWidthOf } from '../keyboard_util.js';
import { sendMessage } from '../send_util.js';
import { secondsToTimeString, timeInputToSeconds } from '../distance_parser.js';
import { parseUserIdFromContext } from '../context_util.js';
import { getRandomInt } from '../math_util.js';

const time_sticker_raw = fs.readFileSync('./time_sticker.json');
const time_sticker = JSON.parse(time_sticker_raw);

const CALLBACK_PREFIX_NEWREMINDER_CREATE = 'cb_newReminder_createReminder_';

export const init = async (ctx, isEdit = false) => {
    const events = await db_event.getAllEvents();

    if (events.length === 0) {
        ctx.replyWithSticker('CAACAgIAAxkBAAPaYVyYJUq8Qkxl5P6Zmd8ZXaXsEjUAAhcBAAIiN44EZ1J_iHvDbNAhBA');
        ctx.reply(`Es exisitieren aktuell keine Termine, für die du Erinnerungen anlegen kannst.`)
        return;
    }

    var keyboardElements = [];
    events.forEach(
        (event) => {
            keyboardElements.push({ text: event.name, callback_data: CALLBACK_PREFIX_NEWREMINDER_CREATE + event.id });
        }
    );

    var keyboard = createKeyboardArrayWithWidthOf(2, keyboardElements);

    var options = {
        reply_markup: JSON.stringify({
            inline_keyboard: keyboard
        })
    };

    const messageText = 'Hier sind die alle Veranstaltungen, für die Erinnerungen einstellbar sind!'

    sendMessage(ctx, messageText, options, isEdit);
}

export const createReminder = async (ctx, eventId, isEdit = false) => {
    const event = await db_event.getEventById(eventId);

    ctx.session.nextAction = "newReminder_createReminderSave";
    ctx.session.nextActionData = eventId;

    var messageText = `Du möchtest also für das Event **${event.name}** eine Erinnerung erstellen. Sende mir hierzu die Zeitangabe, wie lang vorher ich dich an den Termin Erinnern soll.

Zum Beispiel

    - 1d für 1 Tag vorher
    - 10m für 10 Minuten vorher
    - 01d03h für 1 Tag und 3 Stunden vorher`;

    sendMessage(ctx, messageText, { parse_mode: "Markdown" }, isEdit);
    ctx.replyWithSticker(time_sticker[getRandomInt(time_sticker.length)]);
}

export const createReminderSave = async (ctx, eventId, isEdit = false) => {
    const event = await db_event.getEventById(eventId);

    const input = ctx.message.text;

    const secondsBefore = timeInputToSeconds(input);
    if (secondsBefore === 0) {
        ctx.reply("Das hat nicht geklappt. Bitte gebe eine korrekte Zeitangabe an!");
    } else {
        try {
            await db_reminder.createReminder(eventId, parseUserIdFromContext(ctx), secondsBefore);

            const humanReadableDistance = secondsToTimeString(secondsBefore).trim();
            var message = `Cool, das war's. Ich werde dich ***${humanReadableDistance}*** vorher an das Event ***${event.name}*** erinnern! Du kannst mit /myreminders deine aktuellen Erinnerungen einsehen.`;
            ctx.reply(message, { parse_mode: "Markdown" });
        } catch (e) {
            console.log("[SQL - ERROR] (createReminderSave)");
            ctx.reply("Es ist ein unerwarteter Fehler aufgetreten!");
        }

        ctx.session = null;
    }
}
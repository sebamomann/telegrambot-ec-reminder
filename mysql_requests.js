import * as mysql from 'mysql2/promise';

var con;

export async function startConnection() {
    try {
        con = await mysql.createConnection({
            host: process.env.MYSQL_URL,
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASSWORD,
            database: process.env.MYSQL_DB
        });
        console.log(`[SQL] Connected!`);
    } catch (e) {
        console.log(`[SQL] Could not connect to database. Reason ${e}`)
    }
}

export async function saveUserIfNotExists(ctx) {
    var id = ctx.message.from.id;

    var sql = 'SELECT id FROM account WHERE id=?';

    const [result] = await con.execute(sql, [id]);
    if (result.length > 0) {
        updateUserById(ctx);
        return;
    }

    createNewUser(ctx);
}

export async function createNewUser(ctx) {
    var id = ctx.message.from.id;
    var first_name = ctx.message.from.first_name;
    var last_name = ctx.message.from.last_name;
    var username = ctx.message.from.username;
    var language = ctx.message.from.language_code;

    var sql = 'INSERT INTO account (id, first_name, last_name, username, language) VALUES (?, ?, ?, ?, ?)';

    const [result] = await con.execute(sql, [id, first_name, last_name, username, language]);

    // if (err) {
    //     console.log("[SQL] Could not create new user. Reason: " + err);
    //     return;
    // }

    console.log("[SQL] Inserted new user with username '" + username + "'");
    ctx.reply(`Hi ${first_name} ${last_name}. Ich bin dein persönlicher Erinnerungs-Bot für die Events des EC-Heidelsheim. Um zu sehen was ich kann, sende mir /help`);
}

export async function updateUserById(ctx) {
    var id = ctx.message.from.id;
    var first_name = ctx.message.from.first_name;
    var last_name = ctx.message.from.last_name;
    var username = ctx.message.from.username;
    var language = ctx.message.from.language_code;

    var sql = 'UPDATE account SET first_name=?, last_name=?, username=?, language=? WHERE id=?';

    const [result] = await con.execute(sql, [first_name, last_name, username, language, id]);

    // if (err) {
    //     console.log("Could not update user. Reason: " + err);
    //     return;
    // }

    console.log("[SQL] Updated user with username '" + username + "'");
    ctx.reply(`Hi ${first_name} ${last_name}. Ich kenne dich bereits, leg' los! Wenn du nicht weißt wie, dann sende mir /help`);
}

export async function getAllEvents() {
    var sql = 'SELECT * FROM event';

    const [results] = await con.execute(sql);

    return results;
}

export async function getEventById(eventId) {
    var sql = 'SELECT * FROM event WHERE id = ?';

    const [results] = await con.execute(sql, [eventId]);

    return results[0];
}

export async function getRemindersByEventIdAndUserId(eventId, userId) {
    var sql = 'SELECT * FROM reminder WHERE eventId = ? AND userId = ?';

    const [results] = await con.execute(sql, [eventId, userId]);

    return results;
}

export async function saveReminder(eventId, userId, distance) {
    var sql = 'INSERT INTO reminder (userId, eventId, distance) VALUES (?, ?, ?)';

    const [result,] = await con.execute(sql, [userId, eventId, distance]);

    // if (err) {
    //     console.log("[SQL] Could not crete new reminder. Reason: " + err);
    //     return;
    // }

    console.log("[SQL] Inserted new reminder with distance '" + distance + "'");
}

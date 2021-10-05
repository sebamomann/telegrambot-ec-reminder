import * as mysql from 'mysql2/promise';

export var con;

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
    var first_name = ctx.message.from.first_name || null;
    var last_name = ctx.message.from.last_name || null;
    var username = ctx.message.from.username || null;
    var language = ctx.message.from.language_code;

    var sql = 'INSERT INTO account (id, first_name, last_name, username, language) VALUES (?, ?, ?, ?, ?)';

    const [result] = await con.execute(sql, [id, first_name, last_name, username, language]);

    console.log("[SQL] Inserted new user with username '" + username + "'");
    ctx.reply(`Hi ${first_name} ${last_name}. Ich bin dein persönlicher Erinnerungs-Bot für die Events des EC-Heidelsheim. Um zu sehen was ich kann, sende mir /help`);
}

export async function updateUserById(ctx) {
    var id = ctx.message.from.id;
    var first_name = ctx.message.from.first_name || null;
    var last_name = ctx.message.from.last_name || null;
    var username = ctx.message.from.username || null;
    var language = ctx.message.from.language_code;

    var sql = 'UPDATE account SET first_name=?, last_name=?, username=?, language=? WHERE id=?';

    const [result] = await con.execute(sql, [first_name, last_name, username, language, id]);

    console.log("[SQL] Updated user with username '" + username + "'");
    ctx.reply(`Hi ${first_name} ${last_name}. Ich kenne dich bereits, leg' los! Wenn du nicht weißt wie, dann sende mir /help`);
}
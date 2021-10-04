import { con } from './mysql_requests.js'

export async function getRemindersByEventIdAndUser(eventId, userId) {
    var sql = `SELECT * FROM reminder WHERE eventId = ? and userId = ?`;

    var results, fields;

    try {
        [results, fields] = await con.execute(sql, [eventId, userId]);
    } catch (e) {
        console.log("[SQL - ERROR] Could not fetch reminders by event and user");
        console.log("[SQL - ERROR] Reason: " + err)
        throw new Error(err);
    }

    return results;
};

export async function getReminderById(reminderId) {
    var sql = 'SELECT * FROM reminder WHERE id = ?';

    var results, fields;

    try {
        [results, fields] = await con.execute(sql, [reminderId]);
    } catch (e) {
        console.log("[SQL - ERROR] Could not fetch reminder by id");
        console.log("[SQL - ERROR] Reason: " + e)
        throw new Error(err);
    }

    return results[0];
}
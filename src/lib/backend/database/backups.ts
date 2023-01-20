import knex from "./knex";
import { Knex } from "knex";


export async function backupKeyValue(key: string, value: string): Promise<void> {
    await knex("Backup")
        .insert({
            key: key,
            value: value,
            created_at: new Date(),
        })
        .onConflict("key")
        .merge();

    return;
}

export async function insertBackups(backups: { key: string, value: string }[]): Promise<void> {
    await knex("Backup")
        .insert(backups)
        .onConflict("key")
        .merge();

    return;
}

export async function getBackup(key: string): Promise<string | null> {
    const backup = await knex("Backup")
        .select("value")
        .where("key", key)
        .first();

    if (!backup) {
        return null;
    }

    return backup.value;
}

export async function getBackupKeys(): Promise<string[]> {
    const backups = await knex("Backup")
        .select("key");

    return backups.map((backup) => backup.key);
}

export async function deleteBackup(key: string): Promise<void> {
    await knex("Backup")
        .where("key", key)
        .del();

    return;
}


export async function deleteOldBackups(cutoff: Date): Promise<void> {

    await knex("Backup")
        .where("created_at", "<", cutoff)
        .del();

    return;
}

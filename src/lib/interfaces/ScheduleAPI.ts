import { Schedule } from "../common/types";

class ScheduleAPI {

    // abstract createSchedule(schedule: Schedule, abort?: AbortController): Promise<Schedule>;
    // abstract updateSchedule(schedule: Schedule, abort?: AbortController): Promise<Schedule>;
    // abstract deleteSchedule(schedule: Schedule, abort?: AbortController): Promise<void>;
    // abstract getSchedule(schedule: Schedule, abort?: AbortController): Promise<Schedule>;
    // abstract getSchedules(userID: string, abort?: AbortController): Promise<Schedule[]>;

    static async createSchedule(schedule: Omit<Schedule, "id">, abort?: AbortController): Promise<Schedule> {

        const res = await fetch(`/api/schedules`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ schedule }),
            signal: abort?.signal
        });

        if (!res?.ok) {
            return Promise.reject(res?.statusText ?? "Unknown error");
        }

        return await res.json();
    }

    static async deleteSchedule(schedule: Schedule, abort?: AbortController): Promise<boolean> {

        const res = await fetch(`/api/schedules`, {
            method: "DELETE",
            signal: abort?.signal,
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ schedule }),
        });

        if (!res || !res.ok) {
            return Promise.reject(res?.statusText ?? "Unknown error");
        }

        return true;
    }

    static async getSchedules(semester: string, abort?: AbortController): Promise<Schedule[]> {

        const res = await fetch(`/api/schedules?semester=${semester}`, {
            method: "GET",
            signal: abort?.signal,
        });

        if (!res || !res.ok) {
            return Promise.reject(res?.statusText ?? "Unknown error");
        }

        return res.json();

    }

}

export default ScheduleAPI;
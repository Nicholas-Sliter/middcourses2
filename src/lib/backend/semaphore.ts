export default class Semaphore {

    private _max: number;
    private _count: number;
    private _queue: (() => void)[];

    constructor(max: number) {
        this._max = max;
        this._count = 0;
        this._queue = [];
    }

    public async acquire() {
        return new Promise((resolve) => {
            if (this._count < this._max) {
                this._count++;
                resolve(true);
            } else {
                this._queue.push(() => resolve(true));
            }
        });
    }

    public release() {
        if (this._queue.length > 0) {
            this._queue.shift()();
        } else {
            this._count--;
        }
    }


}
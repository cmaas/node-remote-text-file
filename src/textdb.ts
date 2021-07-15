import { SQL_001_INIT_DOWN, SQL_001_INIT_UP } from './sql';
import { v4 as uuidv4 } from 'uuid';
import * as Crypto from 'crypto';
import * as SQLite from 'better-sqlite3';

export interface TextDbUserInstance {
    key: string;
    readKey: string;
    appendKey: string;
}

export class TextDb {

    private db: SQLite.Database;

    constructor(dbFilename: string) {
        this.db = new SQLite(dbFilename);
        console.log('(TextDB) Using database ' + dbFilename);
        this.migrateAll();
    }

    create(): TextDbUserInstance {
        const key = uuidv4();
        const readKey = 'r-' + Crypto.createHash('sha256').update(key + 'read').digest('hex');
        const appendKey = 'a-' + Crypto.createHash('sha256').update(key + 'append').digest('hex');
        const st = this.db.prepare('INSERT INTO files (key, data, created, updated, readKey, appendKey) VALUES (?, ?, ?, ?, ?, ?)');
        try {
            st.run(key, null, Date.now(), null, readKey, appendKey);
        } catch (err) {
            throw new Error('Could not create new DB instance');
        }
        return { key, readKey, appendKey };
    }

    getData(key: string): any {
        if (key.indexOf('r-') === 0) {
            return this.db.prepare('SELECT * FROM files WHERE readKey = ?').get(key)?.data;
        }
        return this.db.prepare('SELECT * FROM files WHERE key = ?').get(key)?.data;
    }

    setData(key: string, data: string): void {
        const res = this.db.prepare('SELECT key FROM files WHERE key = ?').get(key);
        if (! res?.key) {
            throw new Error(`No such database ${key}, please say hello first`);
        }
        this.db.prepare('UPDATE files SET data = ? WHERE key = ?').run(data, res.key);
    }

    appendData(key: string, data: string): void {
        // transform append key to master key for read access
        if (key.indexOf('a-') === 0) {
            key = this.db.prepare('SELECT key FROM files WHERE appendKey = ?').get(key)?.key;
        }
        const existingData = this.getData(key);
        const newData = existingData + data;
        this.setData(key, newData);
    }

    private migrateAll() {
        this.db.exec(SQL_001_INIT_UP);
    }

    clearDb() {
        this.db.exec(SQL_001_INIT_DOWN);
    }
}

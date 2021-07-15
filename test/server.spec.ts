import * as test from 'tape';
import fetch from 'node-fetch';
import { startServer, stopServer } from '../src/server';
import { TextDb, TextDbUserInstance } from '../src/textdb';

function setup() {
    const db = new TextDb(':memory:');
    return {
        server: startServer(db, 8085)
    }
}

function teardown(fixtures: any) {
    stopServer(fixtures.server);
}

test('TextDB HttpServer interface', async (assert) => {
    const fixtures = setup();

    // hello
    assert.isNotEqual(fixtures.server, null, `Server instance is running`);
    assert.equals(await fetch('http://localhost:8085/').then(res => res.status), 404, `server returns 404 for root`);
    const myDb: TextDbUserInstance = await fetch('http://localhost:8085/api/hello').then(res => res.json());
    assert.equals(myDb.key.length > 0, true, `/hello provides key (${myDb.key})`);
    assert.equals(myDb.readKey.length > 0, true, `/hello provides readKey (${myDb.readKey})`);
    assert.equals(myDb.appendKey.length > 0, true, `/hello provides appendKey (${myDb.appendKey})`);

    // read data
    const textData = await fetch('http://localhost:8085/api/data/' + myDb.key).then( res => res.text());
    assert.equals(textData, '', `Returns empty data`);

    // write data
    assert.equals(await fetch('http://localhost:8085/api/data/' + myDb.key, { method: 'POST', body: 'Hello world!' }).then(res => res.text()), '', `saving data returns empty HTTP body`);
    assert.equals(await fetch('http://localhost:8085/api/data/' + myDb.key).then(res => res.text()), 'Hello world!', `saved data can be retrieved`);
    assert.equals(await fetch('http://localhost:8085/api/data/append/' + myDb.appendKey, { method: 'POST', body: 'How are you?' }).then(res => res.text()), '', `appending data returns empty HTTP body`);
    assert.equals(await fetch('http://localhost:8085/api/data/' + myDb.readKey).then(res => res.text()), 'Hello world!How are you?', `saved data can be retrieved via readKey`);

    // write + read JSON data
    assert.equals(await fetch('http://localhost:8085/api/data/' + myDb.key, { method: 'POST', body: '{"hello":"world"}' }).then(res => res.text()), '', `saving data returns empty HTTP body`);
    console.log("RESP", await fetch('http://localhost:8085/api/data/' + myDb.readKey, { headers: { 'accept': 'application/json' } }).then(res => res.json()));
    assert.deepEquals(await fetch('http://localhost:8085/api/data/' + myDb.readKey, { headers: { 'accept': 'application/json' } }).then(res => res.json()), { hello: 'world' }, `saved data can be retrieved as JSON via readKey`);

    teardown(fixtures);
    assert.end();
});

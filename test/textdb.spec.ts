import * as test from 'tape';
import { TextDb } from '../src/textdb';

function setup() {
    const db = new TextDb(':memory:');
    return {
        db: db
    }
}

test('TextDB basic usage', (assert) => {
    const fixtures = setup();

    const my = fixtures.db.create();
    assert.isNotEqual(my, null, `creates TextDB obj`);
    console.log('Hello, here is your database: ' + my.key);
    console.log('Use this read-only link: ' + my.readKey);
    console.log('Use this append-only link: ' + my.appendKey);

    assert.equals(fixtures.db.getData('mykey'), undefined, `retrieve data with unknown key`);
    assert.throws(() => fixtures.db.setData('mykey', null), `can't set data of unknown DB`);
    assert.doesNotThrow(() => fixtures.db.setData(my.key, 'Hello world'), `can set data of known DB`);
    assert.equals(fixtures.db.getData(my.key), 'Hello world', `can retrieve via full access key`);
    assert.equals(fixtures.db.getData(my.key), 'Hello world', `can retrieve via readKey`);
    assert.equals(fixtures.db.getData(my.appendKey), undefined, `cannot retrieve via appendKey`);
    assert.throws(() => fixtures.db.setData(my.readKey, null), `cannot set data with readKey`);
    assert.equals(fixtures.db.setData(my.key, '{"hello":"world"}'), undefined, `setting data doesn't return anything`);
    assert.equals(fixtures.db.getData(my.key), '{"hello":"world"}', `updating data overwrites existing data`);
    assert.doesNotThrow(() => fixtures.db.appendData(my.key, '{"foo":"bar"}'), `can append data`);
    assert.equals(fixtures.db.getData(my.key), '{"hello":"world"}{"foo":"bar"}', `appended data can be retrieved`);
    assert.doesNotThrow(() => fixtures.db.appendData(my.appendKey, '{"wild":"pig"}'), `can append data with appendKey`);
    assert.equals(fixtures.db.getData(my.key), '{"hello":"world"}{"foo":"bar"}{"wild":"pig"}', `appended data can be retrieved`);
    assert.throws(() => fixtures.db.appendData(my.readKey, '{"anything":"goes"}'), `cannot append data with readKey`);
    assert.equals(fixtures.db.getData(my.key), '{"hello":"world"}{"foo":"bar"}{"wild":"pig"}', `appended data is all there`);
    assert.equals(fixtures.db.getData(my.readKey), '{"hello":"world"}{"foo":"bar"}{"wild":"pig"}', `appended data is all there (readKey works)`);
    assert.equals(fixtures.db.getData(my.appendKey), undefined, `appended data cannot be retrieved with appendKey`);
    assert.end();
});

import * as ava from 'ava'
const test = ava.test
const tv: any = require('./fixtures/psbt.json')

test('valid test vector', (t: ava.TestContext):void => {
  t.deepEqual([1,2], [1,2])
})

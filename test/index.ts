import { test, TestContext } from 'ava'
import PSBT from '../src'
const tv: any = require('./fixtures/psbt.json')

test('invalid test vector', (t: TestContext):void => {
  t.plan(4)
  tv.invalid.forEach((testcase: any) => {
    t.throws(() => {const ser: PSBT = PSBT.fromHexString(testcase.hex)})
  })
})

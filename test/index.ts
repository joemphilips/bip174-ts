import { test, TestContext } from 'ava'
import PSBT from '../src'
const tv: any = require('./fixtures/psbt.json')

test('will not decode invalid test vector', (t: TestContext):void => {
  tv.invalid.forEach((testcase: any) => {
    t.throws(() => {const ser: PSBT = PSBT.fromHexString(testcase.hex)})
  })
})

test('can successfully decode valid test vector', (t: TestContext): void => {
  tv.valid.forEach((testcase: any) => {
    t.notThrows(() => {PSBT.fromHexString(testcase.hex)})
    t.is(PSBT.fromHexString(testcase.hex), PSBT.fromBuffer(Buffer.from(testcase.hex, 'hex')))
  })
})

import { test, TestContext } from 'ava'
import PSBT from '../src'
const tv: any = require('./fixtures/psbt.json')

test('will not decode invalid test vector', (t: TestContext):void => {
  tv.invalid.forEach((testcase: any) => {
    t.throws(() => {const ser: PSBT = PSBT.fromHexString(testcase.hex)})
  })
})

test('decoding from hex and Buffer snould be same', (t: TestContext): void => {
  tv.valid.forEach((testcase: any) => {
    t.is(PSBT.fromHexString(testcase.hex), PSBT.fromBuffer(Buffer.from(testcase.hex, 'hex')))
  })
})

test.only('can get valid Transaction after decoding', (t: TestContext): void => {
  tv.valid.forEach((testcase: any) => {
    let psbt: PSBT = PSBT.fromHexString(testcase.hex);
    t.truthy(psbt.global.tx)
  })
})

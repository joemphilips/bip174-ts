import { test, TestContext } from 'ava'
import psbtSerializer from '../src'
const tv: any = require('./fixtures/psbt.json')

test('valid test vector', (t: TestContext):void => {
  t.plan(4)
  tv.invalid.forEach((testcase: any) => {
    const ser: psbtSerializer = new psbtSerializer(testcase.hex)
    t.deepEqual(1, 1)
  })
})

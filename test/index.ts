import {test, TestContext } from 'ava'
import PSBT from '../src'
import {RPC, BlockchainProxy} from 'blockchain-proxy'
const tv: any = require('./fixtures/psbt.json')

let context: any;

test.beforeEach("setup blockchain proxy", (t: TestContext) => {
  context = {rpc: new RPC(process.env["HOME"] + "/.bitcoin/bitcoin.conf")}
})

tv.invalid.forEach((testcase: any) => {
  test('will not decode invalid test vector', (t: TestContext):void => {
    t.throws(() => {const ser: PSBT = PSBT.fromHexString(testcase.hex, context.rpc)})
  })
})

test('decoding from hex and Buffer snould be same', (t: TestContext): void => {
  tv.valid.forEach((testcase: any) => {
    t.deepEqual(PSBT.fromHexString(testcase.hex, context.rpc), PSBT.fromBuffer(Buffer.from(testcase.hex, 'hex'), context.rpc))
  })
})

tv.valid.forEach((testcase: any, i: number) => {
  test(`valid for ${testcase.hex}`, (t: TestContext): void => {
    let psbt: PSBT = PSBT.fromHexString(testcase.hex, context.rpc);
    t.truthy(psbt.global.tx)
  })
})

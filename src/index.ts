import {Transaction, Network} from 'bitcoinjs-lib'
import * as assert from 'power-assert'

interface KVPairs {
  [key: string]: Buffer | Transaction | null | string | number;
}

class GlobalKVMap implements KVPairs {
  [key: string]: Buffer | Transaction | null | string | number;
  separator: number = 0x00;
  constructor(public transaction: Transaction) {
  }
}

class InputKVMap implements KVPairs {
  [key: string]: Buffer | Transaction | null | string | number;
  separator: number = 0x00;
  constructor() {
  }
}

interface PSBTInterface {
  global: GlobalKVMap;
  inputs: InputKVMap[];
  separator?: number;
  magicBytes?: number;
}

export default class PSBT implements PSBTInterface {
  static magicBytes: number = 0x70736274;
  static separator: number = 0xff;
  public constructor(public global: GlobalKVMap, public inputs: InputKVMap[]) {
    this.global = global
    this.inputs = inputs
  }

  public static fromHexString(opts: string) {
    return this.fromBuffer(Buffer.from(opts, 'hex'))
  }

  public static fromTransaction(opts: Transaction) {
    console.log("not implemented!")
  }

  public static fromBuffer(buf: Buffer) {
    let offset = 0
    function readInt8(){
      const i = buf.readInt8(offset)
      offset += 1
      return i
    }

    function readInt32LE () {
      const i = buf.readInt32LE(offset)
      offset += 4
      return i
    }

    function readTransaction () {
      const tx = Transaction.fromBuffer(buf, true)
      offset += tx.toHex().length
      return tx
    }

    assert(readInt32LE() === this.magicBytes)
    assert(readInt8() === this.separator)
    let tx : Transaction = readTransaction()
    let global: GlobalKVMap = new GlobalKVMap(tx)
    let inputs: InputKVMap = new InputKVMap()
    return new PSBT(global, [inputs])
  }

  public encodeForBroadCasting(network: Network) {
    console.warn("not yet implemented!")
  }

  public conbine(other: PSBT) {
    console.warn("not yet implemented!")
  }
}

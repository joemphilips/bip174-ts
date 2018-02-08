import {Transaction, Network} from 'bitcoinjs-lib'
import * as assert from 'power-assert'

interface KVPairs {
  separator: number;
  [key: number]: Buffer | Transaction | null | string;
}

class GlobalKVMap implements KVPairs {
  separator: number = 0x00;
  public transaction: Transaction;
  public redeemScript?: string;
  constructor() {
    this.00 = new Transaction();
    this.00 = 'thisisreadeemscript';
  }
}

class InputKVMap implements KVPairs {
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

  public static fromBuffer(opts: Buffer) {
    let offset = 0
    function readInt8(){
      const i = opts.readInt8(offset)
      offset += 1
    }

    function readInt32LE () {
      const i = opts.readInt32LE(offset)
      offset += 4
      return i
    }

    assert(readInt32LE() === this.magicBytes)
    assert(readInt8() === this.separator)

    let global: GlobalKVMap = new GlobalKVMap()
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

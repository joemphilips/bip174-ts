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

    function readSlice(n: number) {
      offset += n;
      return buf.slice(offset - n, offset)
    }
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
      const tx: Transaction = Transaction.fromBuffer(buf, true)
      offset += tx.byteLength()
      return tx
    }

    assert(readInt32LE() === this.magicBytes)
    assert(readInt8() === this.separator)
    let tx : Transaction = readTransaction()

    let global: GlobalKVMap = new GlobalKVMap(tx)
    let inputs: InputKVMap = new InputKVMap()
    let i;
    while (true) {
      i = readInt8()
      if (i === 0x00) {
        console.log('finish reading globalKVMap')
        break
      } else if (i === 0x01) { // RedeemScript
        let hash = readSlice(20)
      } else if (i === 0x02) {
      } else if (i === 0x03) {
      } else if (i === 0x04) {
      } else {
        console.warn("unexpected Value for Key while deserializing GlobalKVMap!")
      }
    }

    return new PSBT(global, [inputs])
  }

  public encodeForBroadCasting(network: Network) {
    console.warn("not yet implemented!")
  }

  public conbine(other: PSBT) {
    console.warn("not yet implemented!")
  }
}

import {Transaction, Network, TransactionBuilder, script, crypto} from 'bitcoinjs-lib'
import * as assert from 'power-assert'

// library which don't have *.d.ts has to be required not imported.
const  varuint = require('varuint-bitcoin')

interface KVPairs {
  [key: string]: Buffer[] | Transaction | null | string | number;
}

class GlobalKVMap implements KVPairs {
  [key: string]: Buffer[] | Transaction | null | string | number;
  separator: number = 0x00;
  public tx: Transaction;
  public redeemScripts: Buffer[];
  public witnessScripts: Buffer[];
  constructor(public transaction: Transaction) {
  }
}

class InputKVMap implements KVPairs {
  [key: string]: Buffer[] | Transaction | null | string | number;
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
    return PSBT.fromBuffer(Buffer.from(opts, 'hex'))
  }

  public static fromTransaction(opts: Transaction) {
    console.log("not implemented!")
  }

  public static fromBuffer(buf: Buffer) {
    let offset = 0

    function readSlice(bytes: number) {
      offset += bytes;
      return buf.slice(offset - bytes, offset)
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

    function readVarUint () {
      let vi = varuint.decode(buf, offset)
      offset += varuint.decode.bytes
      return vi
    }

    assert(readInt32LE() === this.magicBytes)
    assert(readInt8() === this.separator)

    let tx : Transaction = readTransaction()
    let global: GlobalKVMap = new GlobalKVMap(tx)
    let inputs: InputKVMap = new InputKVMap()

    while (true) {
      let keyLength = readVarUint()
      let key: Buffer = readSlice(keyLength)
      let i = key.readUInt8(0)
      if (i === 0x00) {
        console.log('finish reading globalKVMap')
        break

      // RedeemScript
      } else if (i === 0x01) {
        let scriptHash = key.slice(1, -1)
        let valueLength = readVarUint()
        let redeemScript = readSlice(valueLength)
        assert(scriptHash === crypto.hash160(redeemScript)) // does key and value correspond?
        assert(script.scriptHash.input.check(redeemScript, true)) // is redeemScript itself valid?
        global.redeemScripts.push(redeemScript)
        continue

      // Witness Script
      } else if (i === 0x02) {
        let witnessScriptHash = key.slice(1, -1)
        let valueLength = readVarUint()
        let witnessScript = readSlice(valueLength) // in the case of P2WPKH
        assert(witnessScriptHash === crypto.hash256(witnessScript)) // does key and value correspond?
        assert(script.witnessScriptHash.input.check(witnessScript, true)) // is witness script itself valid?
        global.witnessScripts.push(witnessScript)

      // bip32 derivation path
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

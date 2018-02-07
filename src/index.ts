import {Transaction, Network} from 'bitcoinjs-lib'

interface GlobalKVMap {
  transaction: Transaction;
  redeemScript?: any;
}

interface InputKVMap {
  [name: string]: string;
}

interface PSBTInterface {
  global: GlobalKVMap;
  inputs: InputKVMap[];
  separator: Buffer;
  magicBytes: Buffer;
}

export default class PSBT {
  public constructor(GlobalField, ) {
    throw new Error("failed to initialize psbt!")
  }

  public static fromHexString(opts: string) {
    return this.fromBuffer(Buffer.from(opts, 'hex'))
  }

  public static fromTransaction(opts: Transaction) {
    console.log("not implemented!")
  }

  public static fromBuffer(opts: Buffer) {
    console.warn("must decode in here ...")
    return new PSBT(opts)
  }

  public encodeForBroadCasting(network: Network) {
    console.warn("not yet implemented!")
  }

  public concat(other: PSBT) {
    console.warn("not yet implemented!")
  }
}

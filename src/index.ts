import {Transaction} from 'bitcoinjs-lib'

export default class PSBT {
  public constructor(opts: any) {
  }

  public static fromHexString(opts: string) {
    console.log("not implemented!")
    return new PSBT(opts)
  }

  public static fromTransaction(opts: Transaction) {
    console.log("not implemented!")
  }

  public static fromBuffer(opts: Buffer) {
    console.log("not implemented!")
  }
}

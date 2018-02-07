import {Transaction} from 'bitcoinjs-lib'

export default class PSBT {
  public constructor(opts: any) {
    throw new Error("failed to initialize psbt!")
  }

  public static fromHexString(opts: string) {
    console.log("not implemented!")
    return this.fromBuffer(Buffer.from(opts, 'hex'))
  }

  public static fromTransaction(opts: Transaction) {
    console.log("not implemented!")
  }

  public static fromBuffer(opts: Buffer) {
    console.log("must decode in here ...")
    return new PSBT(opts)
  }
}

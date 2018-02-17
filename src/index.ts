import {Transaction, Network, script, crypto, Out} from 'bitcoinjs-lib'
import {BlockchainProxy} from 'blockchain-proxy'
import * as assert from 'power-assert'
import classifyWitness = script.classifyWitness;
import decompile = script.decompile;
import classifyOutput = script.classifyOutput;

// library which don't have *.d.ts has to be required not imported.
const varuint = require('varuint-bitcoin');
const debug = require('debug')("psbt");

export enum PSBTValueType{
  UNSIGNED_TX_OR_NON_WITNESS_UTXO = 0x00,
  REDEEM_SCRIPT_OR_WITNESS_UTXO = 0x01,
  WITNESS_SCRIPT_OR_PARTIAL_SIG = 0x02,
  BIP32_KEYPATH_OR_SIGHASH = 0x03,
  NINPUTS_OR_INDEX = 0x04,
}

export class GlobalKVMap {
  separator: number = 0x00;
  public tx?: Transaction;
  public redeemScripts: Buffer[];
  public witnessScripts: Buffer[];
  public pubKeys: Buffer[]; // Buffer of UInt32
  public derivePath: Buffer[]; // Buffer of UInt32
  public inputN: number
  constructor() {
    this.redeemScripts = []
    this.witnessScripts = []
    this.pubKeys = []
    this.derivePath = []
  }
}

export class InputKVMap {
  separator: number = 0x00;
  public nonWitnessUTXO: Transaction;
  public witnessUTXO: Out;
  public sighashRecommended: number;
  public index: number;
  public partialSig: {
    pubkey: Buffer,
    sig: Buffer
  };
  constructor() {
  }
}

export interface PSBTInterface {
  global: GlobalKVMap;
  inputs: InputKVMap[];
  inputN?: number;
  separator?: number;
  magicBytes?: number;
}

export default class PSBT implements PSBTInterface {
  private static magicBytes: number = 0x70736274;
  private static separator: number = 0xff;
  public constructor(public global: GlobalKVMap, public inputs: InputKVMap[]) {
    this.global = global
    this.inputs = inputs
  }

  public static fromHexString<P extends BlockchainProxy>(opts: string, p: P) {
    return PSBT.fromBuffer(Buffer.from(opts, 'hex'), p)
  }

  public static fromTransaction(opts: Transaction) {
    debug("not implemented!")
  }

  public static fromBuffer<P extends BlockchainProxy>(buf: Buffer, proxy: P) {
    let offset = 0

    function readSlice(bytes: number) {
      offset += bytes;
      return buf.slice(offset - bytes, offset)
    }
    function readUInt8(){
      const i = buf.readUInt8(offset)
      offset += 1
      return i
    }

    function readUInt32BE () {
      const i = buf.readUInt32BE(offset)
      offset += 4
      return i
    }

    function readVarSlice() {
      return readSlice(readVarUint())
    }

    function readVarUint () {
      let vi = varuint.decode(buf, offset)
      offset += varuint.decode.bytes
      return vi
    }

    assert(readUInt32BE() === PSBT.magicBytes, "magic Bytes were malformed!")
    assert(readUInt8() === PSBT.separator, "Not Valid first separator!")

    let global: GlobalKVMap = new GlobalKVMap()
    let inputs: Array<InputKVMap> = []
    let input: InputKVMap = new InputKVMap()
    let inputIndex: number = 0
    let hasTransaction: boolean = false;
    let inGlobals: boolean = true
    let separators: number = 0

    while (offset < Buffer.byteLength(buf)) {
      let keyLength = readVarUint()
      debug(`starting next roop from offset ${offset} ...`)

      // first, we must check if it was separator
      if (keyLength == 0) {
        inGlobals = false
        if (separators) {
          inputs.push(input)
          input = new InputKVMap()
          inputIndex = separators
        }
        separators++
        continue
      };

      // if it was not separator, than lets read entire key ...
      let key: Buffer = readSlice(keyLength)
      debug("key is ", key.toString("hex"))
      let type = key.readUInt8(0)
      let value = readVarSlice()

      // ... and actual value
      if (type === PSBTValueType.UNSIGNED_TX_OR_NON_WITNESS_UTXO) {
        let tx: Transaction = Transaction.fromBuffer(value, true)
        if (inGlobals) {
          debug("the main tx is ", tx)
          debug("and its hex is ", tx.toHex())
          debug("and its length is ", tx.byteLength())
          global.tx = tx
          hasTransaction = true
          continue
        } else { // NON_WITNESS_UTXO
          debug("input transaction is ", tx)
          proxy.getPrevHash(global.tx as Transaction)
            .then((prevs) => {
              assert(prevs.some(tx.getId()), "malformed Input UTXO! doesn't match with TX's input")
            })
          input.nonWitnessUTXO = tx;
        }

      } else if (type === PSBTValueType.REDEEM_SCRIPT_OR_WITNESS_UTXO) {
        if (inGlobals) {
          debug('parsinng redeemscript')
          debug("offset is ", offset)
          let scriptHash = key.slice(1)
          let redeemScript = value
          assert.deepEqual(scriptHash, crypto.hash160(redeemScript),
            `redeemScript ${redeemScript.toString('hex')} does not match to hash!( ${scriptHash.toString("hex")} )
            and it was ${crypto.hash160(redeemScript).toString("hex")}`) // does key and value correspond?
          let decompiled = script.decompile(redeemScript)
          let scriptType: string = classifyOutput(decompiled)
          debug(`¥n¥n script Type is ${scriptType} ¥n¥n`)
          if (scriptType == "witnesspubkeyhash") {
            assert(script.witnessPubKeyHash.output.check(redeemScript),
              `redeemScript ${redeemScript.toString('hex')} not valid`) // is redeemScript itself valid?
          } else {
            assert(script.witnessScriptHash.output.check(redeemScript),
              `redeemScript ${redeemScript.toString('hex')} not valid`)
          }
          global.redeemScripts.push(redeemScript)
          continue;
        } else {
          debug("parsing witness utxo")
          // serialized witness output
          // 1. 8byte amount in satoshi
          // 2. sciprtPubKey(in network serialization format)
          //  * length of pubkey (varUInt)
          //  * pubkey itself
          let amount: number = value.readUInt8(0)
          let pubKeyLength = varuint.decode(value)
          let scriptPubkey = value.slice(pubKeyLength)
          input.witnessUTXO = { value: amount, script: scriptPubkey }
        }

      } else if (type === PSBTValueType.WITNESS_SCRIPT_OR_PARTIAL_SIG) {
        if (inGlobals) {
          debug('reading witnessScirpt')
          let witnessScriptHash = key.slice(1) // sha256
          let witnessScript = value

          // this assert is not working for some reason
          // assert.deepEqual(witnessScriptHash, crypto.hash256(witnessScript),
          //  `witnessScript ( ${witnessScript.toString("hex")} ) does not match to hash ( ${witnessScriptHash.toString('hex')} )
          //  and it was ${crypto.hash256(witnessScript).toString('hex')}`) // does key and value correspond?

          assert(script.multisig.output.check(witnessScript, true)) // is witness script itself valid?
          global.witnessScripts.push(witnessScript)
          continue;
        } else {
          debug("reading partial sig ")
          let pubkey: Buffer = key.slice(1)
          let sig = value
          input.partialSig = { pubkey: pubkey , sig: sig}
        }

      } else if (type === PSBTValueType.BIP32_KEYPATH_OR_SIGHASH) {
        if (inGlobals) {
          debug("reading bip32")
          let pubKeyBuffer = key.slice(1)
          let derivePath = value
          global.pubKeys.push(pubKeyBuffer)
          global.derivePath.push(derivePath)
          continue;
        } else {
          debug("parsing value")
          input.sighashRecommended = value.readUInt8(0)
        }
      } else if (type === PSBTValueType.NINPUTS_OR_INDEX) {
        if (inGlobals) {
          debug("reading number of inputs")
          global.inputN = varuint.decode(value)
        } else {
          input.index = varuint.decode(value)
        }
      } else {
        console.error(`unexpected Value for Key while deserializing ${inGlobals ? "global" : "inputs"}`)
        console.warn(' offset was ', offset)
        console.warn(`In buffer, that is ${buf.slice(offset).toString("hex")}`)
        console.warn(' length of tx was ', global.tx ? global.tx.byteLength() : undefined)
        throw new Error()
      }
    }

    if (offset !== buf.byteLength) {throw new Error()};
    return new PSBT(global, inputs)
  }

  public encodeForBroadCasting(network: Network) {
    console.warn("not yet implemented!")
  }

  public conbine(other: PSBT) {
    console.warn("not yet implemented!")
  }
}

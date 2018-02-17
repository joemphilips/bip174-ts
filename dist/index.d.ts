/// <reference types="node" />
import { Transaction, Network, Out } from 'bitcoinjs-lib';
import { BlockchainProxy } from 'blockchain-proxy';
export declare enum PSBTValueType {
    UNSIGNED_TX_OR_NON_WITNESS_UTXO = 0,
    REDEEM_SCRIPT_OR_WITNESS_UTXO = 1,
    WITNESS_SCRIPT_OR_PARTIAL_SIG = 2,
    BIP32_KEYPATH_OR_SIGHASH = 3,
    NINPUTS_OR_INDEX = 4,
}
export declare class GlobalKVMap {
    separator: number;
    tx?: Transaction;
    redeemScripts: Buffer[];
    witnessScripts: Buffer[];
    pubKeys: Buffer[];
    derivePath: Buffer[];
    inputN: number;
    constructor();
}
export declare class InputKVMap {
    separator: number;
    nonWitnessUTXO: Transaction;
    witnessUTXO: Out;
    sighashRecommended: number;
    index: number;
    partialSig: {
        pubkey: Buffer;
        sig: Buffer;
    };
    constructor();
}
export interface PSBTInterface {
    global: GlobalKVMap;
    inputs: InputKVMap[];
    inputN?: number;
    separator?: number;
    magicBytes?: number;
}
export default class PSBT implements PSBTInterface {
    global: GlobalKVMap;
    inputs: InputKVMap[];
    private static magicBytes;
    private static separator;
    constructor(global: GlobalKVMap, inputs: InputKVMap[]);
    static fromHexString<P extends BlockchainProxy>(opts: string, p: P): PSBT;
    static fromTransaction(opts: Transaction): void;
    static fromBuffer<P extends BlockchainProxy>(buf: Buffer, proxy: P): PSBT;
    encodeForBroadCasting(network: Network): void;
    conbine(other: PSBT): void;
}

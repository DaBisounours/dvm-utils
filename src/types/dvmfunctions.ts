import { Argument, DVMType } from "./program"

export type DVMFunction = {
    return: DVMType,
    args: Argument[],
    description: string,
    computeCost: number,
    storageCost: number,
} | {
    description: "Panics",
    computeCost: 10000,
    storageCost: 0,
}

export const DVMFunctions: { [name: string]: DVMFunction } = {

    "VERSION": {
        args: [
            { name: "v", type: DVMType.String }
        ],

        description: `Sets a version to dvm.VERSION. Returns 1 if successful, panics otherwise.`,
        return: DVMType.Uint64,
        computeCost: 1000,
        storageCost: 0,
    },

    "LOAD": {
        args: [
            {name: 'key', type: DVMType.unknown}
        ],

        description: `Loads a variable which was previously stored in the blockchain using STORE function. Return type will depend on what is stored. It will panic if the value does NOT exist.`,
        return: DVMType.unknown,
        computeCost: 5000,
        storageCost: 0,
    },

    "EXISTS": {
        args: [
            {name: 'key', type: DVMType.unknown}
        ],

        description: `Return 1 if the variable is stored in DB via STORE and 0 otherwise.`,
        return: DVMType.Uint64,
        computeCost: 5000,
        storageCost: 0,
    },

    "STORE": {
        args: [
            {name: 'key', type: DVMType.unknown},
            {name: 'value', type: DVMType.unknown},
            
        ],

        description: `Stores key and value in the DB. All storage state of the SC is accessible only from the SC which created it. Returns 1.`,
        return: DVMType.Uint64,
        computeCost: 10000,
        storageCost: 0,
    },

    "DELETE": {
        args: [
            {name: 'key', type: DVMType.unknown}
        ],

        description: `Sets the rawkey value to []byte{} effectively deleting it from storage. Returns 1.`,
        return: DVMType.Uint64,
        computeCost: 3000,
        storageCost: 0,
    },

    "MAPEXISTS": {
        args: [
            {name: 'key', type: DVMType.unknown}
        ],

        description: `Returns 1 if the variable has been stored in RAM (current invoke session) via MAPSTORE and 0 otherwise.`,
        return: DVMType.Uint64,
        computeCost: 1000,
        storageCost: 0,
    },

    "MAPGET": {
        args: [
            {name: 'key', type: DVMType.unknown}
        ],

        description: `Loads a variable which was previously stored in RAM (current invoke session) via MAPSTORE. Return type will depend on what is stored. I twill panic if the value does NOT exist.`,
        return: DVMType.unknown,
        computeCost: 1000,
        storageCost: 0,
    },

    "MAPSTORE": {
        args: [
            {name: 'key', type: DVMType.unknown},
            {name: 'value', type: DVMType.unknown},
        ],

        description: `Stores key and value in RAM (current invoke session). All MAPSTORE state is accessible only from the session in which it is stored. Returns 1.`,
        return: DVMType.Uint64,
        computeCost: 1000,
        storageCost: 0,
    },

    "MAPDELETE": {
        args: [
            {name: 'key', type: DVMType.unknown}
        ],

        description: `Deletes the element from the map in RAM (current invoke session). If the key does not exist, delete has no action. Returns 1.`,
        return: DVMType.Uint64,
        computeCost: 1000,
        storageCost: 0,
    },

    "RANDOM": {
        args: [
            { name: "limit", type: DVMType.Uint64 }
        ],

        description: `RANDOM returns a random using a PRNG seeded on BLID,SCID,TXID. First form gives a DVMType.Uint64, second form returns random number in the range 0 - (limit), 0 is inclusive, limit is exclusive.`,
        return: DVMType.Uint64,
        computeCost: 2500,
        storageCost: 0,
    },

    "SCID": {
        args: [],

        description: `Returns SMART CONTRACT ID which is currently running.`,
        return: DVMType.String,
        computeCost: 2000,
        storageCost: 0,
    },

    "BLID": {
        args: [],

        description: `Returns current BLOCK ID which contains current execution-in-progress TXID.`,
        return: DVMType.String,
        computeCost: 2000,
        storageCost: 0,
    },

    "TXID": {
        args: [],

        description: `Returns current TXID which is execution-in-progress.`,
        return: DVMType.String,
        computeCost: 2000,
        storageCost: 0,
    },

    "DERO": {
        args: [],

        description: `Returns a string representation of zerohash which is of type crypto.Hash.`,
        return: DVMType.String,
        computeCost: 10000,
        storageCost: 0,
    },

    "BLOCK_HEIGHT": {
        args: [],

        description: `Returns current chain height of BLID().`,
        return: DVMType.Uint64,
        computeCost: 2000,
        storageCost: 0,
    },

    "BLOCK_TIMESTAMP": {
        args: [],

        description: `Returns current timestamp of BLID().`,
        return: DVMType.Uint64,
        computeCost: 2500,
        storageCost: 0,
    },

    "SIGNER": {
        args: [],

        description: `Returns address of who signed this transaction. Ringsize of tx must be 2 for this value to be known or else empty.`,
        return: DVMType.String,
        computeCost: 5000,
        storageCost: 0,
    },

    "UPDATE_SC_CODE": {
        args: [
            { name: "sc_code", type: DVMType.String }
        ],

        description: `Stores updated SC code of type string. If it is not of type string, return 0, else return 1.`,
        return: DVMType.Uint64,
        computeCost: 5000,
        storageCost: 0,
    },

    "IS_ADDRESS_VALID": {
        args: [
            { name: "address", type: DVMType.String }
        ],

        description: `Returns 1 if address is valid, 0 otherwise.`,
        return: DVMType.Uint64,
        computeCost: 50000,
        storageCost: 0,
    },

    "ADDRESS_RAW": {
        args: [
            { name: "address", type: DVMType.String }
        ],

        description: `Returns address in RAW form as 33 byte keys, stripping away textual/presentation form. 2 address should always be compared in RAW form.`,
        return: DVMType.String,
        computeCost: 60000,
        storageCost: 0,
    },

    "ADDRESS_STRING": {
        args: [
            { name: "p", type: DVMType.String }
        ],

        description: `Returns address in STRING form. If it can be evaluated, a string form of an address will be returned, otherwise return an empty string.`,
        return: DVMType.String,
        computeCost: 50000,
        storageCost: 0,
    },

    "SEND_DERO_TO_ADDRESS": {
        args: [
            { name: "a", type: DVMType.String },
            { name: "amount", type: DVMType.Uint64 },
        ],

        description: `Sends amount DERO from SC DERO balance to a address which should be raw form. Address must be in string DERO/DETO form. If the SC does not have enough balance, it will panic.`,
        return: DVMType.Uint64,
        computeCost: 70000,
        storageCost: 0,
    },

    "SEND_ASSET_TO_ADDRESS": {
        args: [
            { name: "a", type: DVMType.String },
            { name: "amount", type: DVMType.Uint64 },
            { name: "asset", type: DVMType.String }
        ],

        description: `Sends amount ASSET from SC ASSET balance to a address which should be raw form. Address must be in string DERO/DETO form. If the SC does not have enough balance, it will panic.`,
        return: DVMType.Uint64,
        computeCost: 90000,
        storageCost: 0,
    },

    "DEROVALUE": {
        args: [],

        description: `Gets the amount of DERO sent within this transaction.`,
        return: DVMType.Uint64,
        computeCost: 10000,
        storageCost: 0,
    },

    "ASSETVALUE": {
        args: [
            { name: "asset", type: DVMType.String }
        ],

        description: `Gets the amount of a given ASSET sent within this transaction.`,
        return: DVMType.Uint64,
        computeCost: 10000,
        storageCost: 0,
    },

    "ATOI": {
        args: [
            { name: "s", type: DVMType.String }
        ],

        description: `Returns a DVMType.Uint64 representation of a string. Else panic.`,
        return: DVMType.Uint64,
        computeCost: 5000,
        storageCost: 0,
    },

    "ITOA": {
        args: [
            { name: "n", type: DVMType.Uint64 }
        ],

        description: `Returns string representation of a DVMType.Uint64. Else panic.`,
        return: DVMType.String,
        computeCost: 5000,
        storageCost: 0,
    },

    "SHA256": {
        args: [
            { name: "s", type: DVMType.String }
        ],

        description: `Returns a string sha2-256 hash of a given string. Else panic.`,
        return: DVMType.String,
        computeCost: 25000,
        storageCost: 0,
    },

    "SHA3256": {
        args: [
            { name: "s", type: DVMType.String }
        ],

        description: `Returns a string sha3-256 hash of a given string. Else panic.`,
        return: DVMType.String,
        computeCost: 25000,
        storageCost: 0,
    },

    "KECCAK256": {
        args: [
            { name: "s", type: DVMType.String }
        ],

        description: `Returns a string sha3-keccak256 hash of a given string. Else panic.`,
        return: DVMType.String,
        computeCost: 25000,
        storageCost: 0,
    },

    "HEX": {
        args: [
            { name: "s", type: DVMType.String }
        ],

        description: `Returns a hex encoded string value of a given string. Else panic.`,
        return: DVMType.String,
        computeCost: 10000,
        storageCost: 0,
    },

    "HEXDECODE": {
        args: [
            { name: "s", type: DVMType.String }
        ],

        description: `Returns a hex decoded string value of a given hex string. Else panic.`,
        return: DVMType.String,
        computeCost: 10000,
        storageCost: 0,
    },

    "MIN": {
        args: [
            { name: "f", type: DVMType.Uint64 },
            { name: "s", type: DVMType.Uint64 },
        ],

        description: `Returns the minimum value of 2 DVMType.Uint64 values. Else panic.`,
        return: DVMType.Uint64,
        computeCost: 5000,
        storageCost: 0,
    },

    "MAX": {
        args: [
            { name: "f", type: DVMType.Uint64 },
            { name: "s", type: DVMType.Uint64 },
        ],

        description: `Returns the maximum value of 2 DVMType.Uint64 values. Else panic.`,
        return: DVMType.Uint64,
        computeCost: 5000,
        storageCost: 0,
    },

    "STRLEN": {
        args: [
            { name: "s", type: DVMType.String }
        ],

        description: `Returns the length of a given string in DVMType.Uint64. Else panic.`,
        return: DVMType.Uint64,
        computeCost: 20000,
        storageCost: 0,
    },

    "SUBSTR": {
        args: [
            { name: "s", type: DVMType.String },
            { name: "offset", type: DVMType.Uint64 },
            { name: "length", type: DVMType.Uint64 }
        ],

        description: `Returns the substring of a given string with offset and length defined. Else panic.`,
        return: DVMType.String,
        computeCost: 20000,
        storageCost: 0,
    },
    "PANIC": {
        description: "Panics",
        computeCost: 10000,
        storageCost: 0,
    }



}


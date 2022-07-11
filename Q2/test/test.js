const { expect, assert } = require("chai");
const { ethers } = require("hardhat");
const { groth16, plonk } = require("snarkjs");

const wasm_tester = require("circom_tester").wasm;

const F1Field = require("ffjavascript").F1Field;
const Scalar = require("ffjavascript").Scalar;
exports.p = Scalar.fromString(
  "21888242871839275222246405745257275088548364400416034343698204186575808495617"
);
const Fr = new F1Field(exports.p);

describe("HelloWorld", function () {
  this.timeout(100000000);
  let Verifier;
  let verifier;

  beforeEach(async function () {
    Verifier = await ethers.getContractFactory("HelloWorldVerifier");
    verifier = await Verifier.deploy();
    await verifier.deployed();
  });

  it("Circuit should multiply two numbers correctly", async function () {
    const circuit = await wasm_tester("contracts/circuits/HelloWorld.circom");

    const INPUT = {
      a: 2,
      b: 3,
    };

    const witness = await circuit.calculateWitness(INPUT, true);

    // console.log(witness);

    assert(Fr.eq(Fr.e(witness[0]), Fr.e(1)));
    assert(Fr.eq(Fr.e(witness[1]), Fr.e(6)));
  });

  it("Should return true for correct proof", async function () {
    //[assignment] Add comments to explain what each line is doing
    // create proof and output with given inputs, circuit, and zkey.
    const { proof, publicSignals } = await groth16.fullProve(
      { a: "2", b: "3" },
      "contracts/circuits/HelloWorld/HelloWorld_js/HelloWorld.wasm",
      "contracts/circuits/HelloWorld/circuit_final.zkey"
    );

    // show output value in console.
    console.log("2x3 =", publicSignals[0]);

    // get proof publicSignals value from contract call data
    const calldata = await groth16.exportSolidityCallData(proof, publicSignals);
    // console.log(calldata);

    // split each value and assign them to argv array.
    const argv = calldata
      .replace(/["[\]\s]/g, "")
      .split(",")
      .map((x) => BigInt(x).toString());

    // first two values are a
    const a = [argv[0], argv[1]];

    // second four values are b
    const b = [
      [argv[2], argv[3]],
      [argv[4], argv[5]],
    ];

    // third two values are c
    const c = [argv[6], argv[7]];

    // the last value is input
    const Input = argv.slice(8);

    // verify proof and test its result is true.
    expect(await verifier.verifyProof(a, b, c, Input)).to.be.true;
  });
  it("Should return false for invalid proof", async function () {
    let a = [0, 0];
    let b = [
      [0, 0],
      [0, 0],
    ];
    let c = [0, 0];
    let d = [0];
    expect(await verifier.verifyProof(a, b, c, d)).to.be.false;
  });
});

describe("Multiplier3 with Groth16", function () {
  this.timeout(100000000);
  let Verifier;
  let verifier;

  beforeEach(async function () {
    //[assignment] insert your script here
    Verifier = await ethers.getContractFactory("Multiplier3Verifier");
    verifier = await Verifier.deploy();
    await verifier.deployed();
  });

  it("Circuit should multiply three numbers correctly", async function () {
    //[assignment] insert your script here
    const circuit = await wasm_tester("contracts/circuits/Multiplier3.circom");

    const INPUT = {
      a: 4,
      b: 3,
    };

    const witness = await circuit.calculateWitness(INPUT, true);

    // console.log(witness);

    assert(Fr.eq(Fr.e(witness[0]), Fr.e(1)));
    assert(Fr.eq(Fr.e(witness[1]), Fr.e(72)));
  });

  it("Should return true for correct proof", async function () {
    //[assignment] insert your script here
    const { proof, publicSignals } = await groth16.fullProve(
      { a: "2", b: "3" },
      "contracts/circuits/Multiplier3/Multiplier3_js/Multiplier3.wasm",
      "contracts/circuits/Multiplier3/circuit_final.zkey"
    );

    // show output value in console.
    console.log("2x3x6=", publicSignals[0]);
    // console.log("proof:", proof);

    // get proof publicSignals value from contract call data
    const calldata = await groth16.exportSolidityCallData(proof, publicSignals);
    // console.log(calldata);

    // split each value and assign them to argv array.
    const argv = calldata
      .replace(/["[\]\s]/g, "")
      .split(",")
      .map((x) => BigInt(x).toString());

    // first two values are a
    const a = [argv[0], argv[1]];

    // second four values are b
    const b = [
      [argv[2], argv[3]],
      [argv[4], argv[5]],
    ];

    // third two values are c
    const c = [argv[6], argv[7]];

    // the last value is input
    const Input = argv.slice(8);

    // verify proof and test its result is true.
    expect(await verifier.verifyProof(a, b, c, Input)).to.be.true;
  });

  it("Should return false for invalid proof", async function () {
    //[assignment] insert your script here
    let a = [0, 0];
    let b = [
      [0, 0],
      [0, 0],
    ];
    let c = [0, 0];
    let d = [0];
    expect(await verifier.verifyProof(a, b, c, d)).to.be.false;
  });
});

describe("Multiplier3 with PLONK", function () {
  this.timeout(100000000);
  let Verifier;
  let verifier;

  beforeEach(async function () {
    //[assignment] insert your script here
    Verifier = await ethers.getContractFactory("PlonkVerifier");
    verifier = await Verifier.deploy();
    await verifier.deployed();
  });

  it("Should return true for correct proof", async function () {
    //[assignment] insert your script here
    const { proof, publicSignals } = await plonk.fullProve(
      { a: "2", b: "5" },
      "contracts/circuits/Multiplier3_plonk/Multiplier3_js/Multiplier3.wasm",
      "contracts/circuits/Multiplier3_plonk/circuit_final.zkey"
    );

    // show output value in console.
    console.log("2x5x6=", publicSignals[0]);
    // console.log("proof:", proof);

    const calldata = await plonk.exportSolidityCallData(proof, publicSignals);
    // console.log(calldata);

    const argv = calldata.replace(/["[\]\s]/g, "").split(",");

    // console.log(argv);
    const a = argv[0];
    const Input = argv[1];

    expect(await verifier.verifyProof(a, [Input])).to.be.true;
  });

  it("Should return false for invalid proof", async function () {
    //[assignment] insert your script here
    let a = "0x1ab032f04e7b2105f2ad7f407a28ef4d";
    let d = [0];
    expect(await verifier.verifyProof(a, d)).to.be.false;
  });
});

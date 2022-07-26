import { expect } from "chai";
import hre from "hardhat";

describe("Testing ERC-1155 CrossTalk Contract", function () {
  beforeEach(async function () {
    this.hre = hre;
    this.accounts = await this.hre.ethers.getSigners();
    this.tester1 = this.accounts[0].address;
    this.tester2 = this.accounts[2].address;

    this.bridge = await this.hre.ethers.getContractFactory(
      "GenericHandlerTest"
    );
    this.bridgeInstance = await this.bridge.deploy();
    await this.bridgeInstance.deployed();

    this.CERC1155 = await this.hre.ethers.getContractFactory("CERC1155");
    this.CERC1155Instance = await this.CERC1155.deploy(
      "abcd.xyz",
      this.bridgeInstance.address
    );
    await this.CERC1155Instance.deployed();

    await this.CERC1155Instance.mint(this.tester2, [1, 2, 3], [10, 11, 12]);

    this.network = await this.hre.ethers.provider.getNetwork();

    await this.bridgeInstance.linkContract(
      this.CERC1155Instance.address,
      111,
      this.CERC1155Instance.address
    );
  });

  it("Router Crosstalk - Checking transferCrossChain Function", async function () {
    await this.CERC1155Instance.setCrossChainGasLimit(10000);
    await this.CERC1155Instance.setCrossChainGasPrice(100000000000);
    let gaslimit = await this.CERC1155Instance.fetchCrossChainGasLimit();
    let gasprice = await this.CERC1155Instance.fetchCrossChainGasPrice();
    console.log("GAS LIMIT = " + gaslimit.toString());
    console.log("GAS PRICE = " + gasprice.toString());
    await this.CERC1155Instance.transferCrossChain(
      111,
      this.tester2,
      [1, 2, 3],
      [2, 2, 2],
      "0x00"
    );
    let Logs1 = await this.bridgeInstance.queryFilter("deposit");
    let Logs2 = await this.CERC1155Instance.queryFilter("CrossTalkSend");
    await this.bridgeInstance.execute(
      this.CERC1155Instance.address,
      Logs2[0].args.sourceChain,
      this.CERC1155Instance.address,
      Logs1[0].args._data,
      Logs2[0].args._hash
    );
    let balanceTester1 = await this.CERC1155Instance.balanceOfBatch(
      [this.tester1, this.tester1, this.tester1],
      [1, 2, 3]
    );
    let balanceTester2 = await this.CERC1155Instance.balanceOfBatch(
      [this.tester2, this.tester2, this.tester2],
      [1, 2, 3]
    );
    console.log("BALANCE OF TESTER 1 " + balanceTester1);
    console.log("BALANCE OF TESTER 2 " + balanceTester2);
    expect(balanceTester2[0].toString()).to.be.equal("12");
    expect(balanceTester2[1].toString()).to.be.equal("13");
    expect(balanceTester2[2].toString()).to.be.equal("14");
  });

  it("Router Crosstalk - Checking Replay Event", async function () {
    await this.CERC1155Instance.setCrossChainGasLimit(10000);
    await this.CERC1155Instance.setCrossChainGasPrice(100000000000);
    let gaslimit = await this.CERC1155Instance.fetchCrossChainGasLimit();
    let gasprice = await this.CERC1155Instance.fetchCrossChainGasPrice();
    console.log("GAS LIMIT = " + gaslimit.toString());
    console.log("GAS PRICE = " + gasprice.toString());
    await this.CERC1155Instance.transferCrossChain(
      111,
      this.tester2,
      [1, 2, 3],
      [3, 3, 3],
      "0x00"
    );
    let Logs1 = await this.bridgeInstance.queryFilter("deposit");
    let Logs2 = await this.CERC1155Instance.queryFilter("CrossTalkSend");
    let executes = await this.CERC1155Instance.fetchExecutes(
      Logs2[0].args._hash
    );
    let nonce = executes.nonce;
    await this.CERC1155Instance.replayTransferCrossChain(
      nonce,
      15000,
      150000000000
    );
    let Logs3 = await this.bridgeInstance.queryFilter("ReplayEvent");
    console.log(Logs3);
    await this.bridgeInstance.execute(
      this.CERC1155Instance.address,
      Logs2[0].args.sourceChain,
      this.CERC1155Instance.address,
      Logs1[0].args._data,
      Logs2[0].args._hash
    );
    let balanceTester1 = await this.CERC1155Instance.balanceOfBatch(
      [this.tester1, this.tester1, this.tester1],
      [1, 2, 3]
    );
    let balanceTester2 = await this.CERC1155Instance.balanceOfBatch(
      [this.tester2, this.tester2, this.tester2],
      [1, 2, 3]
    );
    console.log("BALANCE OF TESTER 1 " + balanceTester1);
    console.log("BALANCE OF TESTER 2 " + balanceTester2);
    expect(balanceTester2[0].toString()).to.be.equal("13");
    expect(balanceTester2[1].toString()).to.be.equal("14");
    expect(balanceTester2[2].toString()).to.be.equal("15");
  });
});

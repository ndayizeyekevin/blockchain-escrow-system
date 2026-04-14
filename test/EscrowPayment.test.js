/**
 * Test Suite for EscrowPayment Contract
 * Run with: npx hardhat test
 */

const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("EscrowPayment Contract", function () {
  let escrowPayment;
  let client;
  let freelancer;
  let otherAccount;

  beforeEach(async function () {
    // Get signers (accounts)
    [client, freelancer, otherAccount] = await ethers.getSigners();

    // Deploy the contract
    const EscrowPayment = await ethers.getContractFactory("EscrowPayment");
    escrowPayment = await EscrowPayment.connect(client).deploy();
    await escrowPayment.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the deployer as client", async function () {
      expect(await escrowPayment.client()).to.equal(client.address);
    });

    it("Should initialize with zero escrow amount", async function () {
      expect(await escrowPayment.escrowAmount()).to.equal(0);
    });

    it("Should initialize with false work submission status", async function () {
      expect(await escrowPayment.workSubmitted()).to.equal(false);
    });
  });

  describe("Creating Escrow", function () {
    it("Should create escrow with ETH deposit", async function () {
      const depositAmount = ethers.parseEther("1.0");
      const description = "Web development project";

      const tx = await escrowPayment.connect(client).createEscrow(
        freelancer.address,
        description,
        { value: depositAmount }
      );

      expect(await escrowPayment.escrowAmount()).to.equal(depositAmount);
      expect(await escrowPayment.freelancer()).to.equal(freelancer.address);
      expect(await escrowPayment.workDescription()).to.equal(description);
    });

    it("Should revert if escrow amount is zero", async function () {
      await expect(
        escrowPayment.connect(client).createEscrow(
          freelancer.address,
          "Test",
          { value: 0 }
        )
      ).to.be.revertedWith("Escrow amount must be greater than 0");
    });

    it("Should emit EscrowCreated event", async function () {
      const depositAmount = ethers.parseEther("1.0");

      await expect(
        escrowPayment.connect(client).createEscrow(
          freelancer.address,
          "Test project",
          { value: depositAmount }
        )
      ).to.emit(escrowPayment, "EscrowCreated");
    });
  });

  describe("Submitting Work", function () {
    beforeEach(async function () {
      const depositAmount = ethers.parseEther("1.0");
      await escrowPayment.connect(client).createEscrow(
        freelancer.address,
        "Web development",
        { value: depositAmount }
      );
    });

    it("Should allow freelancer to submit work", async function () {
      const submissionDetails = "Completed website";
      
      await escrowPayment.connect(freelancer).submitWork(submissionDetails);
      
      expect(await escrowPayment.workSubmitted()).to.equal(true);
    });

    it("Should revert if non-freelancer tries to submit work", async function () {
      await expect(
        escrowPayment.connect(otherAccount).submitWork("Work details")
      ).to.be.revertedWith("Only freelancer can call this function");
    });

    it("Should emit WorkSubmitted event", async function () {
      await expect(
        escrowPayment.connect(freelancer).submitWork("Completed work")
      ).to.emit(escrowPayment, "WorkSubmitted");
    });

    it("Should not allow submitting work twice", async function () {
      await escrowPayment.connect(freelancer).submitWork("First submission");
      
      await expect(
        escrowPayment.connect(freelancer).submitWork("Second submission")
      ).to.be.revertedWith("Work has already been submitted");
    });
  });

  describe("Approving Work and Releasing Payment", function () {
    beforeEach(async function () {
      const depositAmount = ethers.parseEther("1.0");
      await escrowPayment.connect(client).createEscrow(
        freelancer.address,
        "Web development",
        { value: depositAmount }
      );
      
      await escrowPayment.connect(freelancer).submitWork("Completed website");
    });

    it("Should allow client to approve work", async function () {
      await escrowPayment.connect(client).approveWork();
      
      expect(await escrowPayment.workApproved()).to.equal(true);
      expect(await escrowPayment.paymentReleased()).to.equal(true);
    });

    it("Should release payment to freelancer", async function () {
      const depositAmount = ethers.parseEther("1.0");
      const initialBalance = await ethers.provider.getBalance(freelancer.address);

      await escrowPayment.connect(client).approveWork();

      const finalBalance = await ethers.provider.getBalance(freelancer.address);
      expect(finalBalance).to.be.gt(initialBalance);
    });

    it("Should revert if non-client tries to approve", async function () {
      await expect(
        escrowPayment.connect(otherAccount).approveWork()
      ).to.be.revertedWith("Only client can call this function");
    });

    it("Should emit WorkApproved and PaymentReleased events", async function () {
      await expect(
        escrowPayment.connect(client).approveWork()
      ).to.emit(escrowPayment, "WorkApproved");
    });

    it("Should revert if work is not submitted", async function () {
      const EscrowPayment = await ethers.getContractFactory("EscrowPayment");
      const newEscrow = await EscrowPayment.connect(client).deploy();
      
      const depositAmount = ethers.parseEther("1.0");
      await newEscrow.connect(client).createEscrow(
        freelancer.address,
        "Test",
        { value: depositAmount }
      );

      await expect(
        newEscrow.connect(client).approveWork()
      ).to.be.revertedWith("Work has not been submitted yet");
    });
  });

  describe("Cancelling Escrow", function () {
    it("Should allow client to cancel before work submission", async function () {
      const depositAmount = ethers.parseEther("1.0");
      const initialBalance = await ethers.provider.getBalance(client.address);

      await escrowPayment.connect(client).createEscrow(
        freelancer.address,
        "Test",
        { value: depositAmount }
      );

      const tx = await escrowPayment.connect(client).cancelEscrow();

      expect(await escrowPayment.escrowAmount()).to.equal(0);
    });

    it("Should revert if trying to cancel after work submission", async function () {
      const depositAmount = ethers.parseEther("1.0");
      
      await escrowPayment.connect(client).createEscrow(
        freelancer.address,
        "Test",
        { value: depositAmount }
      );
      
      await escrowPayment.connect(freelancer).submitWork("Work submitted");

      await expect(
        escrowPayment.connect(client).cancelEscrow()
      ).to.be.revertedWith("Cannot cancel after work submission");
    });
  });

  describe("Status Functions", function () {
    it("Should return correct escrow status", async function () {
      const depositAmount = ethers.parseEther("1.0");
      
      await escrowPayment.connect(client).createEscrow(
        freelancer.address,
        "Web project",
        { value: depositAmount }
      );

      const status = await escrowPayment.getEscrowStatus();
      
      expect(status._client).to.equal(client.address);
      expect(status._freelancer).to.equal(freelancer.address);
      expect(status._escrowAmount).to.equal(depositAmount);
      expect(status._workSubmitted).to.equal(false);
      expect(status._description).to.equal("Web project");
    });

    it("Should return contract balance", async function () {
      const depositAmount = ethers.parseEther("1.0");
      
      await escrowPayment.connect(client).createEscrow(
        freelancer.address,
        "Test",
        { value: depositAmount }
      );

      const balance = await escrowPayment.getContractBalance();
      expect(balance).to.equal(depositAmount);
    });
  });
});

import { expect } from "chai";
import { ethers } from "hardhat";

describe("NeevTrace Supply Chain System", function () {
  let batchContract: any;
  let nodeContract: any;
  let supplyChainContract: any;
  
  let owner: any;
  let manufacturer: any;
  let logistics: any;
  let supplier: any;

  beforeEach(async function () {
    [owner, manufacturer, logistics, supplier] = await ethers.getSigners();

    // Deploy contracts
    const BatchContractFactory = await ethers.getContractFactory("BatchContract");
    batchContract = await BatchContractFactory.deploy();

    const NodeTrackingContractFactory = await ethers.getContractFactory("NodeTrackingContract");
    nodeContract = await NodeTrackingContractFactory.deploy();

    const SupplyChainContractFactory = await ethers.getContractFactory("SupplyChainContract");
    supplyChainContract = await SupplyChainContractFactory.deploy(
      await batchContract.getAddress(),
      await nodeContract.getAddress()
    );

    // Grant roles
    await batchContract.grantManufacturerRole(await manufacturer.getAddress());
    await batchContract.grantLogisticsRole(await logistics.getAddress());
    await batchContract.grantSupplierRole(await supplier.getAddress());
    
    await supplyChainContract.grantManufacturerRole(await manufacturer.getAddress());
    await supplyChainContract.grantLogisticsRole(await logistics.getAddress());
  });

  describe("BatchContract", function () {
    it("Should create a batch with QR code", async function () {
      const tx = await batchContract.connect(manufacturer).createBatch(
        "Organic Cotton T-Shirts",
        1000,
        "Mumbai, India",
        "QmTestHash123"
      );

      const receipt = await tx.wait();
      const event = receipt.logs.find((log: any) => {
        try {
          const parsed = batchContract.interface.parseLog(log);
          return parsed?.name === "BatchCreated";
        } catch {
          return false;
        }
      });

      expect(event).to.exist;

      const batchInfo = await batchContract.getBatchInfo(1);
      expect(batchInfo.productType).to.equal("Organic Cotton T-Shirts");
      expect(batchInfo.quantity).to.equal(1000);
      expect(batchInfo.manufacturer).to.equal(await manufacturer.getAddress());
    });

    it("Should generate unique QR codes", async function () {
      await batchContract.connect(manufacturer).createBatch(
        "Product A", 100, "Location A", "Hash A"
      );
      await batchContract.connect(manufacturer).createBatch(
        "Product B", 200, "Location B", "Hash B"
      );

      const batch1 = await batchContract.getBatchInfo(1);
      const batch2 = await batchContract.getBatchInfo(2);

      expect(batch1.qrCode).to.not.equal(batch2.qrCode);
    });

    it("Should scan QR code and return batch ID", async function () {
      await batchContract.connect(manufacturer).createBatch(
        "Test Product", 100, "Test Location", "Test Hash"
      );
      
      const batchInfo = await batchContract.getBatchInfo(1);
      const qrCode = batchInfo.qrCode;

      const scannedBatchId = await batchContract.scanQRCode(qrCode);
      expect(scannedBatchId).to.equal(1);
    });

    it("Should validate batch integrity", async function () {
      await batchContract.connect(manufacturer).createBatch(
        "Test Product", 100, "Test Location", "Test Hash"
      );

      const isValid = await batchContract.validateBatchIntegrity(1);
      expect(isValid).to.be.true;
    });

    it("Should revert if non-manufacturer tries to create batch", async function () {
      await expect(
        batchContract.connect(logistics).createBatch(
          "Unauthorized Product", 100, "Location", "Hash"
        )
      ).to.be.revertedWith("BatchContract: Caller is not a manufacturer");
    });
  });

  describe("NodeTrackingContract", function () {
    let nodeId: number;

    beforeEach(async function () {
      // Create a test node
      await nodeContract.createNode(
        "Test Warehouse",
        "Mumbai, India",
        1, // Warehouse type
        await logistics.getAddress(),
        "19.0760,72.8777"
      );
      nodeId = 1; // First node created
    });

    it("Should record batch entry and exit", async function () {
      // First create a batch
      await batchContract.connect(manufacturer).createBatch(
        "Test Product", 100, "Mumbai", "Hash"
      );

      // Record entry
      await nodeContract.connect(logistics).recordBatchEntry(
        1, nodeId, "Batch received at warehouse"
      );

      // Check current location
      const location = await nodeContract.getCurrentLocation(1);
      expect(location.nodeId).to.equal(nodeId);

      // Record exit
      await nodeContract.connect(logistics).recordBatchExit(1, nodeId);

      // Check transit history
      const history = await nodeContract.getTransitHistory(1);
      expect(history.length).to.equal(2); // Entry and exit
      expect(history[0].isEntryPoint).to.be.true;
      expect(history[1].isExitPoint).to.be.true;
    });
  });

  describe("SupplyChainContract", function () {
    beforeEach(async function () {
      // Create test nodes
      await nodeContract.createNode("Origin", "Mumbai", 0, await manufacturer.getAddress(), "19.0760,72.8777");
      await nodeContract.createNode("Warehouse", "Delhi", 1, await logistics.getAddress(), "28.7041,77.1025");
      await nodeContract.createNode("Exit", "Kolkata Port", 5, await logistics.getAddress(), "22.5726,88.3639");
    });

    it("Should create complete supply chain journey", async function () {
      const tx = await supplyChainContract.connect(manufacturer).createSupplyChainJourney(
        "Organic Cotton Textiles",
        5000,
        "Mumbai Manufacturing Hub",
        "QmSupplyChainHash",
        "International Export"
      );

      const receipt = await tx.wait();
      const event = receipt.logs.find((log: any) => {
        try {
          const parsed = supplyChainContract.interface.parseLog(log);
          return parsed?.name === "SupplyChainJourneyStarted";
        } catch {
          return false;
        }
      });

      expect(event).to.exist;

      const journey = await supplyChainContract.getSupplyChainHistory(1);
      expect(journey.isComplete).to.be.false;
      expect(journey.finalDestination).to.equal("International Export");
    });

    it("Should track batch through multiple nodes", async function () {
      // Create journey
      await supplyChainContract.connect(manufacturer).createSupplyChainJourney(
        "Test Product", 1000, "Origin", "Hash", "Destination"
      );

      // Move through nodes
      await supplyChainContract.connect(manufacturer).updateBatchLocation(
        1, 1, "Batch created at origin"
      );

      await supplyChainContract.connect(logistics).updateBatchLocation(
        1, 2, "Batch reached warehouse"
      );

      await supplyChainContract.connect(logistics).updateBatchLocation(
        1, 3, "Batch at exit point"
      );

      // Check journey completion
      const journey = await supplyChainContract.getSupplyChainHistory(1);
      expect(journey.isComplete).to.be.true;
      expect(journey.nodeSequence.length).to.equal(3);
    });

    it("Should validate batch integrity across all contracts", async function () {
      await supplyChainContract.connect(manufacturer).createSupplyChainJourney(
        "Valid Product", 1000, "Origin", "Hash", "Destination"
      );

      // Add some transit records
      await supplyChainContract.connect(manufacturer).updateBatchLocation(
        1, 1, "Initial location"
      );

      const result = await supplyChainContract.validateBatchIntegrity(1);
      expect(result.isValid).to.be.true;
      expect(result.reason).to.equal("Batch integrity valid");
    });
  });

  describe("Integration Tests", function () {
    it("Should demonstrate complete end-to-end flow", async function () {
      // 1. Setup nodes
      await nodeContract.createNode("Mumbai Hub", "Mumbai", 0, await manufacturer.getAddress(), "19.0760,72.8777");
      await nodeContract.createNode("Delhi Center", "Delhi", 1, await logistics.getAddress(), "28.7041,77.1025");
      await nodeContract.createNode("Export Terminal", "Mumbai Port", 5, await logistics.getAddress(), "18.9388,72.8354");

      // 2. Create supply chain journey
      await supplyChainContract.connect(manufacturer).createSupplyChainJourney(
        "Sustainable Cotton Garments",
        10000,
        "Mumbai Manufacturing Facility",
        "QmEndToEndTestHash",
        "European Market"
      );

      // 3. Track through supply chain
      await supplyChainContract.connect(manufacturer).updateBatchLocation(
        1, 1, "Production completed, batch ready for shipment"
      );

      await supplyChainContract.connect(logistics).updateBatchLocation(
        1, 2, "Batch consolidated at distribution center"
      );

      await supplyChainContract.connect(logistics).updateBatchLocation(
        1, 3, "Batch prepared for export"
      );

      // 4. Verify complete journey
      const journey = await supplyChainContract.getSupplyChainHistory(1);
      expect(journey.isComplete).to.be.true;
      expect(journey.nodeSequence.length).to.equal(3);

      // 5. Validate integrity
      const result = await supplyChainContract.validateBatchIntegrity(1);
      expect(result.isValid).to.be.true;

      // 6. Get QR code for public verification
      const batchInfo = await batchContract.getBatchInfo(1);
      expect(batchInfo.qrCode).to.not.be.empty;

      console.log(`✅ End-to-end test completed successfully!`);
      console.log(`📦 Batch ID: 1`);
      console.log(`🔗 QR Code: ${batchInfo.qrCode}`);
      console.log(`📍 Journey completed in ${journey.nodeSequence.length} nodes`);
    });
  });
}); 
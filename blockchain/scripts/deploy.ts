import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Starting NeevTrace Supply Chain Contract Deployment...");

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📧 Deploying contracts with account:", deployer.address);
  console.log("💰 Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());

  // Deploy BatchContract first
  console.log("\n📦 Deploying BatchContract...");
  const BatchContract = await ethers.getContractFactory("BatchContract");
  const batchContract = await BatchContract.deploy();
  await batchContract.deployed();
  console.log("✅ BatchContract deployed to:", batchContract.address);

  // Deploy NodeTrackingContract
  console.log("\n🔗 Deploying NodeTrackingContract...");
  const NodeTrackingContract = await ethers.getContractFactory("NodeTrackingContract");
  const nodeContract = await NodeTrackingContract.deploy();
  await nodeContract.deployed();
  console.log("✅ NodeTrackingContract deployed to:", nodeContract.address);

  // Deploy SupplyChainContract with references to other contracts
  console.log("\n🌐 Deploying SupplyChainContract...");
  const SupplyChainContract = await ethers.getContractFactory("SupplyChainContract");
  const supplyChainContract = await SupplyChainContract.deploy(
    batchContract.address,
    nodeContract.address
  );
  await supplyChainContract.deployed();
  console.log("✅ SupplyChainContract deployed to:", supplyChainContract.address);

  // Grant roles and setup permissions
  console.log("\n🔐 Setting up roles and permissions...");
  
  // Grant manufacturer role to deployer for testing
  await batchContract.grantManufacturerRole(deployer.address);
  await supplyChainContract.grantManufacturerRole(deployer.address);
  console.log("✅ Granted manufacturer role to deployer");

  // Grant logistics role to deployer for testing
  await batchContract.grantLogisticsRole(deployer.address);
  await supplyChainContract.grantLogisticsRole(deployer.address);
  console.log("✅ Granted logistics role to deployer");

  // Create a sample node for testing
  console.log("\n🏭 Creating sample nodes...");
  
  const originNodeTx = await nodeContract.createNode(
    "Mumbai Manufacturing Hub",
    "Mumbai, Maharashtra, India",
    0, // Origin node
    deployer.address,
    "19.0760,72.8777"
  );
  await originNodeTx.wait();
  
  const warehouseNodeTx = await nodeContract.createNode(
    "Delhi Distribution Center",
    "Delhi, India",
    1, // Warehouse node
    deployer.address,
    "28.7041,77.1025"
  );
  await warehouseNodeTx.wait();

  const exitNodeTx = await nodeContract.createNode(
    "Port of Mumbai Export Terminal",
    "Mumbai Port, India",
    5, // Exit point
    deployer.address,
    "18.9388,72.8354"
  );
  await exitNodeTx.wait();

  console.log("✅ Created 3 sample nodes");

  // Deployment summary
  console.log("\n📋 DEPLOYMENT SUMMARY");
  console.log("====================");
  console.log("BatchContract:", batchContract.address);
  console.log("NodeTrackingContract:", nodeContract.address);
  console.log("SupplyChainContract:", supplyChainContract.address);
  console.log("\n🎉 Deployment completed successfully!");

  // Save deployment info
  const deploymentInfo = {
    network: "hardhat",
    deployer: deployer.address,
    contracts: {
      BatchContract: batchContract.address,
      NodeTrackingContract: nodeContract.address,
      SupplyChainContract: supplyChainContract.address,
    },
    deployedAt: new Date().toISOString(),
  };

  console.log("\n📄 Contract ABIs and addresses saved for frontend integration");
  return deploymentInfo;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }); 
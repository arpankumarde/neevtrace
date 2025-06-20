# NeevTrace Blockchain Implementation

This directory contains the complete blockchain infrastructure for NeevTrace's supply chain tracking platform, built with Solidity smart contracts on Ethereum.

## 📋 Overview

The NeevTrace blockchain system consists of three main smart contracts:

1. **BatchContract** - Manages batch creation, QR code generation, and batch metadata
2. **NodeTrackingContract** - Handles transit nodes and tracking points in the supply chain
3. **SupplyChainContract** - Orchestrates the complete supply chain journey and compliance

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    SupplyChainContract                      │
│                   (Main Orchestrator)                      │
└─────────────────┬─────────────────┬─────────────────────────┘
                  │                 │
         ┌────────▼────────┐ ┌──────▼──────────────┐
         │  BatchContract  │ │ NodeTrackingContract│
         │                 │ │                     │
         │ • Batch Creation│ │ • Node Management   │
         │ • QR Generation │ │ • Transit Records   │
         │ • Metadata      │ │ • Location Tracking │
         │ • Status Update │ │ • Verification Hash │
         └─────────────────┘ └─────────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or later)
- npm or pnpm
- MetaMask wallet
- Hardhat

### Installation

```bash
# Install dependencies
npm install

# Install blockchain dependencies
npm install -D hardhat @nomicfoundation/hardhat-toolbox @openzeppelin/contracts
npm install ethers web3 @metamask/sdk
```

### Environment Setup

Create a `.env.local` file with:

```env
PRIVATE_KEY=your_ethereum_private_key_here
SEPOLIA_URL=https://eth-sepolia.g.alchemy.com/v2/your_api_key
NEXT_PUBLIC_BATCH_CONTRACT_ADDRESS=deployed_batch_contract_address
NEXT_PUBLIC_NODE_CONTRACT_ADDRESS=deployed_node_contract_address
NEXT_PUBLIC_SUPPLY_CHAIN_CONTRACT_ADDRESS=deployed_supply_chain_contract_address
```

### Development

```bash
# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test

# Start local blockchain
npx hardhat node

# Deploy to local network (in another terminal)
npx hardhat run blockchain/scripts/deploy.ts --network localhost
```

## 📝 Smart Contract Details

### BatchContract

**Key Functions:**
- `createBatch()` - Creates a new batch with unique QR code
- `scanQRCode()` - Scans QR code and returns batch information
- `updateBatchStatus()` - Updates batch status through supply chain
- `validateBatchIntegrity()` - Validates batch data integrity

**Events:**
- `BatchCreated` - Emitted when a new batch is created
- `QRCodeScanned` - Emitted when QR code is scanned
- `BatchStatusUpdated` - Emitted when batch status changes

### NodeTrackingContract

**Key Functions:**
- `createNode()` - Creates a new tracking node
- `recordBatchEntry()` - Records batch entry into a node
- `recordBatchExit()` - Records batch exit from a node
- `getTransitHistory()` - Gets complete transit history
- `getCurrentLocation()` - Gets current batch location

**Events:**
- `NodeCreated` - Emitted when a new node is created
- `BatchEnteredNode` - Emitted when batch enters a node
- `BatchExitedNode` - Emitted when batch exits a node

### SupplyChainContract

**Key Functions:**
- `createSupplyChainJourney()` - Creates complete supply chain journey
- `updateBatchLocation()` - Updates batch location with validation
- `addBatchCertificate()` - Adds compliance certificates
- `getSupplyChainHistory()` - Gets complete journey history
- `validateBatchIntegrity()` - Comprehensive integrity validation

**Events:**
- `SupplyChainJourneyStarted` - Journey initiation
- `SupplyChainJourneyCompleted` - Journey completion
- `CertificateAdded` - Certificate attachment

## 🔐 Security Features

- **Role-based Access Control** - Different permissions for manufacturers, suppliers, and logistics
- **Pausable Contracts** - Emergency pause functionality
- **Reentrancy Protection** - Prevents reentrancy attacks
- **Input Validation** - Comprehensive input sanitization
- **Gas Optimization** - Efficient contract design to minimize transaction costs

## 🧪 Testing

The test suite covers:

- Batch creation and QR code generation
- Node tracking and transit recording
- Supply chain journey orchestration
- Role-based access control
- Error handling and edge cases
- Integration testing across all contracts

Run tests:
```bash
npx hardhat test
```

## 📊 Usage Examples

### Creating a Batch

```javascript
import { createBatch } from '@/lib/web3';

const result = await createBatch(
  "Organic Cotton T-Shirts",
  1000,
  "Mumbai Manufacturing Hub",
  "QmIPFSHashForMetadata"
);

console.log(`Batch created with ID: ${result.batchId}`);
console.log(`Transaction hash: ${result.txHash}`);
```

### Scanning QR Code

```javascript
import { scanQRCode, getBatchInfo } from '@/lib/web3';

const scanResult = await scanQRCode("NEEV-1-123456789-1672531200");
const batchInfo = await getBatchInfo(scanResult.batchId);

console.log(`Product: ${batchInfo.batch.productType}`);
console.log(`Manufacturer: ${batchInfo.batch.manufacturer}`);
```

### Tracking Supply Chain Journey

```javascript
import { createSupplyChainJourney, updateBatchLocation } from '@/lib/web3';

// Create journey
const journey = await createSupplyChainJourney(
  "Sustainable Textiles",
  5000,
  "Mumbai",
  "QmMetadataHash",
  "European Market"
);

// Update location
await updateBatchLocation(
  journey.batchId,
  "1", // Node ID
  "Batch arrived at distribution center"
);
```

## 🌐 Network Configuration

### Local Development
- **Network:** Hardhat Local
- **Chain ID:** 1337
- **RPC URL:** http://127.0.0.1:8545

### Testnet (Sepolia)
- **Chain ID:** 11155111
- **RPC URL:** https://eth-sepolia.g.alchemy.com/v2/[API_KEY]

### Mainnet (Polygon)
- **Chain ID:** 137
- **RPC URL:** https://polygon-rpc.com/

## 🔧 Contract Addresses

After deployment, update these addresses in your environment:

```env
# Local Development
BATCH_CONTRACT=0x5FbDB2315678afecb367f032d93F642f64180aa3
NODE_CONTRACT=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
SUPPLY_CHAIN_CONTRACT=0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0

# Testnet addresses will be different
# Mainnet addresses will be different
```

## 📚 Integration with Frontend

The contracts integrate with the Next.js frontend through:

1. **Web3 Library** (`src/lib/web3.ts`) - Contract interaction utilities
2. **QR Scanner Component** (`src/components/QRScanner.tsx`) - QR code scanning interface
3. **Dashboard Components** - Real-time tracking and management interfaces

## 🛠️ Deployment

### Local Deployment

```bash
# Start local blockchain
npx hardhat node

# Deploy contracts
npx hardhat run blockchain/scripts/deploy.ts --network localhost
```

### Testnet Deployment

```bash
# Deploy to Sepolia testnet
npx hardhat run blockchain/scripts/deploy.ts --network sepolia
```

### Mainnet Deployment

```bash
# Deploy to Polygon mainnet (production)
npx hardhat run blockchain/scripts/deploy.ts --network polygon
```

## 🔍 Verification

After deployment, verify contracts on Etherscan:

```bash
npx hardhat verify --network sepolia DEPLOYED_CONTRACT_ADDRESS
```

## 📈 Gas Optimization

The contracts are optimized for gas efficiency:

- **Batch Operations** - ~200,000 gas for batch creation
- **Node Tracking** - ~150,000 gas for transit recording
- **Supply Chain Updates** - ~100,000 gas for location updates

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Write comprehensive tests
4. Ensure all tests pass
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For technical support or questions about the blockchain implementation:

- Create an issue in the repository
- Contact the development team
- Check the documentation

---

**Built with 💚 for sustainable supply chains in India** 
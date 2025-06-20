import { ethers } from 'ethers';
import { MetaMaskSDK } from '@metamask/sdk';

// Contract addresses (these would be populated after deployment)
export const CONTRACT_ADDRESSES = {
  BATCH_CONTRACT: process.env.NEXT_PUBLIC_BATCH_CONTRACT_ADDRESS || '',
  NODE_CONTRACT: process.env.NEXT_PUBLIC_NODE_CONTRACT_ADDRESS || '',
  SUPPLY_CHAIN_CONTRACT: process.env.NEXT_PUBLIC_SUPPLY_CHAIN_CONTRACT_ADDRESS || '',
};

// Contract ABIs (these would be imported from the compiled contracts)
export const BATCH_CONTRACT_ABI = [
  "function createBatch(string memory _productType, uint256 _quantity, string memory _origin, string memory _metadataURI) external returns (uint256)",
  "function scanQRCode(string memory _qrCode) external returns (uint256)",
  "function getBatchInfo(uint256 _batchId) external view returns (uint256 id, string memory productType, uint256 quantity, address manufacturer, string memory origin, uint256 createdAt, uint8 status, string memory qrCode, string memory metadataURI)",
  "function updateBatchStatus(uint256 _batchId, uint8 _newStatus) external",
  "function validateBatchIntegrity(uint256 _batchId) external view returns (bool)",
  "function getBatchesByManufacturer(address _manufacturer) external view returns (uint256[] memory)",
  "event BatchCreated(uint256 indexed batchId, address indexed manufacturer, string productType, uint256 quantity, string qrCode, uint256 timestamp)",
  "event QRCodeScanned(uint256 indexed batchId, address indexed scanner, uint256 timestamp)"
];

export const NODE_CONTRACT_ABI = [
  "function createNode(string memory _name, string memory _location, uint8 _nodeType, address _operator, string memory _coordinates) external returns (uint256)",
  "function recordBatchEntry(uint256 _batchId, uint256 _nodeId, string memory _notes) external",
  "function recordBatchExit(uint256 _batchId, uint256 _nodeId) external",
  "function getTransitHistory(uint256 _batchId) external view returns (tuple(uint256 nodeId, uint256 batchId, uint256 timestamp, address scanner, string notes, bool isEntryPoint, bool isExitPoint, string verificationHash)[])",
  "function getCurrentLocation(uint256 _batchId) external view returns (uint256 nodeId, string memory nodeName, string memory location)",
  "event BatchEnteredNode(uint256 indexed batchId, uint256 indexed nodeId, address indexed scanner, uint256 timestamp, string notes)",
  "event BatchExitedNode(uint256 indexed batchId, uint256 indexed nodeId, address indexed scanner, uint256 timestamp)"
];

export const SUPPLY_CHAIN_CONTRACT_ABI = [
  "function createSupplyChainJourney(string memory _productType, uint256 _quantity, string memory _origin, string memory _metadataURI, string memory _finalDestination) external returns (uint256)",
  "function updateBatchLocation(uint256 _batchId, uint256 _nodeId, string memory _notes) external",
  "function markExitNode(uint256 _batchId, uint256 _nodeId) external",
  "function addBatchCertificate(uint256 _batchId, string memory _certificateType, string memory _certificateHash, uint256 _expiryDate) external",
  "function getSupplyChainHistory(uint256 _batchId) external view returns (uint256[] memory nodeSequence, uint256 startTime, uint256 endTime, bool isComplete, string memory finalDestination)",
  "function validateBatchIntegrity(uint256 _batchId) external view returns (bool isValid, string memory reason)",
  "function getBatchCertificates(uint256 _batchId) external view returns (tuple(string certificateType, string certificateHash, uint256 issuedDate, uint256 expiryDate, address issuer, bool isValid)[])",
  "event SupplyChainJourneyStarted(uint256 indexed batchId, address indexed manufacturer, uint256 timestamp)",
  "event SupplyChainJourneyCompleted(uint256 indexed batchId, uint256 duration, uint256 timestamp)"
];

// Ethereum provider and signer
let provider: ethers.providers.Web3Provider | null = null;
let signer: ethers.Signer | null = null;

// MetaMask SDK instance
const MMSDK = new MetaMaskSDK({
  dappMetadata: {
    name: "NeevTrace",
    url: window.location.host,
  },
});

// Initialize Web3 connection
export const initializeWeb3 = async (): Promise<boolean> => {
  try {
    if (typeof window !== 'undefined' && window.ethereum) {
      // Modern DApp browsers
      provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      signer = provider.getSigner();
      return true;
    } else {
      // Use MetaMask SDK for browsers without ethereum object
      const ethereum = MMSDK.getProvider();
      if (ethereum) {
        provider = new ethers.providers.Web3Provider(ethereum as any);
        await provider.send("eth_requestAccounts", []);
        signer = provider.getSigner();
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error('Error initializing Web3:', error);
    return false;
  }
};

// Get current account
export const getCurrentAccount = async (): Promise<string | null> => {
  try {
    if (!signer) await initializeWeb3();
    return signer ? await signer.getAddress() : null;
  } catch (error) {
    console.error('Error getting current account:', error);
    return null;
  }
};

// Get network information
export const getNetworkInfo = async () => {
  try {
    if (!provider) await initializeWeb3();
    const network = await provider?.getNetwork();
    return network;
  } catch (error) {
    console.error('Error getting network info:', error);
    return null;
  }
};

// Contract instances
export const getBatchContract = () => {
  if (!signer || !CONTRACT_ADDRESSES.BATCH_CONTRACT) return null;
  return new ethers.Contract(CONTRACT_ADDRESSES.BATCH_CONTRACT, BATCH_CONTRACT_ABI, signer);
};

export const getNodeContract = () => {
  if (!signer || !CONTRACT_ADDRESSES.NODE_CONTRACT) return null;
  return new ethers.Contract(CONTRACT_ADDRESSES.NODE_CONTRACT, NODE_CONTRACT_ABI, signer);
};

export const getSupplyChainContract = () => {
  if (!signer || !CONTRACT_ADDRESSES.SUPPLY_CHAIN_CONTRACT) return null;
  return new ethers.Contract(CONTRACT_ADDRESSES.SUPPLY_CHAIN_CONTRACT, SUPPLY_CHAIN_CONTRACT_ABI, signer);
};

// Batch operations
export const createBatch = async (
  productType: string,
  quantity: number,
  origin: string,
  metadataURI: string
) => {
  try {
    const contract = getBatchContract();
    if (!contract) throw new Error('Contract not initialized');
    
    const tx = await contract.createBatch(productType, quantity, origin, metadataURI);
    const receipt = await tx.wait();
    
    // Extract batch ID from event
    const event = receipt.events?.find((e: any) => e.event === 'BatchCreated');
    const batchId = event?.args?.batchId;
    
    return { success: true, batchId: batchId?.toString(), txHash: tx.hash };
  } catch (error) {
    console.error('Error creating batch:', error);
    return { success: false, error: error.message };
  }
};

export const scanQRCode = async (qrCode: string) => {
  try {
    const contract = getBatchContract();
    if (!contract) throw new Error('Contract not initialized');
    
    const batchId = await contract.scanQRCode(qrCode);
    return { success: true, batchId: batchId.toString() };
  } catch (error) {
    console.error('Error scanning QR code:', error);
    return { success: false, error: error.message };
  }
};

export const getBatchInfo = async (batchId: string) => {
  try {
    const contract = getBatchContract();
    if (!contract) throw new Error('Contract not initialized');
    
    const info = await contract.getBatchInfo(batchId);
    return {
      success: true,
      batch: {
        id: info.id.toString(),
        productType: info.productType,
        quantity: info.quantity.toString(),
        manufacturer: info.manufacturer,
        origin: info.origin,
        createdAt: new Date(info.createdAt.toNumber() * 1000),
        status: info.status,
        qrCode: info.qrCode,
        metadataURI: info.metadataURI
      }
    };
  } catch (error) {
    console.error('Error getting batch info:', error);
    return { success: false, error: error.message };
  }
};

// Supply chain operations
export const createSupplyChainJourney = async (
  productType: string,
  quantity: number,
  origin: string,
  metadataURI: string,
  finalDestination: string
) => {
  try {
    const contract = getSupplyChainContract();
    if (!contract) throw new Error('Contract not initialized');
    
    const tx = await contract.createSupplyChainJourney(
      productType, quantity, origin, metadataURI, finalDestination
    );
    const receipt = await tx.wait();
    
    const event = receipt.events?.find((e: any) => e.event === 'SupplyChainJourneyStarted');
    const batchId = event?.args?.batchId;
    
    return { success: true, batchId: batchId?.toString(), txHash: tx.hash };
  } catch (error) {
    console.error('Error creating supply chain journey:', error);
    return { success: false, error: error.message };
  }
};

export const updateBatchLocation = async (
  batchId: string,
  nodeId: string,
  notes: string
) => {
  try {
    const contract = getSupplyChainContract();
    if (!contract) throw new Error('Contract not initialized');
    
    const tx = await contract.updateBatchLocation(batchId, nodeId, notes);
    await tx.wait();
    
    return { success: true, txHash: tx.hash };
  } catch (error) {
    console.error('Error updating batch location:', error);
    return { success: false, error: error.message };
  }
};

export const getSupplyChainHistory = async (batchId: string) => {
  try {
    const contract = getSupplyChainContract();
    if (!contract) throw new Error('Contract not initialized');
    
    const history = await contract.getSupplyChainHistory(batchId);
    return {
      success: true,
      history: {
        nodeSequence: history.nodeSequence.map((n: any) => n.toString()),
        startTime: new Date(history.startTime.toNumber() * 1000),
        endTime: history.endTime.toNumber() > 0 ? new Date(history.endTime.toNumber() * 1000) : null,
        isComplete: history.isComplete,
        finalDestination: history.finalDestination
      }
    };
  } catch (error) {
    console.error('Error getting supply chain history:', error);
    return { success: false, error: error.message };
  }
};

// Node operations
export const getCurrentLocation = async (batchId: string) => {
  try {
    const contract = getNodeContract();
    if (!contract) throw new Error('Contract not initialized');
    
    const location = await contract.getCurrentLocation(batchId);
    return {
      success: true,
      location: {
        nodeId: location.nodeId.toString(),
        nodeName: location.nodeName,
        location: location.location
      }
    };
  } catch (error) {
    console.error('Error getting current location:', error);
    return { success: false, error: error.message };
  }
};

export const getTransitHistory = async (batchId: string) => {
  try {
    const contract = getNodeContract();
    if (!contract) throw new Error('Contract not initialized');
    
    const history = await contract.getTransitHistory(batchId);
    return {
      success: true,
      history: history.map((record: any) => ({
        nodeId: record.nodeId.toString(),
        batchId: record.batchId.toString(),
        timestamp: new Date(record.timestamp.toNumber() * 1000),
        scanner: record.scanner,
        notes: record.notes,
        isEntryPoint: record.isEntryPoint,
        isExitPoint: record.isExitPoint,
        verificationHash: record.verificationHash
      }))
    };
  } catch (error) {
    console.error('Error getting transit history:', error);
    return { success: false, error: error.message };
  }
};

// Utility functions
export const formatAddress = (address: string): string => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const formatEther = (wei: string): string => {
  return ethers.utils.formatEther(wei);
};

export const parseEther = (ether: string): string => {
  return ethers.utils.parseEther(ether).toString();
}; 
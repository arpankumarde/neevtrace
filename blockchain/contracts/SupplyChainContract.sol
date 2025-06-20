// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./BatchContract.sol";
import "./NodeTrackingContract.sol";

/**
 * @title SupplyChainContract
 * @dev Main contract that orchestrates the entire supply chain tracking system
 */
contract SupplyChainContract is AccessControl {
    
    // Contract references
    BatchContract public batchContract;
    NodeTrackingContract public nodeContract;

    // Roles
    bytes32 public constant MANUFACTURER_ROLE = keccak256("MANUFACTURER_ROLE");
    bytes32 public constant SUPPLIER_ROLE = keccak256("SUPPLIER_ROLE");
    bytes32 public constant LOGISTICS_ROLE = keccak256("LOGISTICS_ROLE");
    bytes32 public constant AUDITOR_ROLE = keccak256("AUDITOR_ROLE");

    // Supply chain journey structure
    struct SupplyChainJourney {
        uint256 batchId;
        uint256[] nodeSequence;
        uint256 startTime;
        uint256 endTime;
        bool isComplete;
        string finalDestination;
        mapping(uint256 => bool) requiredNodes;
    }

    // Certificate structure for compliance
    struct Certificate {
        string certificateType; // ISO, GST, BIS, MSME, etc.
        string certificateHash; // IPFS hash
        uint256 issuedDate;
        uint256 expiryDate;
        address issuer;
        bool isValid;
    }

    // Mappings
    mapping(uint256 => SupplyChainJourney) public supplyChainJourneys;
    mapping(uint256 => Certificate[]) public batchCertificates;
    mapping(address => Certificate[]) public entityCertificates;
    mapping(uint256 => string[]) public batchDocuments; // IPFS hashes
    mapping(uint256 => bool) public completedJourneys;

    // Events
    event SupplyChainJourneyStarted(
        uint256 indexed batchId,
        address indexed manufacturer,
        uint256 timestamp
    );

    event SupplyChainJourneyCompleted(
        uint256 indexed batchId,
        uint256 duration,
        uint256 timestamp
    );

    event CertificateAdded(
        uint256 indexed batchId,
        string certificateType,
        string certificateHash,
        uint256 timestamp
    );

    event DocumentAdded(
        uint256 indexed batchId,
        string documentHash,
        uint256 timestamp
    );

    event ComplianceAlertTriggered(
        uint256 indexed batchId,
        string alertType,
        string message,
        uint256 timestamp
    );

    constructor(address _batchContract, address _nodeContract) {
        batchContract = BatchContract(_batchContract);
        nodeContract = NodeTrackingContract(_nodeContract);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    /**
     * @dev Creates a complete supply chain journey for a batch
     */
    function createSupplyChainJourney(
        string memory _productType,
        uint256 _quantity,
        string memory _origin,
        string memory _metadataURI,
        string memory _finalDestination,
        uint256[] memory _requiredNodeIds
    ) external returns (uint256) {
        require(
            hasRole(MANUFACTURER_ROLE, msg.sender),
            "SupplyChain: Only manufacturers can create journeys"
        );

        // Create batch first
        uint256 batchId = batchContract.createBatch(
            _productType,
            _quantity,
            _origin,
            _metadataURI
        );

        // Initialize supply chain journey
        SupplyChainJourney storage journey = supplyChainJourneys[batchId];
        journey.batchId = batchId;
        journey.startTime = block.timestamp;
        journey.isComplete = false;
        journey.finalDestination = _finalDestination;

        // Set required nodes
        for (uint256 i = 0; i < _requiredNodeIds.length; i++) {
            journey.requiredNodes[_requiredNodeIds[i]] = true;
        }

        emit SupplyChainJourneyStarted(batchId, msg.sender, block.timestamp);

        return batchId;
    }

    /**
     * @dev Updates batch location and validates supply chain rules
     */
    function updateBatchLocation(
        uint256 _batchId,
        uint256 _nodeId,
        string memory _notes
    ) external {
        require(
            hasRole(LOGISTICS_ROLE, msg.sender) ||
            hasRole(MANUFACTURER_ROLE, msg.sender),
            "SupplyChain: Unauthorized"
        );

        // Record in node tracking
        nodeContract.recordBatchEntry(_batchId, _nodeId, _notes);

        // Update journey sequence
        SupplyChainJourney storage journey = supplyChainJourneys[_batchId];
        journey.nodeSequence.push(_nodeId);

        // Check if this completes the journey
        _checkJourneyCompletion(_batchId);
    }

    /**
     * @dev Marks exit from a node
     */
    function markExitNode(uint256 _batchId, uint256 _nodeId) 
        external 
    {
        require(
            hasRole(LOGISTICS_ROLE, msg.sender) ||
            hasRole(MANUFACTURER_ROLE, msg.sender),
            "SupplyChain: Unauthorized"
        );

        nodeContract.recordBatchExit(_batchId, _nodeId);

        // Check if journey is complete
        _checkJourneyCompletion(_batchId);
    }

    /**
     * @dev Adds a certificate to a batch
     */
    function addBatchCertificate(
        uint256 _batchId,
        string memory _certificateType,
        string memory _certificateHash,
        uint256 _expiryDate
    ) external {
        require(
            hasRole(MANUFACTURER_ROLE, msg.sender) ||
            hasRole(SUPPLIER_ROLE, msg.sender),
            "SupplyChain: Unauthorized"
        );

        Certificate memory cert = Certificate({
            certificateType: _certificateType,
            certificateHash: _certificateHash,
            issuedDate: block.timestamp,
            expiryDate: _expiryDate,
            issuer: msg.sender,
            isValid: true
        });

        batchCertificates[_batchId].push(cert);

        emit CertificateAdded(_batchId, _certificateType, _certificateHash, block.timestamp);
    }

    /**
     * @dev Adds a document to a batch (IPFS hash)
     */
    function addBatchDocument(
        uint256 _batchId,
        string memory _documentHash
    ) external {
        require(
            hasRole(MANUFACTURER_ROLE, msg.sender) ||
            hasRole(SUPPLIER_ROLE, msg.sender) ||
            hasRole(LOGISTICS_ROLE, msg.sender),
            "SupplyChain: Unauthorized"
        );

        batchDocuments[_batchId].push(_documentHash);

        emit DocumentAdded(_batchId, _documentHash, block.timestamp);
    }

    /**
     * @dev Gets complete supply chain history for a batch
     */
    function getSupplyChainHistory(uint256 _batchId)
        external
        view
        returns (
            uint256[] memory nodeSequence,
            uint256 startTime,
            uint256 endTime,
            bool isComplete,
            string memory finalDestination
        )
    {
        SupplyChainJourney storage journey = supplyChainJourneys[_batchId];
        return (
            journey.nodeSequence,
            journey.startTime,
            journey.endTime,
            journey.isComplete,
            journey.finalDestination
        );
    }

    /**
     * @dev Gets all certificates for a batch
     */
    function getBatchCertificates(uint256 _batchId)
        external
        view
        returns (Certificate[] memory)
    {
        return batchCertificates[_batchId];
    }

    /**
     * @dev Gets all documents for a batch
     */
    function getBatchDocuments(uint256 _batchId)
        external
        view
        returns (string[] memory)
    {
        return batchDocuments[_batchId];
    }

    /**
     * @dev Validates complete batch integrity across all contracts
     */
    function validateBatchIntegrity(uint256 _batchId)
        external
        view
        returns (bool isValid, string memory reason)
    {
        // Check batch exists and is valid
        if (!batchContract.validateBatchIntegrity(_batchId)) {
            return (false, "Batch integrity failed");
        }

        // Check transit sequence validity
        // Note: Simplified version - in production, you'd call nodeContract validation
        SupplyChainJourney storage journey = supplyChainJourneys[_batchId];
        if (journey.nodeSequence.length == 0) {
            return (false, "No transit records");
        }

        // Check certificate validity
        Certificate[] memory certs = batchCertificates[_batchId];
        for (uint256 i = 0; i < certs.length; i++) {
            if (certs[i].expiryDate < block.timestamp) {
                return (false, "Expired certificate found");
            }
        }

        return (true, "Batch integrity valid");
    }

    /**
     * @dev Triggers compliance alerts for expired certificates
     */
    function checkComplianceAlerts(uint256 _batchId) external {
        Certificate[] memory certs = batchCertificates[_batchId];
        
        for (uint256 i = 0; i < certs.length; i++) {
            // Check if certificate expires within 30 days
            if (certs[i].expiryDate <= block.timestamp + 30 days && 
                certs[i].expiryDate > block.timestamp) {
                
                emit ComplianceAlertTriggered(
                    _batchId,
                    "CERTIFICATE_EXPIRING",
                    string(abi.encodePacked("Certificate ", certs[i].certificateType, " expires soon")),
                    block.timestamp
                );
            }
            
            // Check if certificate is already expired
            if (certs[i].expiryDate <= block.timestamp) {
                emit ComplianceAlertTriggered(
                    _batchId,
                    "CERTIFICATE_EXPIRED",
                    string(abi.encodePacked("Certificate ", certs[i].certificateType, " has expired")),
                    block.timestamp
                );
            }
        }
    }

    /**
     * @dev Gets real-time tracking information
     */
    function getRealTimeTracking(uint256 _batchId)
        external
        view
        returns (
            uint256 currentNodeId,
            string memory currentLocation,
            uint256 lastUpdateTime,
            string memory status
        )
    {
        (currentNodeId, , currentLocation) = nodeContract.getCurrentLocation(_batchId);
        
        // Get batch status
        (, , , , , , BatchContract.BatchStatus batchStatus, ,) = batchContract.getBatchInfo(_batchId);
        
        string memory statusString;
        if (batchStatus == BatchContract.BatchStatus.Created) statusString = "Created";
        else if (batchStatus == BatchContract.BatchStatus.InTransit) statusString = "In Transit";
        else if (batchStatus == BatchContract.BatchStatus.Delivered) statusString = "Delivered";
        else if (batchStatus == BatchContract.BatchStatus.Completed) statusString = "Completed";

        return (currentNodeId, currentLocation, block.timestamp, statusString);
    }

    /**
     * @dev Internal function to check if journey is complete
     */
    function _checkJourneyCompletion(uint256 _batchId) private {
        SupplyChainJourney storage journey = supplyChainJourneys[_batchId];
        
        // Simple completion logic - can be enhanced
        if (journey.nodeSequence.length > 0 && !journey.isComplete) {
            // Check if we've reached final destination or exit point
            uint256 lastNodeId = journey.nodeSequence[journey.nodeSequence.length - 1];
            
            // This would need to check node type from NodeTrackingContract
            // For now, we'll mark complete after 3+ nodes
            if (journey.nodeSequence.length >= 3) {
                journey.isComplete = true;
                journey.endTime = block.timestamp;
                completedJourneys[_batchId] = true;

                uint256 duration = journey.endTime - journey.startTime;
                emit SupplyChainJourneyCompleted(_batchId, duration, block.timestamp);
            }
        }
    }

    // Admin functions

    function grantManufacturerRole(address account) 
        public 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        _grantRole(MANUFACTURER_ROLE, account);
        batchContract.grantManufacturerRole(account);
    }

    function grantSupplierRole(address account) 
        public 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        _grantRole(SUPPLIER_ROLE, account);
        batchContract.grantSupplierRole(account);
    }

    function grantLogisticsRole(address account) 
        public 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        _grantRole(LOGISTICS_ROLE, account);
        batchContract.grantLogisticsRole(account);
    }
} 
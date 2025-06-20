// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title BatchContract
 * @dev Manages batch creation, metadata, and QR code generation for supply chain tracking
 */
contract BatchContract is AccessControl {
    // Roles
    bytes32 public constant MANUFACTURER_ROLE = keccak256("MANUFACTURER_ROLE");
    bytes32 public constant SUPPLIER_ROLE = keccak256("SUPPLIER_ROLE");
    bytes32 public constant LOGISTICS_ROLE = keccak256("LOGISTICS_ROLE");

    // Batch counter
    uint256 private _batchIds;

    // Batch status enum
    enum BatchStatus {
        Created,
        InTransit,
        Delivered,
        Completed
    }

    // Batch structure
    struct Batch {
        uint256 id;
        string productType;
        uint256 quantity;
        address manufacturer;
        string origin;
        uint256 createdAt;
        BatchStatus status;
        string qrCode;
        string metadataURI; // IPFS hash for additional metadata
        bool exists;
    }

    // Mappings
    mapping(uint256 => Batch) public batches;
    mapping(string => uint256) public qrCodeToBatchId;
    mapping(address => uint256[]) public manufacturerBatches;

    // Events
    event BatchCreated(
        uint256 indexed batchId,
        address indexed manufacturer,
        string productType,
        uint256 quantity,
        string qrCode,
        uint256 timestamp
    );

    event BatchStatusUpdated(
        uint256 indexed batchId,
        BatchStatus newStatus,
        uint256 timestamp
    );

    event QRCodeScanned(
        uint256 indexed batchId,
        address indexed scanner,
        uint256 timestamp
    );

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    /**
     * @dev Creates a new batch with unique QR code
     * @param _productType Type of product
     * @param _quantity Quantity of items in batch
     * @param _origin Origin location
     * @param _metadataURI IPFS hash for additional metadata
     */
    function createBatch(
        string memory _productType,
        uint256 _quantity,
        string memory _origin,
        string memory _metadataURI
    ) external returns (uint256) {
        require(
            hasRole(MANUFACTURER_ROLE, msg.sender),
            "BatchContract: Caller is not a manufacturer"
        );
        require(_quantity > 0, "BatchContract: Quantity must be greater than 0");
        require(bytes(_productType).length > 0, "BatchContract: Product type required");

        _batchIds++;
        uint256 newBatchId = _batchIds;

        // Generate unique QR code
        string memory qrCode = _generateQRCode(newBatchId, msg.sender);

        // Create new batch
        batches[newBatchId] = Batch({
            id: newBatchId,
            productType: _productType,
            quantity: _quantity,
            manufacturer: msg.sender,
            origin: _origin,
            createdAt: block.timestamp,
            status: BatchStatus.Created,
            qrCode: qrCode,
            metadataURI: _metadataURI,
            exists: true
        });

        // Update mappings
        qrCodeToBatchId[qrCode] = newBatchId;
        manufacturerBatches[msg.sender].push(newBatchId);

        emit BatchCreated(
            newBatchId,
            msg.sender,
            _productType,
            _quantity,
            qrCode,
            block.timestamp
        );

        return newBatchId;
    }

    /**
     * @dev Scans QR code and returns batch information
     * @param _qrCode QR code to scan
     */
    function scanQRCode(string memory _qrCode) 
        external 
        returns (uint256) 
    {
        uint256 batchId = qrCodeToBatchId[_qrCode];
        require(batchId != 0, "BatchContract: Invalid QR code");

        emit QRCodeScanned(batchId, msg.sender, block.timestamp);
        return batchId;
    }

    /**
     * @dev Updates batch status
     * @param _batchId Batch ID to update
     * @param _newStatus New status
     */
    function updateBatchStatus(uint256 _batchId, BatchStatus _newStatus)
        external
    {
        require(
            hasRole(MANUFACTURER_ROLE, msg.sender) ||
            hasRole(SUPPLIER_ROLE, msg.sender) ||
            hasRole(LOGISTICS_ROLE, msg.sender),
            "BatchContract: Unauthorized"
        );
        require(batches[_batchId].exists, "BatchContract: Batch does not exist");

        batches[_batchId].status = _newStatus;

        emit BatchStatusUpdated(_batchId, _newStatus, block.timestamp);
    }

    /**
     * @dev Gets batch information by ID
     * @param _batchId Batch ID
     */
    function getBatchInfo(uint256 _batchId)
        external
        view
        returns (
            uint256 id,
            string memory productType,
            uint256 quantity,
            address manufacturer,
            string memory origin,
            uint256 createdAt,
            BatchStatus status,
            string memory qrCode,
            string memory metadataURI
        )
    {
        require(batches[_batchId].exists, "BatchContract: Batch does not exist");
        
        Batch memory batch = batches[_batchId];
        return (
            batch.id,
            batch.productType,
            batch.quantity,
            batch.manufacturer,
            batch.origin,
            batch.createdAt,
            batch.status,
            batch.qrCode,
            batch.metadataURI
        );
    }

    /**
     * @dev Gets batches by manufacturer
     * @param _manufacturer Manufacturer address
     */
    function getBatchesByManufacturer(address _manufacturer)
        external
        view
        returns (uint256[] memory)
    {
        return manufacturerBatches[_manufacturer];
    }

    /**
     * @dev Gets current batch count
     */
    function getCurrentBatchId() external view returns (uint256) {
        return _batchIds;
    }

    /**
     * @dev Validates batch integrity
     * @param _batchId Batch ID to validate
     */
    function validateBatchIntegrity(uint256 _batchId)
        external
        view
        returns (bool)
    {
        return batches[_batchId].exists && 
               batches[_batchId].quantity > 0 &&
               batches[_batchId].manufacturer != address(0);
    }

    /**
     * @dev Generates unique QR code for batch
     * @param _batchId Batch ID
     * @param _manufacturer Manufacturer address
     */
    function _generateQRCode(uint256 _batchId, address _manufacturer)
        private
        view
        returns (string memory)
    {
        return string(
            abi.encodePacked(
                "NEEV-",
                _toString(_batchId),
                "-",
                _toString(uint256(uint160(_manufacturer))),
                "-",
                _toString(block.timestamp)
            )
        );
    }

    /**
     * @dev Converts uint256 to string
     * @param value Value to convert
     */
    function _toString(uint256 value) private pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }

    // Admin functions

    function grantManufacturerRole(address account) 
        public 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        _grantRole(MANUFACTURER_ROLE, account);
    }

    function grantSupplierRole(address account) 
        public 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        _grantRole(SUPPLIER_ROLE, account);
    }

    function grantLogisticsRole(address account) 
        public 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        _grantRole(LOGISTICS_ROLE, account);
    }
} 
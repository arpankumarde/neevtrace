// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title NodeTrackingContract
 * @dev Manages transit nodes and tracking points in the supply chain
 */
contract NodeTrackingContract is AccessControl {

    // Roles
    bytes32 public constant MANUFACTURER_ROLE = keccak256("MANUFACTURER_ROLE");
    bytes32 public constant SUPPLIER_ROLE = keccak256("SUPPLIER_ROLE");
    bytes32 public constant LOGISTICS_ROLE = keccak256("LOGISTICS_ROLE");
    bytes32 public constant NODE_OPERATOR_ROLE = keccak256("NODE_OPERATOR_ROLE");

    // Node counter
    uint256 private _nodeIds;

    // Node types
    enum NodeType {
        Origin,         // Starting point (manufacturer)
        Warehouse,      // Storage facility
        TransitHub,     // Logistics hub
        Supplier,       // Supplier facility
        Destination,    // Final destination
        ExitPoint       // Exit from supply chain
    }

    // Node status
    enum NodeStatus {
        Active,
        Inactive,
        Maintenance,
        Blocked
    }

    // Node structure
    struct Node {
        uint256 id;
        string name;
        string location;
        NodeType nodeType;
        NodeStatus status;
        address operator;
        uint256 createdAt;
        string coordinates; // GPS coordinates
        bool exists;
    }

    // Transit record structure
    struct TransitRecord {
        uint256 nodeId;
        uint256 batchId;
        uint256 timestamp;
        address scanner;
        string notes;
        bool isEntryPoint;
        bool isExitPoint;
        string verificationHash; // Hash for data verification
    }

    // Mappings
    mapping(uint256 => Node) public nodes;
    mapping(uint256 => TransitRecord[]) public batchTransitHistory;
    mapping(uint256 => mapping(uint256 => bool)) public batchAtNode; // batchId => nodeId => isPresent
    mapping(address => uint256[]) public operatorNodes;
    mapping(uint256 => uint256) public currentNodeLocation; // batchId => current nodeId

    // Events
    event NodeCreated(
        uint256 indexed nodeId,
        string name,
        string location,
        NodeType nodeType,
        address indexed operator,
        uint256 timestamp
    );

    event BatchEnteredNode(
        uint256 indexed batchId,
        uint256 indexed nodeId,
        address indexed scanner,
        uint256 timestamp,
        string notes
    );

    event BatchExitedNode(
        uint256 indexed batchId,
        uint256 indexed nodeId,
        address indexed scanner,
        uint256 timestamp
    );

    event NodeStatusUpdated(
        uint256 indexed nodeId,
        NodeStatus newStatus,
        uint256 timestamp
    );

    event TransitVerified(
        uint256 indexed batchId,
        uint256 indexed nodeId,
        string verificationHash,
        uint256 timestamp
    );

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    /**
     * @dev Creates a new node in the supply chain network
     */
    function createNode(
        string memory _name,
        string memory _location,
        NodeType _nodeType,
        address _operator,
        string memory _coordinates
    ) external onlyRole(DEFAULT_ADMIN_ROLE) returns (uint256) {
        require(bytes(_name).length > 0, "NodeTracking: Node name required");
        require(_operator != address(0), "NodeTracking: Invalid operator address");

        _nodeIds++;
        uint256 newNodeId = _nodeIds;

        nodes[newNodeId] = Node({
            id: newNodeId,
            name: _name,
            location: _location,
            nodeType: _nodeType,
            status: NodeStatus.Active,
            operator: _operator,
            createdAt: block.timestamp,
            coordinates: _coordinates,
            exists: true
        });

        operatorNodes[_operator].push(newNodeId);
        _grantRole(NODE_OPERATOR_ROLE, _operator);

        emit NodeCreated(
            newNodeId,
            _name,
            _location,
            _nodeType,
            _operator,
            block.timestamp
        );

        return newNodeId;
    }

    /**
     * @dev Records batch entry into a node
     */
    function recordBatchEntry(
        uint256 _batchId,
        uint256 _nodeId,
        string memory _notes
    ) external {
        require(nodes[_nodeId].exists, "NodeTracking: Node does not exist");
        require(
            hasRole(NODE_OPERATOR_ROLE, msg.sender) ||
            hasRole(LOGISTICS_ROLE, msg.sender) ||
            hasRole(MANUFACTURER_ROLE, msg.sender),
            "NodeTracking: Unauthorized scanner"
        );

        TransitRecord memory transit = TransitRecord({
            nodeId: _nodeId,
            batchId: _batchId,
            timestamp: block.timestamp,
            scanner: msg.sender,
            notes: _notes,
            isEntryPoint: true,
            isExitPoint: false,
            verificationHash: _generateVerificationHash(_batchId, _nodeId, block.timestamp)
        });

        batchTransitHistory[_batchId].push(transit);
        batchAtNode[_batchId][_nodeId] = true;
        currentNodeLocation[_batchId] = _nodeId;

        emit BatchEnteredNode(_batchId, _nodeId, msg.sender, block.timestamp, _notes);
        emit TransitVerified(_batchId, _nodeId, transit.verificationHash, block.timestamp);
    }

    /**
     * @dev Records batch exit from a node
     */
    function recordBatchExit(
        uint256 _batchId,
        uint256 _nodeId
    ) external {
        require(nodes[_nodeId].exists, "NodeTracking: Node does not exist");
        require(
            batchAtNode[_batchId][_nodeId],
            "NodeTracking: Batch not currently at this node"
        );

        TransitRecord memory transit = TransitRecord({
            nodeId: _nodeId,
            batchId: _batchId,
            timestamp: block.timestamp,
            scanner: msg.sender,
            notes: "Batch departed",
            isEntryPoint: false,
            isExitPoint: true,
            verificationHash: _generateVerificationHash(_batchId, _nodeId, block.timestamp)
        });

        batchTransitHistory[_batchId].push(transit);
        batchAtNode[_batchId][_nodeId] = false;
        
        if (nodes[_nodeId].nodeType == NodeType.ExitPoint) {
            currentNodeLocation[_batchId] = 0;
        }

        emit BatchExitedNode(_batchId, _nodeId, msg.sender, block.timestamp);
    }

    /**
     * @dev Gets complete transit history for a batch
     */
    function getTransitHistory(uint256 _batchId)
        external
        view
        returns (TransitRecord[] memory)
    {
        return batchTransitHistory[_batchId];
    }

    /**
     * @dev Gets current location of a batch
     */
    function getCurrentLocation(uint256 _batchId)
        external
        view
        returns (uint256 nodeId, string memory nodeName, string memory location)
    {
        uint256 currentNodeId = currentNodeLocation[_batchId];
        if (currentNodeId == 0) {
            return (0, "Unknown", "Unknown");
        }
        
        Node memory currentNode = nodes[currentNodeId];
        return (currentNodeId, currentNode.name, currentNode.location);
    }

    function _generateVerificationHash(
        uint256 _batchId,
        uint256 _nodeId,
        uint256 _timestamp
    ) private view returns (string memory) {
        bytes32 hash = keccak256(
            abi.encodePacked(
                _batchId,
                _nodeId,
                _timestamp,
                msg.sender,
                block.difficulty
            )
        );
        return _toHexString(hash);
    }

    function _toHexString(bytes32 _hash) private pure returns (string memory) {
        bytes memory alphabet = "0123456789abcdef";
        bytes memory str = new bytes(64);
        for (uint256 i = 0; i < 32; i++) {
            str[i*2] = alphabet[uint8(_hash[i] >> 4)];
            str[1+i*2] = alphabet[uint8(_hash[i] & 0x0f)];
        }
        return string(str);
    }

    // Admin functions
} 
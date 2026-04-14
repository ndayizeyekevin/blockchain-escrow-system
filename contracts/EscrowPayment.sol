// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title EscrowPayment
 * @dev Implements a freelance escrow payment system where clients deposit funds,
 * freelancers submit work, and payments are released upon client approval.
 */
contract EscrowPayment {
    // ==================== State Variables ====================
    
    address public client;
    address public freelancer;
    uint256 public escrowAmount;
    bool public workSubmitted;
    bool public workApproved;
    bool public paymentReleased;
    string public workDescription;
    
    // ==================== Events ====================
    
    event EscrowCreated(
        address indexed clientAddress,
        address indexed freelancerAddress,
        uint256 amount,
        string description
    );
    
    event FreelancerUpdated(
        address indexed oldFreelancerAddress,
        address indexed newFreelancerAddress
    );
    
    event WorkSubmitted(
        address indexed freelancerAddress,
        string description
    );
    
    event WorkApproved(
        address indexed clientAddress,
        address indexed freelancerAddress
    );
    
    event PaymentReleased(
        address indexed freelancerAddress,
        uint256 amount
    );
    
    event EscrowCancelled(
        address indexed clientAddress,
        uint256 amount
    );
    
    // ==================== Modifiers ====================
    
    /**
     * @dev Restricts function execution to the client only
     */
    modifier onlyClient() {
        require(msg.sender == client, "Only client can call this function");
        _;
    }
    
    /**
     * @dev Restricts function execution to the freelancer only
     */
    modifier onlyFreelancer() {
        require(msg.sender == freelancer, "Only freelancer can call this function");
        _;
    }
    
    /**
     * @dev Ensures work has been submitted before approval
     */
    modifier workSubmittedCheck() {
        require(workSubmitted, "Work has not been submitted yet");
        _;
    }
    
    /**
     * @dev Ensures payment has not already been released
     */
    modifier notReleased() {
        require(!paymentReleased, "Payment has already been released");
        _;
    }
    
    // ==================== Constructor ====================
    
    /**
     * @dev Initialize the escrow contract when deployed
     * The deployer becomes the client automatically
     */
    constructor() {
        client = msg.sender;
    }
    
    // ==================== Core Functions ====================
    
    /**
     * @dev Allows a client to create an escrow and deposit ETH
     * @param freelancerAddress The address of the freelancer
     * @param description A description of the work to be done
     */
    function createEscrow(
        address payable freelancerAddress,
        string memory description
    ) external payable {
        // Ensure this is called by the contract creator (client)
        require(msg.sender == client, "Only the contract creator can create escrow");
        
        // Ensure at least some ETH is deposited
        require(msg.value > 0, "Escrow amount must be greater than 0");
        
        // Ensure freelancer address is valid and different from client
        require(freelancerAddress != address(0), "Invalid freelancer address");
        require(freelancerAddress != client, "Freelancer cannot be the client");
        
        // Set the freelancer address
        freelancer = freelancerAddress;
        
        // Update escrow details
        escrowAmount = msg.value;
        workDescription = description;
        workSubmitted = false;
        workApproved = false;
        paymentReleased = false;
        
        emit EscrowCreated(client, freelancer, msg.value, description);
    }
    
    /**
     * @dev Allows the client to update the freelancer address before work submission
     * @param newFreelancerAddress The new freelancer address
     */
    function updateFreelancer(address payable newFreelancerAddress) 
        external 
        onlyClient 
        notReleased 
    {
        require(!workSubmitted, "Cannot change freelancer after work submission");
        require(newFreelancerAddress != address(0), "Invalid freelancer address");
        require(newFreelancerAddress != client, "Freelancer cannot be the client");
        require(escrowAmount > 0, "No active escrow");
        
        address oldFreelancer = freelancer;
        freelancer = newFreelancerAddress;
        
        emit FreelancerUpdated(oldFreelancer, newFreelancerAddress);
    }
    
    /**
     * @dev Allows the freelancer to submit work
     * @param submissionDetails Details about the submitted work
     */
    function submitWork(string memory submissionDetails) 
        external 
        onlyFreelancer 
        notReleased 
    {
        require(!workSubmitted, "Work has already been submitted");
        require(escrowAmount > 0, "No active escrow");
        
        workSubmitted = true;
        workDescription = submissionDetails;
        
        emit WorkSubmitted(freelancer, submissionDetails);
    }
    
    /**
     * @dev Allows the client to approve the submitted work
     * This triggers the automatic payment release
     */
    function approveWork() 
        external 
        onlyClient 
        workSubmittedCheck 
        notReleased 
    {
        require(!workApproved, "Work has already been approved");
        
        workApproved = true;
        
        emit WorkApproved(client, freelancer);
        
        // Automatically release payment after approval
        releasePayment();
    }
    
    /**
     * @dev Releases the escrow payment to the freelancer
     * This is called automatically by approveWork()
     */
    function releasePayment() internal notReleased {
        require(workApproved, "Work must be approved before releasing payment");
        require(freelancer != address(0), "Freelancer address not set");
        require(escrowAmount > 0, "No funds to release");
        
        // Mark payment as released before transfer (prevents reentrancy)
        paymentReleased = true;
        uint256 amountToSend = escrowAmount;
        
        // Transfer funds to freelancer
        (bool success, ) = payable(freelancer).call{value: amountToSend}("");
        require(success, "Payment transfer failed");
        
        emit PaymentReleased(freelancer, amountToSend);
    }
    
    /**
     * @dev Allows the client to cancel the escrow and refund if work hasn't been submitted
     */
    function cancelEscrow() 
        external 
        onlyClient 
        notReleased 
    {
        require(!workSubmitted, "Cannot cancel after work submission");
        require(escrowAmount > 0, "No funds to refund");
        
        uint256 refundAmount = escrowAmount;
        escrowAmount = 0;
        
        // Send refund back to client
        (bool success, ) = payable(client).call{value: refundAmount}("");
        require(success, "Refund transfer failed");
        
        emit EscrowCancelled(client, refundAmount);
    }
    
    // ==================== View Functions ====================
    
    /**
     * @dev Returns the current status of the escrow
     */
    function getEscrowStatus() external view returns (
        address _client,
        address _freelancer,
        uint256 _escrowAmount,
        bool _workSubmitted,
        bool _workApproved,
        bool _paymentReleased,
        string memory _description
    ) {
        return (
            client,
            freelancer,
            escrowAmount,
            workSubmitted,
            workApproved,
            paymentReleased,
            workDescription
        );
    }
    
    /**
     * @dev Returns the contract balance
     */
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
    
    // ==================== Fallback Functions ====================
    
    /**
     * @dev Fallback function to receive Ether
     */
    receive() external payable {}
    
    fallback() external payable {}
}

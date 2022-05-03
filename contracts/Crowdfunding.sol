// SPDX-License-Identifier: MIT
pragma solidity^0.8.7;

contract Factory {

    address[] public deployedCrowdfundings;

    function createCampaign(uint minimum) public {
        address newCrowdfunding = address(new Crowdfunding(minimum, msg.sender));
        deployedCrowdfundings.push(newCrowdfunding);
    }
    function getDeployedCrowdfundings() public view returns(address[] memory) {
        return deployedCrowdfundings;
    }
}

contract Crowdfunding {

    struct Request {
        string description;
        uint value;
        address payable recipient;
        bool complete;
        // list of addresses that already voted
        mapping (address => bool) approvers;
        // must be greater than 50% of the number of contributors
        uint approvalsCount;
    }
    address public manager;
    uint public minContribution;
    // list of addresses who donated to our contract
    mapping(address => bool) public contributors;
    mapping(uint => Request) public requests;
    uint requestId;
    uint public contributorsCount;

    constructor (uint initialValue, address owner) {
        manager = owner;
        minContribution = initialValue;
    }

    modifier onlyForManager() {
        require(msg.sender == manager);
        _;
    }

    modifier onlyForContributor() {
        require(contributors[msg.sender] == true);
        _;
    }

    function contribute() public payable {
        require(msg.value >= minContribution);
        contributors[msg.sender] = true;
        contributorsCount++;
    }

    function createRequest( string memory description, uint value, address payable recipient ) public onlyForManager {
        Request storage newRequest = requests[requestId];
        newRequest.description = description;
        newRequest.value = value;
        newRequest.recipient = recipient;
        newRequest.complete = false;
        requestId++;
    }


    function approveRequest(uint idOfRequest) public onlyForContributor {
        Request storage targetRequest = requests[idOfRequest];
        // 1 contributor can vote only 1 time
        require(!targetRequest.approvers[msg.sender]);

        targetRequest.approvers[msg.sender] = true;
        targetRequest.approvalsCount++;
    }

    function confirmRequest(uint idOfRequest) public onlyForManager {
        Request storage targetRequest = requests[idOfRequest];
        require(!targetRequest.complete);
        require(targetRequest.approvalsCount > (contributorsCount/2));

        targetRequest.recipient.transfer(targetRequest.value);
        targetRequest.complete = true;
    }
}

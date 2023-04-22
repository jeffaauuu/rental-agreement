// SPDX-License-Identifier: MIT
pragma solidity ^0.5.0;

contract RentalAgreement {
    address payable public landlord;
    address payable public tenant;
    uint256 public rentAmount;
    uint256 public securityDeposit;
    uint256 public rentalPeriod;
    uint256 public startDate;
    uint256 public endDate;
    bool public isSigned;
    bool public isTerminated;
    bool public isInit;
    mapping(address => bool) public signatures;
    mapping(address => bytes32) public hashes;

    constructor() public {
        isInit = false;
    }

    function initialize(
        address payable _landlord,
        address payable _tenant,
        uint256 _rentAmount,
        uint256 _securityDeposit,
        uint256 _rentalPeriod
    ) public {
        if (!isInit) {
            require(
                address(landlord) == address(0) &&
                    address(tenant) == address(0),
                "Rental agreement has already been initialized"
            );
            landlord = _landlord;
            tenant = _tenant;
            rentAmount = _rentAmount;
            securityDeposit = _securityDeposit;
            rentalPeriod = _rentalPeriod;
            isInit = true;
            
        }
    }

    function checkHash(address signer) public returns(bool) {
        bytes32 hash = keccak256(abi.encodePacked(signer));
        if (hashes[signer] == hash) {
            return true;
        } else {
            hashes[signer] = hash;
            return false;
        }
    }

    function sign() public payable {
        require(
            msg.sender == landlord || msg.sender == tenant,
            "You are not authorized to sign"
        );
        require(
            msg.value == rentAmount + securityDeposit,
            "You need to pay the rent amount and security deposit"
        );

        if (msg.sender == landlord ) {
            require(!signatures[landlord], "Landlord has already signed");
            signatures[landlord] = true;
        } else if (msg.sender == tenant) {
            require(!signatures[tenant], "Tenant has already signed");
            signatures[tenant] = true;
        }

        if (signatures[landlord] && signatures[tenant]) {
            isSigned = true;
            startDate = block.timestamp;
            endDate = startDate + rentalPeriod;
        }
    }

    function terminate() public {
        require(msg.sender == landlord, "You are not authorized to terminate");
        require(
            !isTerminated,
            "The rental agreement has already been terminated"
        );

        isTerminated = true;
        landlord.transfer(address(this).balance);
    }

    function releaseDeposit() public {
        require(
            msg.sender == landlord,
            "You are not authorized to release the deposit"
        );
        require(
            block.timestamp >= endDate,
            "The rental period has not ended yet"
        );

        uint256 refundAmount = securityDeposit;
        if (block.timestamp < endDate + 1 weeks) {
            refundAmount -= rentAmount;
        }

        tenant.transfer(refundAmount);
        securityDeposit = 0;
    }

    function() external payable {
        require(
            msg.sender == tenant,
            "You are not authorized to make a payment"
        );

        uint256 totalRentOwed = rentAmount *
            ((block.timestamp - startDate) / rentalPeriod + 1);
        require(
            msg.value >= totalRentOwed,
            "You must send enough ETH to cover the rent owed"
        );

        // Update the contract balance
        address(this).transfer(msg.value);

        // Refund any excess ETH back to the tenant
        uint256 refundAmount = msg.value - totalRentOwed;
        if (refundAmount > 0) {
            msg.sender.transfer(refundAmount);
        }
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "hardhat/console.sol";

contract FairTicket {
    uint256 private _tokenIds;

    struct Ticket {
        uint256 id;
        address owner; // Logic link to the buyer (could be wallet address)
        uint256 price;
        uint256 timestamp;
    }

    mapping(uint256 => Ticket) public tickets;

    event TicketMinted(uint256 indexed ticketId, address indexed owner, uint256 price);

    constructor() {
        console.log("FairTicket Contract Deployed");
    }

    function mintTicket(address buyerAddress, uint256 price) public returns (uint256) {
        _tokenIds++;
        uint256 newItemId = _tokenIds;

        tickets[newItemId] = Ticket(newItemId, buyerAddress, price, block.timestamp);

        emit TicketMinted(newItemId, buyerAddress, price);

        return newItemId;
    }
}

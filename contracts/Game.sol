// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./MatterToken.sol";


contract Game is Ownable{
	uint private secret_number;
	MatterToken public token;

	event Winner(address indexed winner, uint payout_amount);
	event Loser(address indexed loser);

	constructor(){
		// Not totally secure but not a LINK payable VRF
		secret_number = uint(keccak256(abi.encodePacked(block.timestamp, msg.sender)));
		token = new MatterToken();
	}

	function guess(uint user_guess) external payable {
		require(msg.value == 10**15 wei, "exactly 0,001 eth must be sent");
		
		if(user_guess == secret_number){
			uint payout_eth = _contractpayout(payable(msg.sender));
			emit Winner(msg.sender, payout_eth);
		} else {
			emit Loser(msg.sender);
		}
    }

	function get_secret() external view onlyOwner returns(uint){
		return secret_number;
	}

	function change_secret(uint _new_secret) external onlyOwner{
		secret_number = _new_secret;
	}

	function _contractpayout(address payable _to) private returns(uint){
		// Pay 80% of the contract eth
		uint contract_value = address(this).balance * 4/5;
		(bool sent,) = _to.call{value: contract_value}("");
        require(sent, "Failed to send Ether");
        // Ask MatterToken to mint 100 tokens to user
        token.mint(_to, 100);

		return contract_value;
	}
}
# zkSync Game

zkSnyc Game is a dApp which lets players guess a secret number and pays eth and custom tokens if the number is guessed correctly. Live version [here](https://rococo-sprite-0d206f.netlify.app/)! Deployed through curtesy of [Netlify](https://www.netlify.com/).

This dApp is a full stack project with a React frontend, connected to Solidity smart contract with the nifty [zksync-web3](https://www.npmjs.com/package/zksync-web3) and deployed on the zksync testnet. In order to demonstrate the full development lifecycle, this project comes with two Solidity contracts (Game.sol and MatterToken.sol), a test suite, and a deployment script.

### Project initialization and compilation

##### Local Hardhat environment setup

Hardhat can be installed with npm or yarn as the package manager, however npm is preferred. See the [official documentation](https://hardhat.org/hardhat-runner/docs/getting-started#installation) for required packages. In order to manage npm, it is recommended to use nvm. For this project, the packages and versions used are:

* nvm v0.39.2
* npm v9.5.0
* node v18.14.2

Once you have the necessary components setup, you can pull this repository to your local machine and compile, test and deploy to the local Hardhat network. The commands are as follows:

Setup hardhat and install necessary project dependencies
``` 
npm install --save-dev hardhat
npm install --save-dev @nomicfoundation/hardhat-toolbox
npm install --save-dev @nomicfoundation/hardhat-chai-matchers
```
Compile and Test
``` 
npx hardhat compile
npx hardhat test --network hardhat
REPORT_GAS=true npx hardhat test --network hardhat

```
**Please note** that testing must be done on the hardhat local network because the fixtures are not setup to deploy on zkSync but rather just the local simulated HRE.

##### Deployment to zkSyncTestnet

This project has been successfully deployed to the zkSync testnet and can be viewed with the block explorer [here](https://goerli.explorer.zksync.io/address/0x025747E11a5a0D70DA67c1F625BD442d13474363).

The deployed contract has also been verified via the hardhat-zksync-verify plugin.

### Test Suite

##### Ownership Test
The first test asserts that the Game contract is owned by the address which deployed the contract.

The second test asserts that the owner of the MatterToken contract is owned by the Game contract because the MatterToken contract is deployed by Game.sol.

##### Game Play Tests
The first test checks the *require* statement at the beginning of the payable function and throws a revert with an error message if exactly 0.001eth is not sent.

The second test checks if the owner is able to set the secret number. This is helpful as it allows for fails and successes to be deliberately tested in later tests. onlyOwner s able to throw an error if a non-Owner calls the function but that was not tested in this suite.

Scenario simulation were divided into losses and wins:

* Loss test subset: Check the player submitted eth and paid gas, check the contrct received the eth
* Win test subset: Check that 80% of the contract is paid. Check that 100 Matter Tokens were minted to the winner.

##### Gas Reporting

A gas report was produced on hardhat and both public functions are using far below the BlockGasLimit at 7.6%. Further gas optimization strategies are welcome. Gas Report below.

<img width="734" alt="image" src="https://user-images.githubusercontent.com/78215404/228953176-4b6f008f-5e9c-402c-b0a0-0827085af265.png">


##### Event emittance
Events are emitted upon loss and win. Tests to check both cases with corresponding event arguments. The loss test checks with 1 incorrect guess. The win test case uses a loss then a win and checks the Winner log.

### Contribution
For any improvements or bug reporting, please open a PR or issue against this project.

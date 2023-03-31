const { Wallet, utils}= require("zksync-web3");
const { Deployer} = require("@matterlabs/hardhat-zksync-deploy");
const ck = require('ckey');

const main = async(hre) => {

  // Initialize the wallet.
  const wallet = new Wallet(ck.WALLET_PRIVATE_KEY);
  
  // Create deployer object and load the artifact of the contract you want to deploy.
  const deployer = new Deployer(hre, wallet);
  const artifact = await deployer.loadArtifact("Game");

  // Deploy this contract
  const deployed_game = await deployer.deploy(artifact);

  console.log(`Game deployed to ${deployed_game.address}`);sl
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main(hre).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

module.exports=main
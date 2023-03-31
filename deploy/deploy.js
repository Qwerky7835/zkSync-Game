const { Wallet, utils } = require("zksync-web3");
const ethers = require("ethers");
const hre = require("hardhat")
const { Deployer } = require("@matterlabs/hardhat-zksync-deploy");
require('dotenv').config();

async function main() {

  // Initialize the wallet.
  const wallet = new Wallet(process.env.WALLET_PRIVATE_KEY);

  // Create deployer object and load the artifact of the contract you want to deploy.
  const deployer = new Deployer(hre, wallet);
  const artifact = await deployer.loadArtifact("Game");

  // Estimate contract deployment fee
  const deploymentFee = await deployer.estimateDeployFee(artifact);

  // Deploy this contract
  const parsedFee = ethers.utils.formatEther(deploymentFee.toString());
  console.log(`The deployment is estimated to cost ${parsedFee} ETH`);

  const deployed_game = await deployer.deploy(artifact);

  console.log(`Game deployed to ${deployed_game.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

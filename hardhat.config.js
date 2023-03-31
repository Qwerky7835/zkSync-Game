const ck = require('ckey');
require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-chai-matchers")
require("@matterlabs/hardhat-zksync-deploy")
require("@matterlabs/hardhat-zksync-solc")
require("@matterlabs/hardhat-zksync-verify");
require("@nomiclabs/hardhat-ethers")

/* @type import('hardhat/config').HardhatUserConfig */

module.exports = {

  zksolc: {
    version: "1.3.5",
    compilerSource: "binary",
    settings: {},
  },

  defaultNetwork: "zkSyncTestnet",
  networks: {
    hardhat: {},
    goerli: {
       url: ck.ALCHEMY_API_URL,
       accounts: [ck.WALLET_PRIVATE_KEY]
    },
    zkSyncTestnet: {
      url: "https://zksync2-testnet.zksync.dev",
      ethNetwork: "goerli",
      zksync: true,
      verifyURL: 'https://zksync2-testnet-explorer.zksync.dev/contract_verification'
    },
  },
  solidity: "0.8.18",
};
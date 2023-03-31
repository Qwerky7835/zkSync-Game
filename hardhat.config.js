require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-chai-matchers")
require("@matterlabs/hardhat-zksync-deploy")
require("@matterlabs/hardhat-zksync-solc")

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  zksolc: {
    version: "1.3.5",
    compilerSource: "binary",
    settings: {},
  },

  defaultNetwork: "zkSyncTestnet",
  networks: {
    zkSyncTestnet: {
      url: "https://zksync2-testnet.zksync.dev",
      ethNetwork: "goerli",
      zksync: true,
    },
  },
  solidity: "0.8.18",
};

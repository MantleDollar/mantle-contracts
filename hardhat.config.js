require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");
require("hardhat-gas-reporter");
require("dotenv").config();

/**
 * @type import('hardhat/config').HardhatUserConfig
 */

module.exports = {
  networks: {
    localhost: {
      //Requires start of local network at port:
      url: "http://127.0.0.1:8545",
    },
    hardhat: {
      forking: {
        url: "https://arb-mainnet.g.alchemy.com/v2/lqEIXiFJz2CT7ObmV1-TfkCJ95z2wlsL",
        accounts: [process.env.PRIVATE_KEY],
      },
    },
  },
  solidity: {
    compilers: [
      {
        version: "0.8.1",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
      {
        version: "0.5.16",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
  },
  mocha: {
    timeout: 10000000000,
  },
  gasReporter: {
    enabled: false,
    currency: "USD",
    gasPriceApi:
      "https://api.etherscan.io/api?module=proxy&action=eth_gasPrice",
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_KEY,
  },
  namedAccounts: {
    deployer: {
      default: 0, // here this will by default take the first account as deployer
      1: 0, // similarly on mainnet it will take the first account as deployer. Note though that depending on how hardhat network are configured, the account 0 on one network can be different than on another
      42161: 0, // use the same address on arbitrum mainnet
      10: 0, // use the same address on optimism mainnet
      250: 0, // use the same address on fantom mainnet
      9000: 0, // use the same address on evmos testnet
      9001: 0, // use the same address on evmos mainnnet
      3: 0, // use the same address on ropsten
    },
  }
};

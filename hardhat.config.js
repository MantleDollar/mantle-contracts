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
    // goerli: {
    //   url: process.env.GOERLI_URL,
    //   //Consider any address posted here to be compromised
    //   accounts: [process.env.PRIVATE_KEY_1, process.env.PRIVATE_KEY_2],
    // },
    arbitrum: {
      url: process.env.ARBITRUM_URL,
      //Consider any address posted here to be compromised
      accounts: [process.env.PRIVATE_KEY],
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
};

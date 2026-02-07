require('babel-register');
require('babel-polyfill');
require('dotenv').config();

const HDWalletProvider = require('@truffle/hdwallet-provider');

// Read environment variables
const mnemonic = process.env.MNEMONIC || '';
const infuraKey = process.env.INFURA_KEY || '';
const alchemyUrl = process.env.ALCHEMY_SEPOLIA_URL || '';

module.exports = {
  networks: {
    // Local development network (Ganache)
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*"
    },

    // Sepolia testnet using Alchemy (more reliable)
    sepolia: {
      provider: () => new HDWalletProvider({
        mnemonic: {
          phrase: mnemonic
        },
        providerOrUrl: alchemyUrl,
        pollingInterval: 15000
      }),
      network_id: 11155111,
      gas: 5500000,
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true,
      networkCheckTimeout: 100000
    },

    // Sepolia via Infura (backup option)
    sepolia_infura: {
      provider: () => new HDWalletProvider({
        mnemonic: {
          phrase: mnemonic
        },
        providerOrUrl: `https://sepolia.infura.io/v3/${infuraKey}`,
        pollingInterval: 15000
      }),
      network_id: 11155111,
      gas: 5500000,
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true,
      networkCheckTimeout: 100000
    }
  },
  contracts_directory: './src/contracts/',
  contracts_build_directory: './src/abis/',
  compilers: {
    solc: {
      version: "0.8.0",
      settings: {
        optimizer: {
          enabled: true,
          runs: 200
        }
      }
    }
  }
}

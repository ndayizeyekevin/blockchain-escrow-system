/**
 * Ethereum and Smart Contract utilities
 * Handles wallet connection, contract interaction, and blockchain operations
 */

import { ethers } from 'ethers';

// Smart Contract ABI (Application Binary Interface)
// This defines the contract's methods and their signatures
export const ESCROW_CONTRACT_ABI = [
  {
    inputs: [
      { internalType: 'address', name: 'freelancerAddress', type: 'address' },
      { internalType: 'string', name: 'description', type: 'string' },
    ],
    name: 'createEscrow',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'newFreelancerAddress', type: 'address' },
    ],
    name: 'updateFreelancer',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'string', name: 'submissionDetails', type: 'string' }],
    name: 'submitWork',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'approveWork',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'cancelEscrow',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getEscrowStatus',
    outputs: [
      { internalType: 'address', name: '_client', type: 'address' },
      { internalType: 'address', name: '_freelancer', type: 'address' },
      { internalType: 'uint256', name: '_escrowAmount', type: 'uint256' },
      { internalType: 'bool', name: '_workSubmitted', type: 'bool' },
      { internalType: 'bool', name: '_workApproved', type: 'bool' },
      { internalType: 'bool', name: '_paymentReleased', type: 'bool' },
      { internalType: 'string', name: '_description', type: 'string' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getContractBalance',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'client',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'freelancer',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
];

/**
 * Connect to MetaMask wallet
 * @returns {Promise<string>} User's wallet address
 */
export async function connectWallet() {
  if (!window.ethereum) {
    throw new Error('MetaMask is not installed. Please install it to continue.');
  }

  try {
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    });
    return accounts[0];
  } catch (error) {
    if (error.code === 4001) {
      throw new Error('User denied wallet connection');
    }
    throw error;
  }
}

/**
 * Get the current connected account
 * @returns {Promise<string|null>} Current account address or null if not connected
 */
export async function getCurrentAccount() {
  if (!window.ethereum) {
    return null;
  }

  try {
    const accounts = await window.ethereum.request({
      method: 'eth_accounts',
    });
    return accounts.length > 0 ? accounts[0] : null;
  } catch (error) {
    console.error('Error getting current account:', error);
    return null;
  }
}

/**
 * Get the ethers.js provider
 * @returns {ethers.BrowserProvider} Ethers provider instance
 */
export function getProvider() {
  if (!window.ethereum) {
    throw new Error('MetaMask is not installed');
  }
  return new ethers.BrowserProvider(window.ethereum);
}

/**
 * Get a contract instance for reading and writing
 * @param {string} contractAddress - Address of the deployed contract
 * @returns {Promise<ethers.Contract>} Contract instance
 */
export async function getContract(contractAddress) {
  const provider = getProvider();
  const signer = await provider.getSigner();
  return new ethers.Contract(contractAddress, ESCROW_CONTRACT_ABI, signer);
}

/**
 * Get a read-only contract instance
 * @param {string} contractAddress - Address of the deployed contract
 * @returns {ethers.Contract} Read-only contract instance
 */
export function getReadOnlyContract(contractAddress) {
  const provider = getProvider();
  return new ethers.Contract(contractAddress, ESCROW_CONTRACT_ABI, provider);
}

/**
 * Convert ETH to Wei
 * @param {string|number} ethAmount - Amount in ETH
 * @returns {string} Amount in Wei
 */
export function ethToWei(ethAmount) {
  return ethers.parseEther(ethAmount.toString());
}

/**
 * Convert Wei to ETH
 * @param {string|BigInt} weiAmount - Amount in Wei
 * @returns {string} Amount in ETH
 */
export function weiToEth(weiAmount) {
  return ethers.formatEther(weiAmount);
}

/**
 * Format an address for display (show first 6 and last 4 characters)
 * @param {string} address - Ethereum address
 * @returns {string} Formatted address
 */
export function formatAddress(address) {
  if (!address) return '';
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

/**
 * Create an escrow payment
 * @param {string} contractAddress - Contract address
 * @param {string} freelancerAddress - Freelancer's address
 * @param {string} ethAmount - Amount to deposit in ETH
 * @param {string} description - Work description
 * @returns {Promise<string>} Transaction hash
 */
export async function createEscrow(contractAddress, freelancerAddress, ethAmount, description) {
  const contract = await getContract(contractAddress);
  const weiAmount = ethToWei(ethAmount);

  const tx = await contract.createEscrow(freelancerAddress, description, {
    value: weiAmount,
  });

  await tx.wait();
  return tx.hash;
}

/**
 * Update freelancer address as client
 * @param {string} contractAddress - Contract address
 * @param {string} newFreelancerAddress - New freelancer address
 * @returns {Promise<string>} Transaction hash
 */
export async function updateFreelancer(contractAddress, newFreelancerAddress) {
  const contract = await getContract(contractAddress);
  const tx = await contract.updateFreelancer(newFreelancerAddress);
  await tx.wait();
  return tx.hash;
}

/**
 * Submit work as freelancer
 * @param {string} contractAddress - Contract address
 * @param {string} workDetails - Details of the submitted work
 * @returns {Promise<string>} Transaction hash
 */
export async function submitWork(contractAddress, workDetails) {
  const contract = await getContract(contractAddress);
  const tx = await contract.submitWork(workDetails);
  await tx.wait();
  return tx.hash;
}

/**
 * Approve work as client
 * @param {string} contractAddress - Contract address
 * @returns {Promise<string>} Transaction hash
 */
export async function approveWork(contractAddress) {
  const contract = await getContract(contractAddress);
  const tx = await contract.approveWork();
  await tx.wait();
  return tx.hash;
}

/**
 * Cancel escrow as client
 * @param {string} contractAddress - Contract address
 * @returns {Promise<string>} Transaction hash
 */
export async function cancelEscrow(contractAddress) {
  const contract = await getContract(contractAddress);
  const tx = await contract.cancelEscrow();
  await tx.wait();
  return tx.hash;
}

/**
 * Get escrow status
 * @param {string} contractAddress - Contract address
 * @returns {Promise<Object>} Escrow status details
 */
export async function getEscrowStatus(contractAddress) {
  const contract = getReadOnlyContract(contractAddress);
  const status = await contract.getEscrowStatus();

  return {
    client: status[0],
    freelancer: status[1],
    escrowAmount: status[2],
    workSubmitted: status[3],
    workApproved: status[4],
    paymentReleased: status[5],
    description: status[6],
  };
}

/**
 * Get contract balance
 * @param {string} contractAddress - Contract address
 * @returns {Promise<string>} Balance in ETH
 */
export async function getContractBalance(contractAddress) {
  const contract = getReadOnlyContract(contractAddress);
  const balance = await contract.getContractBalance();
  return weiToEth(balance);
}

/**
 * Watch for wallet account changes
 * @param {Function} onAccountChange - Callback when account changes
 */
export function watchAccountChanges(onAccountChange) {
  if (!window.ethereum) {
    return;
  }

  window.ethereum.on('accountsChanged', (accounts) => {
    onAccountChange(accounts[0] || null);
  });
}

/**
 * Watch for network changes
 * @param {Function} onNetworkChange - Callback when network changes
 */
export function watchNetworkChanges(onNetworkChange) {
  if (!window.ethereum) {
    return;
  }

  window.ethereum.on('chainChanged', () => {
    onNetworkChange();
  });
}

/**
 * Get the currently connected network
 * @returns {Promise<Object>} Network information
 */
export async function getNetwork() {
  const provider = getProvider();
  const network = await provider.getNetwork();
  return {
    chainId: network.chainId,
    name: network.name,
  };
}

/**
 * Check if connected to Sepolia network
 * @returns {Promise<boolean>} True if on Sepolia, false otherwise
 */
export async function isOnSepolia() {
  try {
    const network = await getNetwork();
    return network.chainId === 11155111; // Sepolia chainId
  } catch (error) {
    console.error('Error checking network:', error);
    return false;
  }
}

/**
 * Request network switch to Sepolia
 * @returns {Promise<boolean>} True if successful, false otherwise
 */
export async function switchToSepolia() {
  if (!window.ethereum) {
    throw new Error('MetaMask is not installed');
  }

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0xaa36a7' }], // Sepolia chainId in hex
    });
    return true;
  } catch (error) {
    if (error.code === 4902) {
      // Sepolia not added to MetaMask, try to add it
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: '0xaa36a7',
              chainName: 'Sepolia Testnet',
              rpcUrls: ['https://sepolia.infura.io/v3/'],
              nativeCurrency: {
                name: 'Ethereum',
                symbol: 'ETH',
                decimals: 18,
              },
              blockExplorerUrls: ['https://sepolia.etherscan.io'],
            },
          ],
        });
        return true;
      } catch (addError) {
        console.error('Error adding Sepolia:', addError);
        return false;
      }
    }
    console.error('Error switching to Sepolia:', error);
    return false;
  }
}

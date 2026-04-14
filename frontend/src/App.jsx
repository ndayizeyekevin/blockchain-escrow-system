/**
 * Main Application Component
 * Orchestrates wallet connection, contract interaction, and component rendering
 */

import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ClientSection from './components/ClientSection';
import FreelancerSection from './components/FreelancerSection';
import StatusDisplay from './components/StatusDisplay';
import {
  connectWallet,
  getCurrentAccount,
  watchAccountChanges,
  watchNetworkChanges,
  getNetwork,
  getEscrowStatus,
  isOnSepolia,
  switchToSepolia,
} from './utils/Web3Utils';
import './App.css';

function App() {
  // State management
  const [account, setAccount] = useState(null);
  const [network, setNetwork] = useState(null);
  const [status, setStatus] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Contract address - Update this with your deployed contract address
  const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || 
    '0x0000000000000000000000000000000000000000';

  // Initialize on mount
  useEffect(() => {
    initializeApp();
  }, []);

  // Watch for account and network changes
  useEffect(() => {
    watchAccountChanges((newAccount) => {
      setAccount(newAccount);
      if (newAccount) {
        refreshEscrowStatus();
      }
    });

    watchNetworkChanges(() => {
      updateNetworkInfo();
      refreshEscrowStatus();
    });
  }, []);

  // Refresh status when account or contract address changes
  useEffect(() => {
    if (account && CONTRACT_ADDRESS !== '0x0000000000000000000000000000000000000000') {
      refreshEscrowStatus();
    }
  }, [account, CONTRACT_ADDRESS]);

  /**
   * Initialize the application
   */
  const initializeApp = async () => {
    try {
      // Check if wallet is already connected
      const currentAccount = await getCurrentAccount();
      if (currentAccount) {
        setAccount(currentAccount);
      }

      // Get and set network info
      await updateNetworkInfo();

      // Check network
      const onSepolia = await isOnSepolia();
      if (currentAccount && !onSepolia) {
        setInfoMessage('⚠️ Please switch to Sepolia network for the application to work correctly');
      }
    } catch (error) {
      console.error('Initialization error:', error);
    }
  };

  /**
   * Update network information
   */
  const updateNetworkInfo = async () => {
    try {
      const netInfo = await getNetwork();
      setNetwork(netInfo);
    } catch (error) {
      console.error('Error getting network:', error);
    }
  };

  /**
   * Connect wallet
   */
  const handleConnectWallet = async () => {
    setIsConnecting(true);
    setErrorMessage('');
    setInfoMessage('');

    try {
      const connectedAccount = await connectWallet();
      setAccount(connectedAccount);

      // Check if on Sepolia
      const onSepolia = await isOnSepolia();
      if (!onSepolia) {
        const switched = await switchToSepolia();
        if (switched) {
          setInfoMessage('✅ Successfully switched to Sepolia network');
        } else {
          setErrorMessage('Please manually switch to Sepolia network in MetaMask');
        }
      }

      await updateNetworkInfo();
      await refreshEscrowStatus();
    } catch (error) {
      console.error('Connection error:', error);
      setErrorMessage(error.message || 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  /**
   * Disconnect wallet
   */
  const handleDisconnect = () => {
    setAccount(null);
    setStatus(null);
    setErrorMessage('');
    setInfoMessage('Wallet disconnected');
    setTimeout(() => setInfoMessage(''), 3000);
  };

  /**
   * Refresh escrow status
   */
  const refreshEscrowStatus = async () => {
    if (!account || CONTRACT_ADDRESS === '0x0000000000000000000000000000000000000000') {
      return;
    }

    setRefreshing(true);

    try {
      const escrowStatus = await getEscrowStatus(CONTRACT_ADDRESS);
      setStatus(escrowStatus);
      setErrorMessage('');
    } catch (error) {
      console.error('Error fetching escrow status:', error);
      // Don't show error for contract read failures - may not be deployed yet
    } finally {
      setRefreshing(false);
    }
  };

  /**
   * Handle errors globally
   */
  const handleError = (message) => {
    setErrorMessage(message);
    setTimeout(() => setErrorMessage(''), 5000);
  };

  return (
    <div className="app">
      {/* Header */}
      <Header
        account={account}
        network={network}
        onConnect={handleConnectWallet}
        onDisconnect={handleDisconnect}
      />

      {/* Messages */}
      <div className="app-container">
        {errorMessage && (
          <div className="message error-message">
            ❌ {errorMessage}
          </div>
        )}

        {infoMessage && (
          <div className="message info-message">
            ℹ️ {infoMessage}
          </div>
        )}

        {!account && (
          <div className="connect-prompt">
            <div className="prompt-content">
              <h2>👋 Welcome to Blockchain Escrow System</h2>
              <p>
                Connect your MetaMask wallet to get started. Make sure you're on the Sepolia test network.
              </p>
              <button
                className="btn btn-primary btn-large"
                onClick={handleConnectWallet}
                disabled={isConnecting}
              >
                {isConnecting ? '⏳ Connecting...' : '🔐 Connect to MetaMask'}
              </button>
              <p className="note">
                💡 <strong>Note:</strong> You need MetaMask installed and some Sepolia ETH for gas fees.
                Get testnet ETH from the{' '}
                <a href="https://www.sepoliafaucet.io" target="_blank" rel="noopener noreferrer">
                  Sepolia Faucet
                </a>
              </p>
            </div>
          </div>
        )}

        {account && (
          <>
            {CONTRACT_ADDRESS === '0x0000000000000000000000000000000000000000' && (
              <div className="message warning-message">
                ⚠️ Contract address not configured. Please update VITE_CONTRACT_ADDRESS in .env.local
              </div>
            )}

            {/* Status Display */}
            <StatusDisplay status={status} contractAddress={CONTRACT_ADDRESS} />

            {/* Client Section */}
            <ClientSection
              account={account}
              contractAddress={CONTRACT_ADDRESS}
              status={status}
              onStatusUpdate={refreshEscrowStatus}
              onError={handleError}
            />

            {/* Freelancer Section */}
            <FreelancerSection
              account={account}
              contractAddress={CONTRACT_ADDRESS}
              status={status}
              onStatusUpdate={refreshEscrowStatus}
              onError={handleError}
            />

            {/* Refresh Button */}
            <div className="refresh-section">
              <button
                className="btn btn-secondary"
                onClick={refreshEscrowStatus}
                disabled={refreshing}
              >
                {refreshing ? '⏳ Refreshing...' : '🔄 Refresh Status'}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="footer">
        <p>
          Blockchain Escrow System | Build with ♥️ using Solidity, Hardhat, React & Vite
        </p>
      </footer>
    </div>
  );
}

export default App;

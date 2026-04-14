/**
 * Header Component
 * Displays wallet connection status and manages wallet connection
 */

import React from 'react';
import { formatAddress } from '../utils/Web3Utils';
import './Header.css';

function Header({ account, network, onConnect, onDisconnect }) {
  return (
    <header className="header">
      <div className="header-container">
        <div className="header-title">
          <h1>⛓️ Blockchain Escrow System</h1>
          <p>Decentralized Payment for Freelancers</p>
        </div>

        <div className="header-right">
          {network && (
            <div className="network-info">
              <span className="network-badge">
                🟢 {network.name}
              </span>
            </div>
          )}

          <div className="wallet-section">
            {account ? (
              <div className="wallet-connected">
                <span className="account-address">
                  💼 {formatAddress(account)}
                </span>
                <button
                  className="btn btn-danger"
                  onClick={onDisconnect}
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                className="btn btn-primary"
                onClick={onConnect}
              >
                Connect MetaMask
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;

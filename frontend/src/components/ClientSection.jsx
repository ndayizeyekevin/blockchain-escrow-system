/**
 * Client Section Component
 * Allows clients to create escrows and monitor their status
 */

import React, { useState } from 'react';
import { createEscrow, cancelEscrow, updateFreelancer } from '../utils/Web3Utils';
import './ClientSection.css';

function ClientSection({ account, contractAddress, status, onStatusUpdate, onError }) {
  const [freelancerAddress, setFreelancerAddress] = useState('');
  const [ethAmount, setEthAmount] = useState('');
  const [description, setDescription] = useState('');
  const [newFreelancerAddress, setNewFreelancerAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleCreateEscrow = async (e) => {
    e.preventDefault();

    if (!freelancerAddress || !ethAmount || !description) {
      onError('Please fill in all fields');
      return;
    }

    if (!contractAddress) {
      onError('Contract address not configured');
      return;
    }

    setIsLoading(true);
    setSuccessMessage('');

    try {
      await createEscrow(contractAddress, freelancerAddress, ethAmount, description);
      
      setSuccessMessage(`✅ Escrow created successfully with ${ethAmount} ETH!`);
      setFreelancerAddress('');
      setEthAmount('');
      setDescription('');

      // Refresh status
      onStatusUpdate();

      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error) {
      console.error('Error creating escrow:', error);
      onError(error.message || 'Failed to create escrow');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEscrow = async () => {
    if (!contractAddress) {
      onError('Contract address not configured');
      return;
    }

    setIsLoading(true);
    setSuccessMessage('');

    try {
      await cancelEscrow(contractAddress);
      
      setSuccessMessage('✅ Escrow cancelled! Refund received.');
      
      // Refresh status
      onStatusUpdate();

      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error) {
      console.error('Error cancelling escrow:', error);
      onError(error.message || 'Failed to cancel escrow');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateFreelancer = async (e) => {
    e.preventDefault();

    if (!newFreelancerAddress.trim()) {
      onError('Please enter a freelancer address');
      return;
    }

    if (!contractAddress) {
      onError('Contract address not configured');
      return;
    }

    setIsLoading(true);
    setSuccessMessage('');

    try {
      await updateFreelancer(contractAddress, newFreelancerAddress);
      
      setSuccessMessage('✅ Freelancer updated successfully!');
      setNewFreelancerAddress('');

      // Refresh status
      onStatusUpdate();

      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error) {
      console.error('Error updating freelancer:', error);
      onError(error.message || 'Failed to update freelancer');
    } finally {
      setIsLoading(false);
    }
  };

  const isClient = account && status && account.toLowerCase() === status.client.toLowerCase();

  return (
    <section className="client-section">
      <div className="section-container">
        <h2>👨‍💼 Client Dashboard</h2>

        {!isClient && account && (
          <div className="info-box warning">
            You are not the escrow client. Only the client can create and approve escrows.
          </div>
        )}

        {isClient && (
          <>
            <form onSubmit={handleCreateEscrow} className="form">
              <div className="form-group">
                <label htmlFor="freelancer-address">Freelancer Address</label>
                <input
                  id="freelancer-address"
                  type="text"
                  placeholder="0x1234567890123456789012345678901234567890"
                  value={freelancerAddress}
                  onChange={(e) => setFreelancerAddress(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="eth-amount">Amount (ETH)</label>
                <input
                  id="eth-amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="1.5"
                  value={ethAmount}
                  onChange={(e) => setEthAmount(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Work Description</label>
                <textarea
                  id="description"
                  placeholder="Describe the work to be done..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows="3"
                  disabled={isLoading}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-large"
                disabled={isLoading}
              >
                {isLoading ? '⏳ Creating...' : '💳 Create Escrow'}
              </button>
            </form>

            {successMessage && (
              <div className="success-message">
                {successMessage}
              </div>
            )}
          </>
        )}

        {status && status.escrowAmount > 0n && (
          <div className="escrow-info">
            <h3>Escrow Status</h3>
            <div className="status-grid">
              <div className="status-item">
                <span className="label">Status</span>
                <span className="value">
                  {status.paymentReleased ? '✅ Completed' : status.workApproved ? '⏳ Payment Released' : status.workSubmitted ? '👀 Waiting for Approval' : '⏱️ Waiting for Work'}
                </span>
              </div>
              <div className="status-item">
                <span className="label">Amount</span>
                <span className="value">{(Number(status.escrowAmount) / 1e18).toFixed(4)} ETH</span>
              </div>
            </div>

            {isClient && !status.workSubmitted && !status.paymentReleased && (
              <>
                <button
                  onClick={handleCancelEscrow}
                  className="btn btn-danger"
                  disabled={isLoading}
                  style={{ marginTop: '1rem', width: '100%' }}
                >
                  {isLoading ? '⏳ Cancelling...' : '❌ Cancel Escrow & Refund'}
                </button>

                <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #ddd' }}>
                  <h4 style={{ marginTop: 0, marginBottom: '1rem' }}>Update Freelancer Address</h4>
                  <form onSubmit={handleUpdateFreelancer} style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      type="text"
                      placeholder="New freelancer address"
                      value={newFreelancerAddress}
                      onChange={(e) => setNewFreelancerAddress(e.target.value)}
                      disabled={isLoading}
                      style={{ 
                        flex: 1, 
                        padding: '0.75rem', 
                        border: '1px solid #ddd', 
                        borderRadius: '6px',
                        fontFamily: 'inherit'
                      }}
                    />
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={isLoading}
                    >
                      {isLoading ? '⏳ Updating...' : '🔄 Update'}
                    </button>
                  </form>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

export default ClientSection;

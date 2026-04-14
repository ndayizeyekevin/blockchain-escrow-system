/**
 * Freelancer Section Component
 * Allows freelancers to submit work and clients to approve
 */

import React, { useState } from 'react';
import { submitWork, approveWork } from '../utils/Web3Utils';
import './FreelancerSection.css';

function FreelancerSection({ account, contractAddress, status, onStatusUpdate, onError }) {
  const [workDetails, setWorkDetails] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const isFreelancer = account && status && account.toLowerCase() === status.freelancer.toLowerCase();
  const isClient = account && status && account.toLowerCase() === status.client.toLowerCase();
  const hasEscrow = status && status.escrowAmount > 0n;

  const handleSubmitWork = async (e) => {
    e.preventDefault();

    if (!workDetails.trim()) {
      onError('Please enter work details');
      return;
    }

    if (!contractAddress) {
      onError('Contract address not configured');
      return;
    }

    setIsLoading(true);
    setSuccessMessage('');

    try {
      await submitWork(contractAddress, workDetails);
      
      setSuccessMessage('✅ Work submitted successfully!');
      setWorkDetails('');

      // Refresh status
      onStatusUpdate();

      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error) {
      console.error('Error submitting work:', error);
      onError(error.message || 'Failed to submit work');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveWork = async () => {
    if (!contractAddress) {
      onError('Contract address not configured');
      return;
    }

    setIsLoading(true);
    setSuccessMessage('');

    try {
      await approveWork(contractAddress);
      
      setSuccessMessage('✅ Work approved! Payment released to freelancer.');

      // Refresh status
      onStatusUpdate();

      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error) {
      console.error('Error approving work:', error);
      onError(error.message || 'Failed to approve work');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="freelancer-section">
      <div className="section-container">
        <h2>💼 Freelancer Dashboard</h2>

        {!hasEscrow && (
          <div className="info-box">
            No active escrow. Client needs to create one first.
          </div>
        )}

        {hasEscrow && !isFreelancer && account && (
          <div className="info-box warning">
            You are not the assigned freelancer. Only the freelancer can submit work.
          </div>
        )}

        {/* Freelancer Submit Work Section */}
        {isFreelancer && hasEscrow && status && !status.workSubmitted && (
          <>
            <form onSubmit={handleSubmitWork} className="form-freelancer">
              <div className="form-group">
                <label htmlFor="work-details">Submit Your Work</label>
                <textarea
                  id="work-details"
                  placeholder="Describe the work you've completed..."
                  value={workDetails}
                  onChange={(e) => setWorkDetails(e.target.value)}
                  rows="4"
                  disabled={isLoading}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-large"
                disabled={isLoading}
              >
                {isLoading ? '⏳ Submitting...' : '📤 Submit Work'}
              </button>
            </form>

            {successMessage && (
              <div className="success-message">
                {successMessage}
              </div>
            )}
          </>
        )}

        {status && status.workSubmitted && !status.workApproved && (
          <div className="work-status">
            <div className="status-badge waiting">
              ⏳ Work Submitted - Waiting for Client Approval
            </div>
            {isClient && (
              <button
                onClick={handleApproveWork}
                className="btn btn-primary btn-large"
                disabled={isLoading}
              >
                {isLoading ? '⏳ Processing...' : '✅ Approve & Release Payment'}
              </button>
            )}
            {successMessage && (
              <div className="success-message">
                {successMessage}
              </div>
            )}
          </div>
        )}

        {status && status.paymentReleased && (
          <div className="work-status">
            <div className="status-badge completed">
              ✅ Completed - Payment Released to Freelancer
            </div>
          </div>
        )}

        {/* Work Details Display */}
        {status && status.description && (
          <div className="work-details">
            <h3>📋 Work Description</h3>
            <p>{status.description}</p>
          </div>
        )}
      </div>
    </section>
  );
}

export default FreelancerSection;

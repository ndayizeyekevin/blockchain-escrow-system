/**
 * Status Display Component
 * Shows the current status of the escrow contract
 */

import React from 'react';
import { formatAddress, weiToEth } from '../utils/Web3Utils';
import './StatusDisplay.css';

function StatusDisplay({ status, contractAddress }) {
  if (!status || !status.escrowAmount || status.escrowAmount === 0n) {
    return (
      <section className="status-display">
        <div className="section-container">
          <div className="empty-state">
            <span className="empty-icon">🚀</span>
            <h3>No Active Escrow</h3>
            <p>Create an escrow to get started with the blockchain payment system.</p>
          </div>
        </div>
      </section>
    );
  }

  const escrowInEth = parseFloat(weiToEth(status.escrowAmount)).toFixed(4);

  const getStatusColor = () => {
    if (status.paymentReleased) return 'completed';
    if (status.workApproved) return 'approved';
    if (status.workSubmitted) return 'submitted';
    return 'pending';
  };

  const getStatusText = () => {
    if (status.paymentReleased) return '✅ Completed';
    if (status.workApproved) return '⏳ Payment Released';
    if (status.workSubmitted) return '👀 Awaiting Approval';
    return '⏱️ Pending Work Submission';
  };

  return (
    <section className="status-display">
      <div className="section-container">
        <h2>📊 Escrow Status Monitor</h2>

        <div className="status-timeline">
          <div className={`timeline-step ${status.escrowAmount > 0n ? 'completed' : ''}`}>
            <div className="timeline-marker">1</div>
            <div className="timeline-content">
              <h4>Created</h4>
              <p>Escrow initialized</p>
            </div>
          </div>

          <div className={`timeline-step ${status.workSubmitted ? 'completed' : ''}`}>
            <div className="timeline-marker">2</div>
            <div className="timeline-content">
              <h4>Work Submitted</h4>
              <p>Freelancer submitted work</p>
            </div>
          </div>

          <div className={`timeline-step ${status.workApproved ? 'completed' : ''}`}>
            <div className="timeline-marker">3</div>
            <div className="timeline-content">
              <h4>Approved</h4>
              <p>Client approved work</p>
            </div>
          </div>

          <div className={`timeline-step ${status.paymentReleased ? 'completed' : ''}`}>
            <div className="timeline-marker">4</div>
            <div className="timeline-content">
              <h4>Completed</h4>
              <p>Payment released</p>
            </div>
          </div>
        </div>

        <div className={`status-card status-${getStatusColor()}`}>
          <div className="status-header">
            <span className="status-badge">{getStatusText()}</span>
          </div>

          <div className="status-details">
            <div className="detail-row">
              <span className="detail-label">Client Address:</span>
              <span className="detail-value monospace">{formatAddress(status.client)}</span>
            </div>

            <div className="detail-row">
              <span className="detail-label">Freelancer Address:</span>
              <span className="detail-value monospace">{formatAddress(status.freelancer)}</span>
            </div>

            <div className="detail-row">
              <span className="detail-label">Escrow Amount:</span>
              <span className="detail-value highlight">{escrowInEth} ETH</span>
            </div>

            <div className="detail-row">
              <span className="detail-label">Contract Address:</span>
              <span className="detail-value monospace">{formatAddress(contractAddress)}</span>
            </div>

            <div className="detail-row">
              <span className="detail-label">Work Submitted:</span>
              <span className={`detail-value ${status.workSubmitted ? 'success' : 'pending'}`}>
                {status.workSubmitted ? '✅ Yes' : '⏳ No'}
              </span>
            </div>

            <div className="detail-row">
              <span className="detail-label">Work Approved:</span>
              <span className={`detail-value ${status.workApproved ? 'success' : 'pending'}`}>
                {status.workApproved ? '✅ Yes' : '⏳ No'}
              </span>
            </div>

            <div className="detail-row">
              <span className="detail-label">Payment Released:</span>
              <span className={`detail-value ${status.paymentReleased ? 'success' : 'pending'}`}>
                {status.paymentReleased ? '✅ Yes' : '⏳ No'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default StatusDisplay;

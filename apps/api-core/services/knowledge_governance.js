import { query } from '../config/db.js';

// Local knowledge registry tracking metadata parameters in mock mode
export const localKnowledgeAssets = new Map();

/**
 * Validates GxP metadata parameters for a knowledge asset document.
 */
export function validateKnowledgeMetadata(assetId, metadata) {
  const errors = [];

  if (!metadata.owner) errors.push("Missing document Owner ID.");
  if (!metadata.reviewer) errors.push("Missing document Quality Reviewer ID.");
  
  if (!metadata.checksum || metadata.checksum.length !== 64) {
    errors.push("Invalid integrity checksum. Must be a valid SHA-256 hash.");
  }

  if (!metadata.effective_date) {
    errors.push("Missing Effective Date.");
  }

  if (!metadata.review_date) {
    errors.push("Missing Review Date schedule.");
  } else {
    const reviewDate = new Date(metadata.review_date);
    if (isNaN(reviewDate.getTime())) {
      errors.push("Invalid Review Date format.");
    } else if (reviewDate.getTime() <= Date.now()) {
      errors.push(`Review Date ${metadata.review_date} must be in the future.`);
    }
  }

  const allowedStatuses = ['DRAFT', 'REVIEW', 'APPROVED', 'EFFECTIVE', 'SUPERSEDED', 'RETIRED'];
  if (!metadata.lifecycle_status || !allowedStatuses.includes(metadata.lifecycle_status.toUpperCase())) {
    errors.push(`Invalid lifecycle status '${metadata.lifecycle_status}'. Allowed options: [${allowedStatuses.join(', ')}].`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Registers document metadata parameters.
 */
export function registerAssetMetadata(assetId, metadata) {
  const validation = validateKnowledgeMetadata(assetId, metadata);
  if (!validation.isValid) {
    throw new Error(`Knowledge Governance Error: ${validation.errors.join(' ')}`);
  }

  localKnowledgeAssets.set(assetId, {
    assetId,
    ...metadata,
    lifecycle_status: metadata.lifecycle_status.toUpperCase()
  });

  return { assetId, registered: true };
}

/**
 * Evaluates whether a knowledge chunk is eligible for injection.
 * Rejects unmanaged, expired, or non-active assets.
 */
export function isAssetEligible(assetId) {
  const asset = localKnowledgeAssets.get(assetId);
  
  // Reject unmanaged assets (no metadata registered)
  if (!asset) {
    console.warn(`[Knowledge Governance] Rejected unmanaged asset: ${assetId}`);
    return false;
  }

  // Reject expired assets (review date has passed)
  const reviewTime = new Date(asset.review_date).getTime();
  if (reviewTime <= Date.now()) {
    console.warn(`[Knowledge Governance] Rejected expired asset: ${assetId}. Review Date was ${asset.review_date}`);
    return false;
  }

  // Reject retired, superseded, review, or draft statuses
  const activeStates = ['APPROVED', 'EFFECTIVE'];
  if (!activeStates.includes(asset.lifecycle_status)) {
    console.warn(`[Knowledge Governance] Rejected asset in ineligible status: ${assetId} (${asset.lifecycle_status})`);
    return false;
  }

  return true;
}

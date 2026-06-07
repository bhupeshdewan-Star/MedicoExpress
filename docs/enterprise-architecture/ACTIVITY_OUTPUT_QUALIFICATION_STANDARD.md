# Activity Output Qualification Standard

**Document status:** Proposed for owner review  
**Version:** 0.1  
**Purpose:** Require real-output testing before an Activity Governance Package receives internal architecture approval.

## 1. Qualification Rule

Every activity must successfully produce and validate at least two representative real outputs before internal architecture approval.

The two runs should differ meaningfully in complexity, maturity, evidence availability, or risk so the activity is tested beyond a single favorable example.

## 2. Required Qualification Cycle

```text
Approved or review-ready activity package
-> Qualification protocol
-> Output Run 1
-> Independent validation
-> Findings and package revision
-> Output Run 2
-> Independent validation
-> Comparative assessment
-> Internal architecture approval | conditional approval | rejection
```

## 3. Minimum Pass Criteria

Each run must demonstrate:

- correct activity, intended use, audience, and scope;
- consultation of the applicable SOP and skill;
- mandatory inputs and data gaps handled correctly;
- output architecture completeness;
- evidence provenance and citation traceability;
- no invented facts, scores, sources, or conclusions;
- required controls, warnings, and limitations;
- usable, professional output format;
- documented validation findings;
- correct revision and approval behavior.

## 4. Decision Rules

| Decision | Rule |
|---|---|
| Pass | Both outputs meet all critical criteria and the activity package requires no material redesign |
| Conditional Pass | Both outputs are usable and safe, but defined major improvements are required before implementation |
| Fail | Any output contains an unresolved critical issue or the package cannot reliably produce its intended result |

## 5. Product Appraisal Qualification Pair

The initial Product Appraisal qualification uses:

1. Trelagliptin, requested as "Trilagliptin": limited/geography-specific evidence and material data gaps.
2. Empagliflozin: mature global product with broad evidence and indications.

This pairing tests whether the activity handles both uncertain and evidence-rich products without overstating conclusions.


# Statistical Learning Center Gap Report — ClinCommand OS™
## Document ID: GXP-SLC-GAP-001-V1.0
## Date of Review: 2026-06-05

---

### 1. Overview and Objectives
This gap report audits the readiness of the **Statistical Learning Center** to support Phase 17/17.5 requirements. It outlines the purpose, theory, formulas, inputs, outputs, interpretation, common mistakes, and regulatory references for 24 statistical methods.

---

### 2. Method-by-Method Verification

#### 1. Mean
- **Purpose**: Calculate arithmetic center of a continuous variable.
- **Theory**: Expectation value of a random variable sample.
- **Formula**: $\bar{x} = \frac{1}{n} \sum_{i=1}^n x_i$
- **Assumptions**: Continuous scale, no extreme outliers.
- **Inputs**: 1D continuous array.
- **Outputs**: Scalar mean.
- **Interpretation**: Central tendency of dataset.
- **Common Mistakes**: Using for skewed data.
- **When Not To Use**: Strongly skewed data or ordinal data.
- **Pharmaceutical Example**: Average baseline systolic blood pressure of subjects.
- **FDA/EMA/ICH References**: FDA Guidance for Industry: Non-Inferiority Clinical Trials; ICH E9.

#### 2. Median
- **Purpose**: Identify the 50th percentile value of a dataset.
- **Theory**: Splits distribution into two equal halves.
- **Formula**: Sorted middle element (or average of two middle elements).
- **Assumptions**: Ordinal or continuous scale.
- **Inputs**: 1D numerical array.
- **Outputs**: Scalar median.
- **Interpretation**: Midpoint of the distribution.
- **Common Mistakes**: Confusing with mean.
- **When Not To Use**: Small datasets with high tie frequency.
- **Pharmaceutical Example**: Median time to treatment response.
- **FDA/EMA/ICH References**: FDA Guidance: Immunogenicity Testing; ICH E9.

#### 3. Standard Deviation (SD)
- **Purpose**: Measure the dispersion of data points around the mean.
- **Theory**: Variance square root.
- **Formula**: $s = \sqrt{\frac{1}{n-1} \sum (x_i - \bar{x})^2}$
- **Assumptions**: Continuous scale, normal distribution approximation.
- **Inputs**: 1D continuous array.
- **Outputs**: Scalar standard deviation.
- **Interpretation**: Average distance of data points from the mean.
- **Common Mistakes**: Using SD to describe standard error of mean.
- **When Not To Use**: Non-normal distributions where percentiles are preferred.
- **Pharmaceutical Example**: Variability in subject weight.
- **FDA/EMA/ICH References**: ICH E3 Structure and Content of Clinical Study Reports.

#### 4. Variance
- **Purpose**: Measure the average squared deviations from the mean.
- **Theory**: Standard deviation squared.
- **Formula**: $s^2 = \frac{1}{n-1} \sum (x_i - \bar{x})^2$
- **Assumptions**: Continuous scale.
- **Inputs**: 1D continuous array.
- **Outputs**: Scalar variance.
- **Interpretation**: Total spread of data.
- **Common Mistakes**: Interpreting in original units (units are squared).
- **When Not To Use**: Describing data dispersion directly to clinical stakeholders.
- **Pharmaceutical Example**: In-vitro dissolution variance across batches.
- **FDA/EMA/ICH References**: FDA Bioequivalence Guidance.

#### 5. Coefficient of Variation (CV)
- **Purpose**: Measure relative dispersion (dimensionless).
- **Theory**: SD normalized by mean.
- **Formula**: $CV = \frac{s}{\bar{x}}$
- **Assumptions**: Continuous scale, positive mean.
- **Inputs**: 1D continuous array.
- **Outputs**: Scalar fraction or percentage.
- **Interpretation**: Relative variability.
- **Common Mistakes**: Using for variables with negative or zero means.
- **When Not To Use**: Standardized scales (e.g. Celsius).
- **Pharmaceutical Example**: Within-subject pharmacokinetic bioavailability CV%.
- **FDA/EMA/ICH References**: FDA Guidance: Bioanalytical Method Validation.

#### 6. Independent T-Test
- **Purpose**: Compare means of two independent groups.
- **Theory**: Welch's or Student's t-distribution.
- **Formula**: $t = \frac{\bar{x}_1 - \bar{x}_2}{\sqrt{\frac{s_1^2}{n_1} + \frac{s_2^2}{n_2}}}$
- **Assumptions**: Continuous scale, independent observations, normal distribution within groups.
- **Inputs**: Two independent 1D continuous arrays.
- **Outputs**: t-statistic, p-value, mean difference, degrees of freedom.
- **Interpretation**: Statistically significant difference between two group means.
- **Common Mistakes**: Assuming equal variances without testing.
- **When Not To Use**: Paired observations.
- **Pharmaceutical Example**: Comparing blood pressure drop between drug and placebo.
- **FDA/EMA/ICH References**: FDA Non-Inferiority Guidance; ICH E9.

#### 7. Paired T-Test
- **Purpose**: Compare means of two paired/dependent groups.
- **Theory**: T-test on differences.
- **Formula**: $t = \frac{\bar{d}}{s_d / \sqrt{n}}$
- **Assumptions**: Paired observations, differences are normally distributed.
- **Inputs**: Two dependent 1D continuous arrays.
- **Outputs**: t-statistic, p-value, mean difference.
- **Interpretation**: Significant change within subjects pre-to-post intervention.
- **Common Mistakes**: Treating paired data as independent.
- **When Not To Use**: Unmatched cohorts.
- **Pharmaceutical Example**: Pre-treatment vs. post-treatment cholesterol levels.
- **FDA/EMA/ICH References**: ICH E9.

#### 8. One-Way ANOVA
- **Purpose**: Compare means of three or more independent groups.
- **Theory**: Variance decomposition (Between vs. Within).
- **Formula**: $F = \frac{MST}{MSE}$
- **Assumptions**: Normal distribution, homogeneity of variance, independence.
- **Inputs**: List of three or more 1D continuous arrays.
- **Outputs**: F-statistic, p-value.
- **Interpretation**: Significant difference among group means.
- **Common Mistakes**: Interpreting significant F-statistic without post-hoc tests.
- **When Not To Use**: Repeated measures or non-normal data.
- **Pharmaceutical Example**: Comparing efficacy of three different drug doses.
- **FDA/EMA/ICH References**: FDA Guidance: Multi-dose Efficacy Studies.

#### 9. ANCOVA
- **Purpose**: Compare group means while controlling for a continuous covariate.
- **Theory**: Linear regression combined with ANOVA.
- **Formula**: $y_{ij} = \mu + \alpha_i + \beta(x_{ij} - \bar{x}) + \epsilon_{ij}$
- **Assumptions**: Homogeneity of regression slopes, normal distribution of residuals, linearity.
- **Inputs**: Group indicator, dependent continuous variable, covariate continuous variable.
- **Outputs**: Adjusted group means, F-statistic, p-value.
- **Interpretation**: Efficacy difference after adjusting for baseline values.
- **Common Mistakes**: Proceeding when regression slopes are unequal.
- **When Not To Use**: Non-linear covariate relationships.
- **Pharmaceutical Example**: Efficacy comparison adjusting for baseline subject age.
- **FDA/EMA/ICH References**: FDA Covariate Adjustment Guidance (2023); ICH E9.

#### 10. Chi-Square Test
- **Purpose**: Compare categorical counts against expectations.
- **Theory**: Pearson's Chi-square distribution.
- **Formula**: $\chi^2 = \sum \frac{(O - E)^2}{E}$
- **Assumptions**: Independent observations, mutually exclusive categories, expected count $\ge 5$ in 80% cells.
- **Inputs**: 2D contingency table.
- **Outputs**: $\chi^2$ statistic, p-value, degrees of freedom.
- **Interpretation**: Association between two categorical variables.
- **Common Mistakes**: Using for small expected counts.
- **When Not To Use**: Small expected cell frequencies ($<5$).
- **Pharmaceutical Example**: Adverse event occurrence (Yes/No) vs. treatment arm (Drug/Placebo).
- **FDA/EMA/ICH References**: FDA Guidance: Safety Reporting; ICH E9.

#### 11. Fisher's Exact Test
- **Purpose**: Compare categorical frequencies in small samples.
- **Theory**: Hypergeometric probability distribution.
- **Formula**: $p = \frac{(a+b)!(c+d)!(a+c)!(b+d)!}{n!a!b!c!d!}$
- **Assumptions**: 2x2 contingency table, fixed marginal totals.
- **Inputs**: 2x2 contingency table.
- **Outputs**: Odds ratio, p-value.
- **Interpretation**: Association in small frequency tables.
- **Common Mistakes**: Using for large sample tables (computationally expensive).
- **When Not To Use**: Table dimensions larger than 2x2 (unless generalized).
- **Pharmaceutical Example**: Rare adverse event frequency comparison (Drug vs. Placebo).
- **FDA/EMA/ICH References**: FDA Guidance on Safety Monitoring; ICH E9.

#### 12. Mann-Whitney U Test
- **Purpose**: Compare two independent non-parametric distributions.
- **Theory**: Sum of ranks comparison.
- **Formula**: $U = \min(U_1, U_2)$ where $U_i = n_1 n_2 + \frac{n_i(n_i+1)}{2} - R_i$
- **Assumptions**: Ordinal or continuous data, independent groups.
- **Inputs**: Two independent 1D arrays.
- **Outputs**: U-statistic, p-value.
- **Interpretation**: Efficacy differences in non-normal datasets.
- **Common Mistakes**: Assuming it compares means.
- **When Not To Use**: Paired observations.
- **Pharmaceutical Example**: Comparing Likert pain score scale between two groups.
- **FDA/EMA/ICH References**: FDA Patient-Reported Outcomes Guidance.

#### 13. Wilcoxon Signed-Rank Test
- **Purpose**: Compare paired non-parametric distributions.
- **Theory**: Ranks of absolute differences.
- **Formula**: $W = \sum_{i=1}^{N_r} [\operatorname{sgn}(x_{2,i} - x_{1,i}) \cdot R_i]$
- **Assumptions**: Paired observations, symmetric distribution of differences.
- **Inputs**: Two dependent 1D arrays.
- **Outputs**: Wilcoxon statistic, p-value.
- **Interpretation**: Significant median shift between paired groups.
- **Common Mistakes**: Treating independent groups with Wilcoxon.
- **When Not To Use**: Unpaired groups.
- **Pharmaceutical Example**: Pre- vs. post-treatment pain scores.
- **FDA/EMA/ICH References**: FDA Guidance on Pain Efficacy; ICH E9.

#### 14. Kaplan-Meier Estimator
- **Purpose**: Estimate survival probability over time with censoring.
- **Theory**: Product limit survival distribution.
- **Formula**: $S(t) = \prod_{t_i \le t} \left(1 - \frac{d_i}{n_i}\right)$
- **Assumptions**: Censoring is uninformative, survival probabilities are same for early vs late subjects.
- **Inputs**: 1D durations array, 1D event status array (1=event, 0=censored).
- **Outputs**: Timeline, survival probabilities, curves (SVG).
- **Interpretation**: Survival rate over duration.
- **Common Mistakes**: Ignoring informative censoring.
- **When Not To Use**: Time-dependent covariates (use Cox).
- **Pharmaceutical Example**: Time to mortality in oncology trials.
- **FDA/EMA/ICH References**: FDA Guidance: Clinical Trial Endpoints for Oncology (2018); ICH E9.

#### 15. Log-Rank Test
- **Purpose**: Compare survival curves between two or more groups.
- **Theory**: Observed vs. expected event comparison.
- **Formula**: $\chi^2 = \frac{(\sum O_j - E_j)^2}{\sum V_j}$
- **Assumptions**: Proportional hazards.
- **Inputs**: Durations and event arrays for multiple groups.
- **Outputs**: Test statistic, p-value.
- **Interpretation**: Significant difference in survival distributions.
- **Common Mistakes**: Proceeding when survival curves cross.
- **When Not To Use**: Crossing survival curves.
- **Pharmaceutical Example**: Time-to-progression difference between treatment arms.
- **FDA/EMA/ICH References**: FDA Oncology Trial Endpoints; ICH E9.

#### 16. Cox Proportional Hazards Regression
- **Purpose**: Model survival times using multiple covariates.
- **Theory**: Semi-parametric hazard ratio modeling.
- **Formula**: $h(t | x) = h_0(t) \exp(\beta_1 x_1 + \dots + \beta_p x_p)$
- **Assumptions**: Proportional hazards over time.
- **Inputs**: Durations, events, covariate matrix.
- **Outputs**: Hazard ratios, confidence intervals, p-values.
- **Interpretation**: Covariate effects on hazard rates.
- **Common Mistakes**: Violating proportional hazards assumption.
- **When Not To Use**: Non-proportional hazards.
- **Pharmaceutical Example**: Hazard ratio of progression adjusting for age, gender, stage.
- **FDA/EMA/ICH References**: FDA Guidance for Oncology Endpoints; ICH E9.

#### 17. Linear Regression
- **Purpose**: Model continuous relationship between variables.
- **Theory**: Ordinary Least Squares (OLS).
- **Formula**: $y = \beta_0 + \beta_1 x + \epsilon$
- **Assumptions**: Linearity, homoscedasticity, normality, independence of residuals.
- **Inputs**: Independent variable array, dependent variable array.
- **Outputs**: Slope, intercept, $R^2$, standard error, p-value.
- **Interpretation**: Unit change effect on response.
- **Common Mistakes**: Extrapolating beyond range of data.
- **When Not To Use**: Non-linear relationships.
- **Pharmaceutical Example**: Drug dose vs. heart rate reduction.
- **FDA/EMA/ICH References**: FDA Guidance: Dose-Response Information; ICH E4.

#### 18. Logistic Regression
- **Purpose**: Model probability of binary outcome.
- **Theory**: Maximum likelihood parameter estimation.
- **Formula**: $\ln\left(\frac{p}{1-p}\right) = \beta_0 + \beta_1 x$
- **Assumptions**: Independence of observations, no multicollinearity, linearity of log-odds.
- **Inputs**: Continuous/categorical features, binary outcome array (0/1).
- **Outputs**: Intercept, coefficients, odds ratios, p-values.
- **Interpretation**: Odds ratio change per unit change.
- **Common Mistakes**: Overfitting with small event counts.
- **When Not To Use**: Multi-class target variables (unless multinomial).
- **Pharmaceutical Example**: Probability of treatment response (Yes/No) based on biomarker levels.
- **FDA/EMA/ICH References**: FDA Guidance on Efficacy Evaluation; ICH E9.

#### 19. ROC Curve & AUC
- **Purpose**: Evaluate performance of binary classifier.
- **Theory**: True positive rate vs. false positive rate tradeoff.
- **Formula**: $AUC = \int_0^1 \text{TPR}(\text{FPR}) d\text{FPR}$
- **Assumptions**: Continuous diagnostic score, binary true status.
- **Inputs**: Continuous diagnostic scores, binary targets.
- **Outputs**: Sensitivity/specificity coordinate tables, AUC score.
- **Interpretation**: Diagnostic efficacy.
- **Common Mistakes**: Calculating AUC on training datasets.
- **When Not To Use**: Highly imbalanced classes (precision-recall curves preferred).
- **Pharmaceutical Example**: Efficacy of a biomarker to diagnose a disease.
- **FDA/EMA/ICH References**: FDA Guidance: In-Vitro Diagnostic Devices.

#### 20. Meta-Analysis
- **Purpose**: Combine results from multiple independent trials.
- **Theory**: Weighted effect sizes (fixed or random effects).
- **Formula**: $\theta = \frac{\sum w_i \theta_i}{\sum w_i}$
- **Assumptions**: Study compatibility, no publication bias.
- **Inputs**: Effect sizes, standard errors of studies.
- **Outputs**: Pooled effect estimate, confidence interval, heterogeneity test ($I^2$).
- **Interpretation**: Cumulative evidence summary.
- **Common Mistakes**: Combining clinically heterogeneous studies.
- **When Not To Use**: High unexplained study heterogeneity.
- **Pharmaceutical Example**: Pooling log odds ratios from five multi-center trials.
- **FDA/EMA/ICH References**: FDA Guidance: Meta-Analyses of Randomized Controlled Trials (2018); ICH E9.

#### 21. Bioequivalence Analysis
- **Purpose**: Assess pharmacokinetic equivalence (Generic vs Brand).
- **Theory**: Two One-Sided Tests (TOST).
- **Formula**: 90% Confidence Interval of geometric mean ratio within $[80\%, 125\%]$.
- **Assumptions**: Lognormal distribution of parameters (AUC, Cmax).
- **Inputs**: Crossover design PK parameters (Cmax, AUC).
- **Outputs**: Geometric mean ratio, 90% CI boundaries.
- **Interpretation**: Rate and extent of absorption equivalence.
- **Common Mistakes**: Using standard 95% CI.
- **When Not To Use**: Highly variable drugs without replica design.
- **Pharmaceutical Example**: Comparing Generic Metformin against Brand Metformin.
- **FDA/EMA/ICH References**: FDA Bioequivalence Guidance (2021); ICH M13.

#### 22. Sample Size Calculation
- **Purpose**: Determine subjects needed to detect an effect.
- **Theory**: Type I and Type II error probability limits.
- **Formula**: $n = 2 \frac{(z_{1-\alpha/2} + z_{1-\beta})^2 \sigma^2}{\delta^2}$
- **Assumptions**: Specified alpha, power, expected effect size, SD.
- **Inputs**: Alpha, Power, Expected Efficacy Difference, Population SD.
- **Outputs**: Recommended sample size count.
- **Interpretation**: Minimum cohort needed.
- **Common Mistakes**: Underestimating variability, leading to underpowered trials.
- **When Not To Use**: Exploratory pilot phases where target size is fixed.
- **Pharmaceutical Example**: Calculating sample size for phase III study.
- **FDA/EMA/ICH References**: ICH E9.

#### 23. Power Analysis
- **Purpose**: Compute probability of detecting an effect given sample size.
- **Theory**: Non-central distributions parameter shift.
- **Formula**: $\text{Power} = 1 - \beta = \Phi\left(\frac{\delta \sqrt{n}}{\sigma \sqrt{2}} - z_{1-\alpha/2}\right)$
- **Assumptions**: Efficacy difference, sample size, variability.
- **Inputs**: Sample size, expected difference, standard deviation, alpha.
- **Outputs**: Power percentage.
- **Interpretation**: Probability of successful trial outcome.
- **Common Mistakes**: Assuming retrospective power is informative.
- **When Not To Use**: Estimating effect sizes.
- **Pharmaceutical Example**: Evaluating probability of success for trial with 200 subjects.
- **FDA/EMA/ICH References**: ICH E9.

#### 24. ANCOVA Efficacy
- **Purpose**: Specialized baseline covariate adjustment efficacy check.
- **Theory**: Linear model adjustment on change scores.
- **Formula**: $y_{\text{change}} = \beta_0 + \beta_1 \text{Treatment} + \beta_2 y_{\text{baseline}}$
- **Assumptions**: Linear baseline adjustment, slopes equivalence.
- **Inputs**: Baseline scores, post-treatment scores, treatment groups.
- **Outputs**: Treatment coefficients, adjusted change p-value.
- **Interpretation**: Treatment effect independent of baseline imbalances.
- **Common Mistakes**: Ignoring baseline interaction terms.
- **When Not To Use**: Baseline values completely independent of groups.
- **Pharmaceutical Example**: Change in pain score baseline adjustment.
- **FDA/EMA/ICH References**: FDA Covariate Adjustment Guidance (2023); ICH E9.

---

### 3. Gap Analysis Findings
While Gate 3 provides the validated Python biostats calculation framework, the **Statistical Learning Center UI component (Gate 4 & 5)** must serve as the repository for these definitions. 

**Gap Status**: UI manuals and interactive visual modules for these 24 methods must be integrated during Gate 4 and Gate 5.

---

`© Dr. Bhupesh Dewan, Mumbai, India — All Rights Reserved`

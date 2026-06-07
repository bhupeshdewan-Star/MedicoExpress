# Statistical Methods Catalog — ClinCommand OS™ Biostatistics Engine
## Document ID: GXP-SMC-003-V1.0

---

### 1. Descriptive Statistics

#### 1.1 Mean ($\bar{x}$)
- **Formula**: $\bar{x} = \frac{1}{n} \sum_{i=1}^{n} x_i$
- **Implementation**: Node.js fallback or Python `numpy.mean`.

#### 1.2 Median
- **Formula**: The middle value of a sorted list (or the mean of the two middle values if $n$ is even).
- **Implementation**: Node.js fallback or Python `numpy.median`.

#### 1.3 Standard Deviation ($s$) & Variance ($s^2$)
- **Formulas**: 
  - Variance: $s^2 = \frac{1}{n-1} \sum_{i=1}^{n} (x_i - \bar{x})^2$
  - Standard Deviation: $s = \sqrt{s^2}$
- **Implementation**: Node.js fallback or Python `numpy.std` / `numpy.var` with $ddof=1$ (Bessel's correction).

#### 1.4 Coefficient of Variation (CV)
- **Formula**: $CV = \frac{s}{\bar{x}}$
- **Implementation**: Node.js fallback or Python custom division.

---

### 2. Inferential Statistics

#### 2.1 Welch's Independent T-Test
- **Formula**: 
  $t = \frac{\bar{x}_1 - \bar{x}_2}{\sqrt{\frac{s_1^2}{n_1} + \frac{s_2^2}{n_2}}}$
- **Implementation**: Python `scipy.stats.ttest_ind(..., equal_var=False)`.
- **Purpose**: Compare means of two independent groups with unequal variances.

#### 2.2 Paired T-Test
- **Formula**: 
  $t = \frac{\bar{d}}{\sqrt{\frac{s_d^2}{n}}}$ (where $d_i = x_{1,i} - x_{2,i}$)
- **Implementation**: Python `scipy.stats.ttest_rel(...)`.

#### 2.3 One-Way ANOVA
- **Formula**: $F = \frac{MST}{MSE}$ (Mean Square Between / Mean Square Within)
- **Implementation**: Python `scipy.stats.f_oneway(...)`.

#### 2.4 Chi-Square Contingency Test
- **Formula**: 
  $\chi^2 = \sum \frac{(O_i - E_i)^2}{E_i}$ (with Yates' correction by default for 2x2 tables)
- **Implementation**: Python `scipy.stats.chi2_contingency(...)`.

---

### 3. Survival Analysis

#### 3.1 Kaplan-Meier Estimator
- **Formula**: 
  $\hat{S}(t) = \prod_{t_i \le t} \left(1 - \frac{d_i}{n_i}\right)$
  (where $d_i$ is death count, $n_i$ is at risk count)
- **Implementation**: Python `lifelines.KaplanMeierFitter`.
- **Outputs**: Timeline, survival probabilities, and vector SVG survival curves.

---

### 4. Regression Analysis

#### 4.1 Ordinary Least Squares (OLS) Linear Regression
- **Formula**: $y = \beta_0 + \beta_1 x + \epsilon$
- **Implementation**: Python `scipy.stats.linregress`.

#### 4.2 Logistic Regression
- **Formula**: 
  $P(y=1) = \frac{1}{1 + e^{-(\beta_0 + \beta_1 x)}}$
- **Implementation**: Python `statsmodels.api.Logit` (Maximum Likelihood Estimation).

---

`© Dr. Bhupesh Dewan, Mumbai, India — All Rights Reserved`

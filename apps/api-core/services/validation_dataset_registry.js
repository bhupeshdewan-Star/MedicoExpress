import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In-memory registry fallback if files are unreadable
const fallbackRegistry = {
  't-test': {
    method: 't-test',
    data: {
      group_a: [10.2, 11.4, 9.8, 12.1, 10.5, 11.0],
      group_b: [8.4, 9.2, 7.9, 8.8, 9.0, 8.5]
    },
    expected: {
      t_statistic: 5.602078659086616,
      p_value: 0.0005508915496195585,
      mean_difference: 2.2
    },
    tolerance: {
      t_statistic: 0.01,
      p_value: 0.001,
      mean_difference: 0.01
    }
  },
  'anova': {
    method: 'anova',
    data: {
      groups: [
        [12.1, 13.5, 11.8, 12.9],
        [10.4, 9.8, 11.2, 10.6],
        [8.5, 9.2, 8.8, 9.0]
      ]
    },
    expected: {
      f_statistic: 40.52945990180028,
      p_value: 0.00003152978369393736
    },
    tolerance: {
      f_statistic: 0.01,
      p_value: 0.001
    }
  },
  'kaplan-meier': {
    method: 'kaplan-meier',
    data: {
      durations: [10.0, 20.0, 35.0, 40.0, 50.0],
      events: [1, 0, 1, 1, 0]
    },
    expected: {
      timeline: [0, 10, 20, 35, 40, 50],
      survival_probability: [1, 0.8, 0.8, 0.5333, 0.2666, 0.2666]
    },
    tolerance: {
      survival_probability: 0.01
    }
  },
  'logistic-regression': {
    method: 'logistic-regression',
    data: {
      x: [1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0, 10.0],
      y: [0, 0, 0, 1, 0, 1, 1, 1, 1, 1]
    },
    expected: {
      intercept: -5.8246008,
      coefficient: 1.2954371,
      intercept_p_value: 0.14395251,
      coefficient_p_value: 0.12530198
    },
    tolerance: {
      intercept: 0.1,
      coefficient: 0.1,
      intercept_p_value: 0.01,
      coefficient_p_value: 0.01
    }
  },
  'chi-square': {
    method: 'chi-square',
    data: {
      table: [
        [15, 25],
        [30, 10]
      ]
    },
    expected: {
      chi2_statistic: 9.955555555555556,
      p_value: 0.0016036472624141077,
      dof: 1
    },
    tolerance: {
      chi2_statistic: 0.1,
      p_value: 0.001
    }
  }
};

/**
 * Returns the reference validation dataset for a target method.
 */
export function getDataset(method) {
  const normalizedKey = method.toLowerCase();
  
  // Try loading from filesystem
  try {
    const filePath = path.join(__dirname, '..', '..', '..', 'validation', 'statistics', `${normalizedKey.replace('-', '_')}.json`);
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }
  } catch (err) {
    console.warn(`[Dataset Registry] Failed to read JSON file from filesystem, using memory fallback: ${err.message}`);
  }
  
  return fallbackRegistry[normalizedKey] || null;
}

/**
 * Lists all registered statistical methods.
 */
export function listDatasets() {
  return Object.keys(fallbackRegistry);
}

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Enterprise Environment Configuration Manager
 */
export class EnvironmentManager {
  constructor() {
    this.currentEnv = process.env.NODE_ENV || 'development';
    this.configDir = __dirname;
  }

  /**
   * Resolves configuration for a specific target environment
   */
  resolveConfig(envName = this.currentEnv) {
    const sanitizedName = envName.toLowerCase();
    const configPath = path.resolve(this.configDir, `./${sanitizedName}.json`);

    if (!fs.existsSync(configPath)) {
      console.warn(`Environment configuration not found for '${envName}'. Falling back to 'development'.`);
      return this.loadJson('development');
    }

    return this.loadJson(sanitizedName);
  }

  /**
   * Loads config JSON file with environment overrides injected
   */
  loadJson(name) {
    const raw = fs.readFileSync(path.resolve(this.configDir, `./${name}.json`), 'utf8');
    const config = JSON.parse(raw);

    // Dynamic secret overrides from process.env if matching variables exist
    if (process.env.DB_HOST) config.database.host = process.env.DB_HOST;
    if (process.env.DB_PORT) config.database.port = parseInt(process.env.DB_PORT, 10);
    if (process.env.DB_USER) config.database.user = process.env.DB_USER;
    if (process.env.DB_NAME) config.database.name = process.env.DB_NAME;
    
    if (process.env.REDIS_HOST) config.redis.host = process.env.REDIS_HOST;
    if (process.env.REDIS_PORT) config.redis.port = parseInt(process.env.REDIS_PORT, 10);
    
    if (process.env.KMS_PROVIDER) config.kms.provider = process.env.KMS_PROVIDER;
    if (process.env.KMS_KEY_ARN) config.kms.keyArn = process.env.KMS_KEY_ARN;

    return config;
  }

  /**
   * Get active environment name
   */
  getActiveEnvironment() {
    return this.currentEnv;
  }
}

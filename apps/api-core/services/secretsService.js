import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";

/**
 * Loads secrets dynamically from AWS Secrets Manager on startup.
 * Updates the process.env context with credentials before database initialization.
 */
export async function loadSecrets() {
  const secretName = process.env.AWS_SECRET_NAME;
  if (!secretName) {
    console.log("AWS Secrets Manager: No secret name configured in AWS_SECRET_NAME. Using local environment variables.");
    return;
  }

  const region = process.env.AWS_REGION || "us-east-1";
  console.log(`AWS Secrets Manager: Loading secret ${secretName} from region ${region}...`);

  try {
    const client = new SecretsManagerClient({ region });
    const response = await client.send(
      new GetSecretValueCommand({
        SecretId: secretName,
        VersionStage: "AWSCURRENT",
      })
    );

    if (response.SecretString) {
      const secrets = JSON.parse(response.SecretString);
      // Map secrets to environment variables
      for (const [key, value] of Object.entries(secrets)) {
        process.env[key] = value;
      }
      console.log("AWS Secrets Manager: Successfully retrieved secrets and updated environment context.");
    }
  } catch (err) {
    console.error("AWS Secrets Manager Error: Failed to fetch credentials:", err.message);
    console.log("AWS Secrets Manager: Falling back to local environment variables.");
  }
}

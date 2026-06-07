// Authentication and Row-Level Security context helper SDK
export function setTenantContext(client, tenantId) {
  if (!tenantId) return client.query("RESET app.current_tenant_id");
  return client.query("SET LOCAL app.current_tenant_id = $1", [tenantId]);
}

export function generateTokenMock(user) {
  return {
    accessToken: 'mock_access_token_' + user.id,
    refreshToken: 'mock_refresh_token_' + user.id,
    expiresIn: 900 // 15 minutes
  };
}

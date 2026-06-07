import pg from 'pg';

async function testConn() {
  const hosts = ['localhost', '127.0.0.1'];
  for (const host of hosts) {
    console.log(`Trying host: ${host}...`);
    const client = new pg.Client({
      host,
      port: 5432,
      user: 'postgres',
      password: 'enterprise-secure-db-password-9988',
      database: 'clincommand'
    });
    try {
      await client.connect();
      console.log(`Successfully connected to ${host}!`);
      const res = await client.query('SELECT name FROM tenants');
      console.log('Tenants in database:', res.rows);
      await client.end();
      return;
    } catch (err) {
      console.error(`Failed to connect to ${host}:`, err.message);
    }
  }
}

testConn();

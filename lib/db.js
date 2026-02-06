// Database Connection Module
// Handles PostgreSQL database connections and queries

const { Pool } = require('pg');

let pool = null;

/**
 * Initialize database connection pool
 */
function initDB() {
  if (pool) {
    return pool;
  }

  const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.warn('⚠️  No database connection string found. Using mock data.');
    return null;
  }

  pool = new Pool({
    connectionString,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });

  pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
  });

  console.log('✅ Database connection pool initialized');
  return pool;
}

/**
 * Get database pool (initialize if needed)
 */
function getDB() {
  if (!pool) {
    return initDB();
  }
  return pool;
}

/**
 * Execute a query
 */
async function query(text, params) {
  const db = getDB();
  if (!db) {
    throw new Error('Database not configured. Set POSTGRES_URL environment variable.');
  }
  try {
    const result = await db.query(text, params);
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

/**
 * Get a single row
 */
async function queryOne(text, params) {
  const result = await query(text, params);
  return result.rows[0] || null;
}

/**
 * Get multiple rows
 */
async function queryMany(text, params) {
  const result = await query(text, params);
  return result.rows;
}

/**
 * Insert and return inserted row
 */
async function insert(table, data) {
  const keys = Object.keys(data);
  const values = Object.values(data);
  const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
  const columns = keys.join(', ');
  
  const text = `INSERT INTO ${table} (${columns}) VALUES (${placeholders}) RETURNING *`;
  return await queryOne(text, values);
}

/**
 * Update and return updated row
 */
async function update(table, id, data, idColumn = 'id') {
  const keys = Object.keys(data);
  const values = Object.values(data);
  const setClause = keys.map((key, i) => `${key} = $${i + 2}`).join(', ');
  
  const text = `UPDATE ${table} SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE ${idColumn} = $1 RETURNING *`;
  return await queryOne(text, [id, ...values]);
}

/**
 * Delete a row
 */
async function remove(table, id, idColumn = 'id') {
  const text = `DELETE FROM ${table} WHERE ${idColumn} = $1 RETURNING *`;
  return await queryOne(text, [id]);
}

/**
 * Find by ID
 */
async function findById(table, id, idColumn = 'id') {
  const text = `SELECT * FROM ${table} WHERE ${idColumn} = $1`;
  return await queryOne(text, [id]);
}

/**
 * Find all with optional conditions
 */
async function findAll(table, conditions = {}, orderBy = 'created_at DESC', limit = null, offset = null) {
  let text = `SELECT * FROM ${table}`;
  const params = [];
  let paramIndex = 1;

  if (Object.keys(conditions).length > 0) {
    const whereClause = Object.keys(conditions)
      .map(key => {
        params.push(conditions[key]);
        return `${key} = $${paramIndex++}`;
      })
      .join(' AND ');
    text += ` WHERE ${whereClause}`;
  }

  if (orderBy) {
    text += ` ORDER BY ${orderBy}`;
  }

  if (limit) {
    params.push(limit);
    text += ` LIMIT $${paramIndex++}`;
  }

  if (offset) {
    params.push(offset);
    text += ` OFFSET $${paramIndex++}`;
  }

  return await queryMany(text, params);
}

module.exports = {
  initDB,
  getDB,
  query,
  queryOne,
  queryMany,
  insert,
  update,
  remove,
  findById,
  findAll
};

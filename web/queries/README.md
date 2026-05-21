# Analytics queries

Hand-run via wrangler:

```bash
npx wrangler d1 execute tarot --remote --config wrangler.jsonc --file queries/<name>.sql
```

The reader_id_hash column is SHA-256 hex of the cookie value; raw cookie
ids never reach this table. All "unique readers" counts are unique hashes,
which is good enough for DAU/WAU/retention but cannot be reversed to
individual identities.

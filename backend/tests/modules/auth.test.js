// Auth service + middleware tests: credential validation, token signing,
// expiry, tamper detection, and the requireAuth gate (enabled + disabled).

import test from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { env } from '../../src/config/env.config.js';
import {
  authEnabled,
  validateCredentials,
  issueToken,
  verifyToken,
  bearerToken,
} from '../../src/modules/auth/auth.service.js';
import { requireAuth } from '../../src/modules/auth/auth.middleware.js';

const saved = {
  authUser: env.authUser,
  authPassword: env.authPassword,
  authTokenSecret: env.authTokenSecret,
};

test('auth is disabled (open API) until a password is configured', () => {
  env.authPassword = '';
  assert.equal(authEnabled(), false);
  assert.equal(validateCredentials('anything', 'anything'), null, 'no credentials accepted when auth is off');
});

test('validateCredentials accepts only the configured user/password', () => {
  env.authPassword = 's3cret';
  env.authUser = 'admin';
  assert.equal(authEnabled(), true);
  assert.equal(validateCredentials('admin', 's3cret'), 'admin');
  assert.equal(validateCredentials('admin', 'wrong'), null);
  assert.equal(validateCredentials('hacker', 's3cret'), null);
});

test('issueToken produces a token that verifyToken accepts', () => {
  env.authPassword = 's3cret';
  env.authTokenSecret = 'test-secret';
  const token = issueToken('admin');
  assert.equal(typeof token, 'string');
  assert.equal(token.split('.').length, 2);
  assert.equal(verifyToken(token), 'admin');
});

test('verifyToken rejects tampered, malformed, and foreign tokens', () => {
  env.authPassword = 's3cret';
  env.authTokenSecret = 'test-secret';
  const token = issueToken('admin');
  const [payload, signature] = token.split('.');
  assert.equal(verifyToken(payload + '.' + payload), null, 'signature mismatch is rejected');
  assert.equal(verifyToken('not-a-token'), null);
  assert.equal(verifyToken(undefined), null);
  assert.equal(verifyToken(null), null);
  assert.equal(verifyToken(''), null);
  assert.equal(verifyToken('a.b.c'), null);
  assert.equal(verifyToken('a.'), null);
  assert.equal(verifyToken(signature + '.' + signature), null);
});

test('verifyToken rejects an expired token', () => {
  env.authPassword = 's3cret';
  env.authTokenSecret = 'test-secret';
  // Craft a token that is already expired: payload -> signature signed as usual.
  const b64 = (s) => Buffer.from(s).toString('base64url');
  const payload = b64(JSON.stringify({ sub: 'admin', exp: Date.now() - 1000 }));
  const sig = createHmac('sha256', env.authTokenSecret).update(payload).digest('base64url');
  assert.equal(verifyToken(`${payload}.${sig}`), null);
});

test('bearerToken extracts the token from an Authorization header', () => {
  assert.equal(bearerToken('Bearer abc.def'), 'abc.def');
  assert.equal(bearerToken('Basic abc'), null);
  assert.equal(bearerToken(undefined), null);
  assert.equal(bearerToken(''), null);
});

test('requireAuth rejects requests without a valid token when auth is on', () => {
  env.authPassword = 's3cret';
  env.authTokenSecret = 'test-secret';

  const next = (err) => {
    assert.ok(err, 'requireAuth must fail closed with an error');
    assert.equal(err.status, 401);
    assert.match(err.message, /authentication required/i);
  };
  requireAuth({ headers: {} }, {}, next);

  const nextValid = (err) => assert.equal(err, undefined, 'valid token passes through');
  const token = issueToken('admin');
  requireAuth({ headers: { authorization: `Bearer ${token}` } }, {}, nextValid);
});

test('requireAuth is a no-op when auth is disabled', () => {
  env.authPassword = '';
  let passed = false;
  requireAuth({ headers: {} }, {}, (err) => {
    assert.equal(err, undefined);
    passed = true;
  });
  assert.equal(passed, true);
});

// Restore env so other suites run in their expected configuration.
test.after(() => {
  Object.assign(env, saved);
});
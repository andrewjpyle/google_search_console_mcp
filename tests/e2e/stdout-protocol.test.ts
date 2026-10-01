/**
 * stdout carries the MCP protocol. Every line the server writes there must be a JSON-RPC message;
 * a single log line on stdout can break a strict MCP client. Logs belong on stderr.
 */

import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const SERVER = path.resolve('dist/index.js');

function runInitialize(cwd: string): Promise<{ stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    const env = { ...process.env, LOG_DIR: '' };
    delete env.LOG_DIR;
    const child = spawn(process.execPath, [SERVER], { cwd, env });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (d) => (stdout += d));
    child.stderr.on('data', (d) => (stderr += d));
    child.on('error', reject);
    child.stdin.write(
      JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'test', version: '1' } },
      }) + '\n'
    );
    setTimeout(() => {
      child.kill();
      resolve({ stdout, stderr });
    }, 1500);
  });
}

describe('stdio protocol hygiene', () => {
  const cwd = mkdtempSync(path.join(tmpdir(), 'gsc-mcp-'));

  it('writes only JSON-RPC messages to stdout', async () => {
    const { stdout } = await runInitialize(cwd);
    const lines = stdout.split('\n').filter((l) => l.trim());
    expect(lines.length).toBeGreaterThan(0);
    for (const line of lines) {
      const msg = JSON.parse(line);
      expect(msg.jsonrpc).toBe('2.0');
    }
  });

  it('sends its startup log to stderr instead', async () => {
    const { stderr } = await runInitialize(cwd);
    expect(stderr).toContain('running on stdio');
  });

  it('writes no log files unless LOG_DIR is set', async () => {
    await runInitialize(cwd);
    expect(existsSync(path.join(cwd, 'logs'))).toBe(false);
  });
});

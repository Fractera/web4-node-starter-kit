// A REAL SSH SERVER FOR THE DEDICATED-SERVER TESTS (node step 737) — ssh2's own server in the test process, on 127.0.0.1, a port the
// system picks. Password login for `root` while `state.passwordAllowed`; public-key login for any user whose key is in
// `<home>/.ssh/authorized_keys` (the signature verified); every exec runs `bash -c <command>` on THIS machine with HOME=<home>.
// 🛑 Commands therefore act on this computer: a test sends only harmless ones or dry runs (`move.mjs --dry` replaces every acting one).
import { spawn } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import ssh2 from 'ssh2'

export function startTestSshServer({ home, password, hostKey = ssh2.utils.generateKeyPairSync('ed25519').private, port = 0, state = { passwordAllowed: true } }) {
  return new Promise((resolve) => {
    const server = new ssh2.Server({ hostKeys: [hostKey] }, (client) => {
      client.on('authentication', (ctx) => {
        if (ctx.method === 'password') return state.passwordAllowed && ctx.username === 'root' && ctx.password === password ? ctx.accept() : ctx.reject()
        if (ctx.method === 'publickey') {
          let lines = []
          try { lines = readFileSync(join(home, '.ssh', 'authorized_keys'), 'utf8').split('\n').filter(Boolean) } catch { /* none yet */ }
          const key = lines.map((l) => ssh2.utils.parseKey(l)).find((k) => !(k instanceof Error) && k.type === ctx.key.algo && k.getPublicSSH().equals(ctx.key.data))
          if (!key) return ctx.reject()
          if (ctx.signature) return key.verify(ctx.blob, ctx.signature, ctx.hashAlgo) === true ? ctx.accept() : ctx.reject()
          return ctx.accept()
        }
        return ctx.reject(['password', 'publickey'])
      }).on('ready', () => {
        client.on('session', (accept) => {
          const session = accept()
          session.on('pty', (ok) => ok?.())
          session.on('exec', (acceptExec, _reject, info) => {
            const stream = acceptExec()
            const child = spawn('bash', ['-c', info.command], { env: { HOME: home, PATH: process.env.PATH, ...(process.env.DRY_RUN ? { DRY_RUN: process.env.DRY_RUN } : {}) } })
            child.stdout.pipe(stream, { end: false })
            child.stderr.pipe(stream.stderr, { end: false })
            stream.on('data', (d) => child.stdin.write(d))
            child.on('close', (code) => { stream.exit(code ?? 1); stream.end() })
          })
          session.on('sftp', (acceptSftp) => sftpOnDisk(acceptSftp()))
        })
      }).on('error', () => { /* a refused or closed client */ })
    })
    server.listen(port, '127.0.0.1', () => resolve({ server, port: server.address().port, state, hostKey }))
  })
}

/** The few SFTP calls `ssh.mjs upload` makes: open for write, write, close, with the file's mode. */
async function sftpOnDisk(sftp) {
  const { openSync, writeSync, closeSync, chmodSync } = await import('node:fs')
  const { STATUS_CODE, OPEN_MODE } = ssh2.utils.sftp
  const handles = new Map()
  let next = 0
  sftp.on('OPEN', (reqid, filename, flags, attrs) => {
    if (!(flags & OPEN_MODE.WRITE)) return sftp.status(reqid, STATUS_CODE.OP_UNSUPPORTED)
    try {
      const fd = openSync(filename, 'w')
      if (attrs?.mode) chmodSync(filename, attrs.mode & 0o777)
      const h = Buffer.alloc(4)
      h.writeUInt32BE(next, 0)
      handles.set(next++, fd)
      sftp.handle(reqid, h)
    } catch { sftp.status(reqid, STATUS_CODE.FAILURE) }
  }).on('WRITE', (reqid, handle, offset, data) => {
    const fd = handles.get(handle.readUInt32BE(0))
    if (fd === undefined) return sftp.status(reqid, STATUS_CODE.FAILURE)
    writeSync(fd, data, 0, data.length, offset)
    sftp.status(reqid, STATUS_CODE.OK)
  }).on('CLOSE', (reqid, handle) => {
    const id = handle.readUInt32BE(0)
    const fd = handles.get(id)
    if (fd !== undefined) { closeSync(fd); handles.delete(id) }
    sftp.status(reqid, STATUS_CODE.OK)
  }).on('FSETSTAT', (reqid) => sftp.status(reqid, STATUS_CODE.OK))
    .on('SETSTAT', (reqid) => sftp.status(reqid, STATUS_CODE.OK))
}

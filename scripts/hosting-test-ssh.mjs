// A REAL SSH SERVER FOR THE DEDICATED-SERVER TESTS (node step 737) — ssh2's own server in the test process, on 127.0.0.1, a port the
// system picks. Password login for `root` while `state.passwordAllowed`; public-key login for any user whose key is in
// `<home>/.ssh/authorized_keys` (the signature verified); every exec runs `bash -c <command>` on THIS machine with HOME=<home>.
// 🛑 Commands therefore act on this computer: a test sends only harmless ones or dry runs (`move.mjs --dry` replaces every acting one).
// `state.commands` — every command line the «server» was asked to run (737-11a: a secret must never be among them).
import { spawn } from 'node:child_process'
import net from 'node:net'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import ssh2 from 'ssh2'
import { readableKeyPair } from '../lib/hosting/ssh.mjs'

/**
 * The key part of an `authorized_keys` line: options before it (`expiry-time="…"`, quoted values may hold spaces) are cut off the way
 * sshd reads them. 744-3: `state.legacySshd` plays an OpenSSH older than 8.2, to which `expiry-time` is unknown — the whole line is
 * dropped (the visit must then fail closed). Expiry itself is not enforced here: a real sshd proves it (probe 1 of step 744, and live).
 */
function keyPart(line, legacy) {
  if (/^(ssh-|ecdsa-|sk-)/.test(line)) return line
  let quoted = false
  for (let i = 0; i < line.length; i++) {
    if (line[i] === '"' && line[i - 1] !== '\\') quoted = !quoted
    if (line[i] === ' ' && !quoted) return legacy ? null : line.slice(i + 1).trim()
  }
  return null
}

export function startTestSshServer({ home, password, hostKey = readableKeyPair().private, port = 0, state = { passwordAllowed: true } }) {
  return new Promise((resolve) => {
    const server = new ssh2.Server({ hostKeys: [hostKey] }, (client) => {
      client.on('authentication', (ctx) => {
        // The methods left are named as sshd names them: a refused password leaves «password» on the list only while password login is on.
        if (ctx.method === 'password') {
          if (!state.passwordAllowed) return ctx.reject(['publickey'])
          return ctx.username === 'root' && ctx.password === password ? ctx.accept() : ctx.reject(['password', 'publickey'])
        }
        if (ctx.method === 'publickey') {
          let lines = []
          try { lines = readFileSync(join(home, '.ssh', 'authorized_keys'), 'utf8').split('\n').filter(Boolean) } catch { /* none yet */ }
          const key = lines.map((l) => keyPart(l, state.legacySshd)).filter(Boolean).map((l) => ssh2.utils.parseKey(l)).find((k) => !(k instanceof Error) && k.type === ctx.key.algo && k.getPublicSSH().equals(ctx.key.data))
          if (!key) return ctx.reject()
          if (ctx.signature) return key.verify(ctx.blob, ctx.signature, ctx.hashAlgo) === true ? ctx.accept() : ctx.reject()
          return ctx.accept()
        }
        return ctx.reject(['password', 'publickey'])
      }).on('ready', () => {
        // 741-5: the window's forwarding (`direct-tcpip`) — to this machine's loopback only, the way sshd connects for `ssh -L`.
        client.on('tcpip', (accept, reject, info) => {
          if (!['127.0.0.1', 'localhost', '::1'].includes(info.destIP)) return reject()
          const stream = accept()
          const sock = net.connect({ host: info.destIP === 'localhost' ? '127.0.0.1' : info.destIP, port: info.destPort })
          sock.on('error', () => stream.end())
          stream.pipe(sock).pipe(stream)
        })
        client.on('session', (accept) => {
          const session = accept()
          session.on('pty', (ok) => ok?.())
          session.on('exec', (acceptExec, _reject, info) => {
            const stream = acceptExec()
            state.commands?.push(info.command)
            // STATE_NODE_DIR (744-5): a test points `state.sh` at a «server's» own node folder (its mark), as DRY_RUN reaches the scripts
            const pass = Object.fromEntries(['DRY_RUN', 'STATE_NODE_DIR'].filter((k) => process.env[k]).map((k) => [k, process.env[k]]))
            const child = spawn('bash', ['-c', info.command], { env: { HOME: home, PATH: process.env.PATH, ...pass } })
            child.stdout.pipe(stream, { end: false })
            child.stderr.pipe(stream.stderr, { end: false })
            stream.on('data', (d) => child.stdin.write(d))
            // 737-11a: the client's end of input (a token sent on stdin) ends the command's stdin — `curl --data-binary @-` waits for it.
            stream.on('end', () => child.stdin.end())
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

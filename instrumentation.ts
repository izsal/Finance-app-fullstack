import dns from 'node:dns'

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    try {
      dns.setDefaultResultOrder('ipv4first')
    } catch {}
  }
}

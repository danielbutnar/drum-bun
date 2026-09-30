// Imported first by client code: the AI SDK defines zod schemas at import
// time, and zod probes `new Function` while building them unless jitless is
// set before. Our CSP forbids eval, so the probe would log a violation.
import {config} from 'zod'

config({jitless: true})

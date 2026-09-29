import {claim, country, place, roadSection, route, rule, source, tollProduct, zone} from './documents'
import {exchangeRate} from './exchangeRate'
import {kbSnapshot} from './kbSnapshot'
import {datedPrice, localeString, money, pendingChange, penalty, seasonWindow} from './shared'

export const schemaTypes = [
  // objects
  localeString,
  money,
  datedPrice,
  penalty,
  seasonWindow,
  pendingChange,
  // documents
  country,
  place,
  route,
  roadSection,
  tollProduct,
  rule,
  zone,
  claim,
  source,
  exchangeRate,
  kbSnapshot,
]

import {claim, country, place, roadSection, route, rule, source, tollProduct, zone} from './documents'
import {exchangeRate} from './exchangeRate'
import {datedPrice, localeString, money, penalty, seasonWindow} from './shared'

export const schemaTypes = [
  // objects
  localeString,
  money,
  datedPrice,
  penalty,
  seasonWindow,
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
]

import {defineField, defineType} from 'sanity'

import {CURRENCIES} from './shared'

// Only used to show an approximate euro total next to prices in lei or forint.
// The price the driver pays is always the one in the issuer's currency.
export const exchangeRate = defineType({
  name: 'exchangeRate',
  title: 'Exchange rate',
  type: 'document',
  fields: [
    defineField({name: 'currency', type: 'string', options: {list: CURRENCIES}, validation: (r) => r.required()}),
    defineField({
      name: 'unitsPerEur',
      type: 'number',
      description: 'How many units of this currency one euro buys (ECB reference rate).',
      validation: (r) => r.required().positive(),
    }),
    defineField({name: 'asOf', type: 'date', validation: (r) => r.required()}),
    defineField({name: 'source', type: 'reference', to: [{type: 'source'}]}),
  ],
  preview: {
    select: {currency: 'currency', rate: 'unitsPerEur', asOf: 'asOf'},
    prepare: ({currency, rate, asOf}) => ({title: `1 EUR = ${rate} ${currency}`, subtitle: asOf}),
  },
})

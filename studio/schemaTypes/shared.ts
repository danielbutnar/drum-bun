import {defineField, defineType} from 'sanity'

// Vehicle classes the planner knows. Each country maps them to its own
// category (Hungary's D1, Romania's A, ...) on the toll product itself.
export const VEHICLES = [
  {title: 'Car (up to 3.5 t)', value: 'car'},
  {title: 'Car with trailer', value: 'carTrailer'},
  {title: 'Camper (up to 3.5 t)', value: 'camper'},
  {title: 'Motorcycle', value: 'motorcycle'},
]

export const LANGUAGES = [
  {title: 'English', value: 'en'},
  {title: 'Romanian', value: 'ro'},
  {title: 'German', value: 'de'},
  {title: 'Hungarian', value: 'hu'},
]

// How far a driver should trust a source. Only "official" sources may set a
// price or a rule; the others exist so the agent can recognise what people
// read online and say why it is out of date.
export const TRUST = [
  {title: 'Official (issuer, ministry, law)', value: 'official'},
  {title: 'Automobile club', value: 'club'},
  {title: 'Press', value: 'press'},
  {title: 'Blog or travel site', value: 'blog'},
  {title: 'Forum or social post', value: 'forum'},
]

export const CURRENCIES = ['EUR', 'RON', 'HUF', 'CZK']

export const localeString = defineType({
  name: 'localeString',
  title: 'Localized text',
  type: 'object',
  description: 'The same short text in the languages a driver meets on this route.',
  fields: [
    defineField({name: 'en', title: 'English', type: 'string', validation: (r) => r.required()}),
    defineField({name: 'ro', title: 'Romanian', type: 'string'}),
    defineField({name: 'de', title: 'German', type: 'string'}),
    defineField({name: 'hu', title: 'Hungarian', type: 'string'}),
  ],
})

export const money = defineType({
  name: 'money',
  title: 'Amount',
  type: 'object',
  fields: [
    defineField({name: 'amount', type: 'number', validation: (r) => r.required().min(0)}),
    defineField({
      name: 'currency',
      type: 'string',
      options: {list: CURRENCIES},
      validation: (r) => r.required(),
    }),
  ],
  preview: {
    select: {amount: 'amount', currency: 'currency'},
    prepare: ({amount, currency}) => ({title: `${amount ?? '?'} ${currency ?? ''}`}),
  },
})

export const datedPrice = defineType({
  name: 'datedPrice',
  title: 'Price for a period',
  type: 'object',
  description:
    'A price is only true between validFrom and validTo. The planner picks the price whose period contains the travel date, so a trip that crosses 1 January uses both years.',
  fields: [
    defineField({name: 'amount', type: 'number', validation: (r) => r.required().min(0)}),
    defineField({
      name: 'currency',
      type: 'string',
      options: {list: CURRENCIES},
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'validFrom',
      type: 'date',
      description: 'First day this price applies (inclusive).',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'validTo',
      type: 'date',
      description: 'Last day this price applies (inclusive). Empty = until further notice.',
    }),
    defineField({
      name: 'status',
      type: 'string',
      options: {
        list: [
          {title: 'Published by the issuer', value: 'official'},
          {title: 'Announced, not yet on sale', value: 'announced'},
        ],
        layout: 'radio',
      },
      initialValue: 'official',
    }),
    defineField({
      name: 'band',
      title: 'Emission band',
      type: 'object',
      description:
        'Only for prices that depend on the car’s emissions (Romania from 1 Oct 2026). Leave empty when one price fits every car.',
      options: {collapsible: true, collapsed: true},
      fields: [
        defineField({name: 'label', type: 'string', description: 'e.g. "Euro IV–V".'}),
        defineField({name: 'electric', type: 'boolean', description: 'This band is for electric cars only.'}),
        defineField({name: 'euroMin', type: 'number', description: 'Lowest Euro class in the band (0–6).'}),
        defineField({name: 'euroMax', type: 'number', description: 'Highest Euro class in the band (0–6).'}),
        defineField({
          name: 'appliesWhenUnknown',
          type: 'boolean',
          description: 'The issuer charges this band when the Euro class cannot be shown.',
        }),
      ],
    }),
    defineField({name: 'source', type: 'reference', to: [{type: 'source'}]}),
  ],
  preview: {
    select: {amount: 'amount', currency: 'currency', from: 'validFrom', to: 'validTo', band: 'band.label'},
    prepare: ({amount, currency, from, to, band}) => ({
      title: `${amount} ${currency}${band ? ` (${band})` : ''}`,
      subtitle: `${from ?? '?'} → ${to ?? 'open'}`,
    }),
  },
})

export const pendingChange = defineType({
  name: 'pendingChange',
  title: 'Pending change',
  type: 'object',
  description:
    'A proposal that could change this fact but is not law yet (e.g. a bill in parliament). The agent mentions it; the planner ignores it.',
  fields: [
    defineField({name: 'summary', type: 'text', rows: 2, validation: (r) => r.required()}),
    defineField({name: 'wouldTakeEffect', type: 'date'}),
    defineField({name: 'checkAgainBy', type: 'date', description: 'When an editor should look again.'}),
    defineField({name: 'source', type: 'reference', to: [{type: 'source'}]}),
  ],
})

export const penalty = defineType({
  name: 'penalty',
  title: 'Penalty',
  type: 'object',
  fields: [
    defineField({name: 'min', type: 'number', description: 'Lowest fine or surcharge.'}),
    defineField({name: 'max', type: 'number', description: 'Highest fine or surcharge.'}),
    defineField({name: 'currency', type: 'string', options: {list: CURRENCIES}}),
    defineField({name: 'points', type: 'number', description: 'Penalty points, if any.'}),
    defineField({name: 'note', type: 'text', rows: 2}),
    defineField({name: 'source', type: 'reference', to: [{type: 'source'}]}),
  ],
})

export const seasonWindow = defineType({
  name: 'seasonWindow',
  title: 'Season',
  type: 'object',
  description: 'A window that repeats every year, e.g. 11-01 to 04-15. It may wrap over New Year.',
  fields: [
    defineField({
      name: 'from',
      type: 'string',
      description: 'MM-DD',
      validation: (r) => r.required().regex(/^\d{2}-\d{2}$/),
    }),
    defineField({
      name: 'to',
      type: 'string',
      description: 'MM-DD',
      validation: (r) => r.required().regex(/^\d{2}-\d{2}$/),
    }),
  ],
})

export const sourcesField = defineField({
  name: 'sources',
  title: 'Sources',
  type: 'array',
  description: 'Every fact on this document must be backed by at least one official source.',
  of: [{type: 'reference', to: [{type: 'source'}]}],
  validation: (r) => r.required().min(1),
})

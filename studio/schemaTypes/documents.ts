import {defineArrayMember, defineField, defineType} from 'sanity'

import {LANGUAGES, TRUST, VEHICLES, sourcesField} from './shared'

export const country = defineType({
  name: 'country',
  title: 'Country',
  type: 'document',
  fields: [
    defineField({
      name: 'code',
      type: 'string',
      description: 'ISO 3166-1 alpha-2, e.g. RO, HU, AT, DE.',
      validation: (r) => r.required().uppercase().length(2),
    }),
    defineField({name: 'name', type: 'localeString', validation: (r) => r.required()}),
    defineField({name: 'currency', type: 'string', validation: (r) => r.required()}),
    defineField({
      name: 'carTollSummary',
      type: 'text',
      rows: 3,
      description: 'One or two sentences: what a private car pays on motorways in this country.',
    }),
    sourcesField,
  ],
  preview: {select: {title: 'name.en', subtitle: 'code'}},
})

export const source = defineType({
  name: 'source',
  title: 'Source',
  type: 'document',
  description:
    'A page a fact comes from, or a page drivers read that says something else. Trust decides which one wins.',
  fields: [
    defineField({name: 'title', type: 'string', validation: (r) => r.required()}),
    defineField({
      name: 'url',
      type: 'url',
      validation: (r) => r.required().uri({scheme: ['https', 'http']}),
    }),
    defineField({name: 'publisher', type: 'string', description: 'e.g. ASFINAG, CNAIR, Umweltbundesamt.'}),
    defineField({
      name: 'language',
      type: 'string',
      options: {list: LANGUAGES, layout: 'radio', direction: 'horizontal'},
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'trust',
      type: 'string',
      options: {list: TRUST, layout: 'radio'},
      validation: (r) => r.required(),
    }),
    defineField({name: 'pageDate', type: 'date', description: 'Date printed on the page, if any.'}),
    defineField({
      name: 'checkedAt',
      type: 'date',
      description: 'When a person last read this page and confirmed the facts that cite it.',
      validation: (r) => r.required(),
    }),
    defineField({name: 'country', type: 'reference', to: [{type: 'country'}]}),
    defineField({name: 'notes', type: 'text', rows: 2}),
  ],
  preview: {
    select: {title: 'title', trust: 'trust', language: 'language', publisher: 'publisher'},
    prepare: ({title, trust, language, publisher}) => ({
      title,
      subtitle: [trust, language?.toUpperCase(), publisher].filter(Boolean).join(' · '),
    }),
  },
})

export const place = defineType({
  name: 'place',
  title: 'Place',
  type: 'document',
  description: 'A city a trip starts or ends in, or a border crossing.',
  fields: [
    defineField({name: 'name', type: 'localeString', validation: (r) => r.required()}),
    defineField({
      name: 'slug',
      type: 'slug',
      options: {source: 'name.en'},
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'kind',
      type: 'string',
      options: {list: ['city', 'border'], layout: 'radio', direction: 'horizontal'},
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'country',
      type: 'reference',
      to: [{type: 'country'}],
      description: 'For a border crossing: the country you leave.',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'countryAfter',
      type: 'reference',
      to: [{type: 'country'}],
      hidden: ({parent}) => parent?.kind !== 'border',
      description: 'The country you enter at this crossing.',
    }),
    defineField({name: 'location', type: 'geopoint'}),
  ],
  preview: {select: {title: 'name.en', subtitle: 'kind'}},
})

export const roadSection = defineType({
  name: 'roadSection',
  title: 'Road section',
  type: 'document',
  description:
    'A stretch of road on a route. Whether it is tolled, and by which products, is data here, not prose.',
  fields: [
    defineField({name: 'country', type: 'reference', to: [{type: 'country'}], validation: (r) => r.required()}),
    defineField({name: 'road', type: 'string', description: 'e.g. M43, A1, A8.', validation: (r) => r.required()}),
    defineField({name: 'from', type: 'string', validation: (r) => r.required()}),
    defineField({name: 'to', type: 'string', validation: (r) => r.required()}),
    defineField({name: 'lengthKm', type: 'number'}),
    defineField({
      name: 'tolled',
      type: 'boolean',
      description: 'False for sections a car may use without any vignette or toll.',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'coveredBy',
      title: 'Covered by',
      type: 'array',
      description: 'Toll products that make this section legal to drive. Any one of them is enough.',
      of: [defineArrayMember({type: 'reference', to: [{type: 'tollProduct'}]})],
      hidden: ({parent}) => parent?.tolled === false,
    }),
    defineField({
      name: 'counties',
      type: 'array',
      of: [{type: 'string'}],
      description: 'Hungary only: the counties this section runs through (for county vignettes).',
    }),
    defineField({
      name: 'exemptVehicles',
      type: 'array',
      of: [{type: 'string'}],
      options: {list: VEHICLES},
      description: 'Vehicle classes that owe nothing on this section (e.g. motorcycles on Romanian national roads).',
    }),
    defineField({name: 'exemptNote', type: 'text', rows: 2, hidden: ({parent}) => !parent?.exemptVehicles?.length}),
    defineField({name: 'note', type: 'text', rows: 2}),
    sourcesField,
  ],
  preview: {
    select: {road: 'road', from: 'from', to: 'to', tolled: 'tolled', country: 'country.code'},
    prepare: ({road, from, to, tolled, country}) => ({
      title: `${road}: ${from} → ${to}`,
      subtitle: `${country ?? ''} · ${tolled ? 'tolled' : 'toll-free'}`,
    }),
  },
})

export const route = defineType({
  name: 'route',
  title: 'Route',
  type: 'document',
  description: 'An ordered list of legs. The planner walks the legs to know which countries and sections a trip uses.',
  fields: [
    defineField({name: 'title', type: 'string', validation: (r) => r.required()}),
    defineField({name: 'origin', type: 'reference', to: [{type: 'place'}], validation: (r) => r.required()}),
    defineField({name: 'destination', type: 'reference', to: [{type: 'place'}], validation: (r) => r.required()}),
    defineField({
      name: 'legs',
      type: 'array',
      validation: (r) => r.required().min(1),
      of: [
        defineArrayMember({
          type: 'object',
          name: 'leg',
          fields: [
            defineField({name: 'country', type: 'reference', to: [{type: 'country'}], validation: (r) => r.required()}),
            defineField({
              name: 'sections',
              type: 'array',
              of: [defineArrayMember({type: 'reference', to: [{type: 'roadSection'}]})],
            }),
            defineField({name: 'km', type: 'number', description: 'Approximate driving distance in this country.'}),
            defineField({
              name: 'exitBorder',
              type: 'reference',
              to: [{type: 'place'}],
              options: {filter: 'kind == "border"'},
              description: 'Where this leg leaves the country. Empty on the last leg.',
            }),
          ],
          preview: {
            select: {country: 'country.code', km: 'km', border: 'exitBorder.name.en'},
            prepare: ({country, km, border}) => ({
              title: `${country ?? '?'} · ${km ?? '?'} km`,
              subtitle: border ? `exit: ${border}` : 'destination',
            }),
          },
        }),
      ],
    }),
    defineField({name: 'totalKm', type: 'number'}),
    defineField({name: 'note', type: 'text', rows: 2}),
  ],
})

export const tollProduct = defineType({
  name: 'tollProduct',
  title: 'Toll product',
  type: 'document',
  description:
    'Something a driver buys to use a road legally: a vignette, a county vignette or a section toll. Prices are dated.',
  fields: [
    defineField({name: 'country', type: 'reference', to: [{type: 'country'}], validation: (r) => r.required()}),
    defineField({name: 'name', type: 'localeString', validation: (r) => r.required()}),
    defineField({
      name: 'kind',
      type: 'string',
      options: {
        list: [
          {title: 'Vignette for the whole network', value: 'vignette'},
          {title: 'County vignette (Hungary)', value: 'countyVignette'},
          {title: 'Section toll (one road, one passage)', value: 'sectionToll'},
        ],
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'vehicles',
      type: 'array',
      of: [{type: 'string'}],
      options: {list: VEHICLES},
      description: 'Vehicle classes this product is valid for.',
      validation: (r) => r.required().min(1),
    }),
    defineField({
      name: 'localCategory',
      type: 'string',
      description: 'The issuer’s own category code, e.g. D1 in Hungary, A in Romania.',
    }),
    defineField({
      name: 'county',
      type: 'string',
      hidden: ({parent}) => parent?.kind !== 'countyVignette',
    }),
    defineField({
      name: 'validity',
      type: 'object',
      validation: (r) => r.required(),
      fields: [
        defineField({
          name: 'unit',
          type: 'string',
          options: {
            list: [
              {title: 'N consecutive calendar days, start day included', value: 'days'},
              {title: 'N months, to the same calendar day', value: 'months'},
              {title: 'Calendar year with overlap windows', value: 'calendarYear'},
              {title: 'One passage', value: 'passage'},
            ],
          },
          validation: (r) => r.required(),
        }),
        defineField({name: 'count', type: 'number', description: 'N for days or months.'}),
        defineField({
          name: 'yearStartsPrevious',
          type: 'string',
          description: 'calendarYear only: MM-DD in the previous year when it becomes valid (e.g. 12-01).',
        }),
        defineField({
          name: 'yearEndsNext',
          type: 'string',
          description: 'calendarYear only: MM-DD in the following year when it stops being valid (e.g. 01-31).',
        }),
        defineField({
          name: 'wording',
          type: 'text',
          rows: 2,
          description: 'The issuer’s own wording of the validity rule, translated.',
        }),
      ],
    }),
    defineField({
      name: 'prices',
      type: 'array',
      of: [defineArrayMember({type: 'datedPrice'})],
      validation: (r) => r.required().min(1),
    }),
    defineField({
      name: 'activation',
      type: 'object',
      description: 'When a purchase starts to count. Austria’s 18-day rule lives here.',
      fields: [
        defineField({
          name: 'onlineDelayDays',
          type: 'number',
          description: 'Days before a consumer’s online purchase becomes valid. 0 or empty = immediately.',
        }),
        defineField({name: 'delayAppliesTo', type: 'text', rows: 2}),
        defineField({name: 'immediateOptions', type: 'text', rows: 2, description: 'How to get it valid at once.'}),
      ],
    }),
    defineField({
      name: 'purchase',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'purchaseChannel',
          fields: [
            defineField({
              name: 'channel',
              type: 'string',
              options: {list: ['officialWeb', 'officialApp', 'retail', 'borderPoint']},
            }),
            defineField({name: 'label', type: 'string'}),
            defineField({name: 'url', type: 'url'}),
          ],
        }),
      ],
    }),
    defineField({name: 'plateBound', type: 'boolean', description: 'Tied to the licence plate (digital).'}),
    defineField({name: 'summary', type: 'text', rows: 3, description: 'Plain-language summary for people and agents.'}),
    defineField({name: 'penalty', type: 'penalty', description: 'What happens without it.'}),
    defineField({
      name: 'pendingChanges',
      type: 'array',
      of: [defineArrayMember({type: 'pendingChange'})],
      description: 'Proposals that are not law yet. Shown as a caveat, never used for a price.',
    }),
    sourcesField,
  ],
  preview: {
    select: {title: 'name.en', country: 'country.code', category: 'localCategory'},
    prepare: ({title, country, category}) => ({
      title,
      subtitle: [country, category].filter(Boolean).join(' · '),
    }),
  },
})

const RULE_TOPICS = [
  {title: 'Winter tyres', value: 'winterTyres'},
  {title: 'Snow chains', value: 'snowChains'},
  {title: 'Mandatory equipment', value: 'equipment'},
  {title: 'Lights', value: 'lights'},
  {title: 'Alcohol', value: 'alcohol'},
  {title: 'Emergency corridor', value: 'emergencyCorridor'},
  {title: 'Speed', value: 'speed'},
  {title: 'Vignette and toll handling', value: 'tollHandling'},
  {title: 'Border', value: 'border'},
  {title: 'Other', value: 'other'},
]

export const rule = defineType({
  name: 'rule',
  title: 'Road rule',
  type: 'document',
  description: 'A rule a foreign driver must follow. Seasonal and conditional rules carry their window as data.',
  fields: [
    defineField({name: 'country', type: 'reference', to: [{type: 'country'}], validation: (r) => r.required()}),
    defineField({name: 'topic', type: 'string', options: {list: RULE_TOPICS}, validation: (r) => r.required()}),
    defineField({name: 'title', type: 'string', validation: (r) => r.required()}),
    defineField({name: 'requirement', type: 'text', rows: 3, validation: (r) => r.required()}),
    defineField({
      name: 'vehicles',
      type: 'array',
      of: [{type: 'string'}],
      options: {list: VEHICLES},
      validation: (r) => r.required().min(1),
    }),
    defineField({name: 'season', type: 'seasonWindow', description: 'Empty = all year.'}),
    defineField({
      name: 'conditional',
      type: 'boolean',
      description: 'True when the rule only bites under a condition (snow, ice, a sign).',
    }),
    defineField({name: 'condition', type: 'text', rows: 2, hidden: ({parent}) => !parent?.conditional}),
    defineField({name: 'effectiveFrom', type: 'date'}),
    defineField({name: 'effectiveTo', type: 'date'}),
    defineField({
      name: 'severity',
      type: 'string',
      options: {
        list: [
          {title: 'Critical: fine or refused entry', value: 'critical'},
          {title: 'Important', value: 'important'},
          {title: 'Good to know', value: 'info'},
        ],
        layout: 'radio',
      },
      validation: (r) => r.required(),
    }),
    defineField({name: 'penalty', type: 'penalty'}),
    defineField({
      name: 'pendingChanges',
      type: 'array',
      of: [defineArrayMember({type: 'pendingChange'})],
      description: 'Proposals that are not law yet. Shown as a caveat, never used for a price.',
    }),
    sourcesField,
  ],
  preview: {
    select: {title: 'title', country: 'country.code', topic: 'topic', severity: 'severity'},
    prepare: ({title, country, topic, severity}) => ({
      title,
      subtitle: [country, topic, severity].filter(Boolean).join(' · '),
    }),
  },
})

export const zone = defineType({
  name: 'zone',
  title: 'Low-emission zone or driving ban',
  type: 'document',
  fields: [
    defineField({name: 'title', type: 'string', validation: (r) => r.required()}),
    defineField({name: 'city', type: 'reference', to: [{type: 'place'}], validation: (r) => r.required()}),
    defineField({
      name: 'kind',
      type: 'string',
      options: {
        list: [
          {title: 'Low-emission zone (sticker)', value: 'lowEmissionZone'},
          {title: 'Diesel driving ban', value: 'dieselBan'},
        ],
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'status',
      type: 'string',
      options: {list: ['active', 'announced', 'suspended', 'abolished'], layout: 'radio', direction: 'horizontal'},
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'requiredSticker',
      type: 'string',
      options: {list: ['green', 'yellow', 'red']},
      hidden: ({parent}) => parent?.kind !== 'lowEmissionZone',
    }),
    defineField({
      name: 'dieselMinEuro',
      type: 'number',
      description: 'Lowest Euro norm a diesel may have to enter. Empty = no extra diesel rule.',
    }),
    defineField({name: 'petrolMinEuro', type: 'number'}),
    defineField({name: 'area', type: 'text', rows: 2}),
    defineField({name: 'effectiveFrom', type: 'date'}),
    defineField({name: 'effectiveTo', type: 'date'}),
    defineField({
      name: 'howToComply',
      type: 'text',
      rows: 3,
      description: 'Where a foreign driver gets the sticker, what it costs, how long delivery takes.',
    }),
    defineField({name: 'penalty', type: 'penalty'}),
    defineField({
      name: 'pendingChanges',
      type: 'array',
      of: [defineArrayMember({type: 'pendingChange'})],
      description: 'Proposals that are not law yet. Shown as a caveat, never used for a price.',
    }),
    sourcesField,
  ],
})

export const claim = defineType({
  name: 'claim',
  title: 'Claim seen online',
  type: 'document',
  description:
    'Something drivers read on a blog, forum or old news page. The verdict and the facts that correct it are data, so the agent can warn before a driver acts on it.',
  fields: [
    defineField({name: 'statement', type: 'text', rows: 2, validation: (r) => r.required()}),
    defineField({
      name: 'quote',
      type: 'string',
      description: 'A short quote (under 15 words) from the page.',
      validation: (r) => r.max(160),
    }),
    defineField({name: 'seenOn', type: 'reference', to: [{type: 'source'}], validation: (r) => r.required()}),
    defineField({name: 'country', type: 'reference', to: [{type: 'country'}]}),
    defineField({
      name: 'verdict',
      type: 'string',
      options: {
        list: [
          {title: 'Was true, now outdated', value: 'outdated'},
          {title: 'Never true', value: 'wrong'},
          {title: 'True but misleading', value: 'misleading'},
          {title: 'Still true', value: 'current'},
        ],
        layout: 'radio',
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'correctedBy',
      type: 'array',
      description: 'The structured facts that show what is true now.',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{type: 'tollProduct'}, {type: 'rule'}, {type: 'zone'}, {type: 'roadSection'}],
        }),
      ],
    }),
    defineField({name: 'explanation', type: 'text', rows: 3, validation: (r) => r.required()}),
    defineField({name: 'decidedAt', type: 'date'}),
  ],
  preview: {
    select: {title: 'statement', verdict: 'verdict', seenOn: 'seenOn.title'},
    prepare: ({title, verdict, seenOn}) => ({title, subtitle: `${verdict ?? '?'} · ${seenOn ?? ''}`}),
  },
})

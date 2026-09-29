import {defineArrayMember, defineField, defineType} from 'sanity'

// A read-only copy of the Knowledge Base's state (outline, issues and the
// decisions taken on them, standing instructions), written by
// scripts/kb.ts snapshot. The public site renders it, so visitors can see
// how the Knowledge Base was reconciled without an organization token.
export const kbSnapshot = defineType({
  name: 'kbSnapshot',
  title: 'Knowledge Base snapshot',
  type: 'document',
  readOnly: true,
  fields: [
    defineField({name: 'takenAt', type: 'datetime'}),
    defineField({name: 'knowledgeBaseId', type: 'string'}),
    defineField({name: 'sourceCounts', type: 'object', fields: [
      defineField({name: 'dataset', type: 'number'}),
      defineField({name: 'web', type: 'number'}),
    ]}),
    defineField({
      name: 'entries',
      type: 'array',
      of: [defineArrayMember({type: 'object', name: 'kbEntry', fields: [
        defineField({name: 'path', type: 'string'}),
        defineField({name: 'title', type: 'string'}),
        defineField({name: 'tldr', type: 'text'}),
      ]})],
    }),
    defineField({
      name: 'issues',
      type: 'array',
      of: [defineArrayMember({type: 'object', name: 'kbIssue', fields: [
        defineField({name: 'issueId', type: 'string'}),
        defineField({name: 'kind', type: 'string'}),
        defineField({name: 'severity', type: 'string'}),
        defineField({name: 'scope', type: 'string'}),
        defineField({name: 'text', type: 'text'}),
        defineField({name: 'status', type: 'string'}),
        defineField({name: 'decision', type: 'text'}),
        defineField({name: 'sides', type: 'array', of: [defineArrayMember({type: 'object', name: 'kbSide', fields: [
          defineField({name: 'claim', type: 'text'}),
          defineField({name: 'value', type: 'string'}),
          defineField({name: 'authority', type: 'string'}),
          defineField({name: 'sourceCount', type: 'number'}),
          defineField({name: 'chosen', type: 'boolean'}),
        ]})]}),
      ]})],
    }),
    defineField({
      name: 'instructions',
      type: 'array',
      of: [defineArrayMember({type: 'object', name: 'kbInstruction', fields: [
        defineField({name: 'statement', type: 'text'}),
        defineField({name: 'origin', type: 'string'}),
        defineField({name: 'status', type: 'string'}),
      ]})],
    }),
  ],
  preview: {select: {title: 'takenAt'}, prepare: ({title}) => ({title: `Knowledge Base snapshot ${title ?? ''}`})},
})

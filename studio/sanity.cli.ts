import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {projectId: 'pd5e7gez', dataset: 'production'},
  studioHost: 'drum-bun',
  deployment: {autoUpdates: true},
})

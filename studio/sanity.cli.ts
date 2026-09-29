import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {projectId: 'pd5e7gez', dataset: 'production'},
  studioHost: 'drum-bun',
  deployment: {appId: 'webrh6kh8axydct739w4dhhg', autoUpdates: true},
})

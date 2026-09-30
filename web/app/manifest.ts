import type {MetadataRoute} from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Drum Bun',
    short_name: 'Drum Bun',
    description: 'Vignettes, tolls and road rules between Romania and Germany or Austria, priced for your dates.',
    start_url: '/',
    display: 'browser',
    background_color: '#eef1ea',
    theme_color: '#c8372d',
    icons: [{src: '/favicon.ico', sizes: 'any', type: 'image/x-icon'}],
  }
}

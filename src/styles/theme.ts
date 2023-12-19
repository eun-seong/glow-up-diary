import resolveConfig from 'tailwindcss/resolveConfig'
import tailwindConfig from '../../tailwind.config.js'
import { Colors } from './types'

const config = resolveConfig(tailwindConfig)
const colors = config?.theme?.colors as Colors

export { colors }

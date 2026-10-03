import { App as Comparison } from '../popup/App'

/** The comparison panel is public. Legacy account/chat components remain unbundled. */
export function App() {
  return <Comparison sidePanel />
}

import type { Metadata } from 'next'
import PipelineLog from '@/components/PipelineLog'

export const metadata: Metadata = {
  title: 'Pipeline — PIPELINE',
}

export default function PipelinePage() {
  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="pt-2">
        <h1 className="font-serif text-3xl italic text-white">Pipeline</h1>
        <p className="font-mono text-xs text-muted mt-1">Every lead. Every conversation.</p>
      </div>
      <PipelineLog />
    </div>
  )
}

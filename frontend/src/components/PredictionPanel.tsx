import { AlertTriangle, ArrowDownRight, ArrowUpRight, BrainCircuit } from 'lucide-react'
import type { Prediction } from '../types/twin'

function percentage(value: number) {
  return `${Math.round(value * 100)}%`
}

export function PredictionPanel({ prediction }: { prediction: Prediction | null }) {
  if (!prediction) {
    return (
      <div className="prediction-empty">
        <BrainCircuit size={28} />
        <h3>No prediction yet</h3>
        <p>Refresh the model after enough CGM history has arrived.</p>
      </div>
    )
  }

  if (prediction.status !== 'available' || prediction.modelScore === null) {
    return (
      <div className="prediction-empty warning-state">
        <AlertTriangle size={28} />
        <h3>{prediction.status === 'insufficient_data' ? 'More sensor history needed' : 'Prediction unavailable'}</h3>
        <p>{prediction.warnings[0] ?? 'Try again when the model service is available.'}</p>
      </div>
    )
  }

  return (
    <div className="prediction-content">
      <div className="risk-summary">
        <div className="score-ring">
          <strong>{percentage(prediction.modelScore)}</strong>
          <span>model score</span>
        </div>
        <div>
          <span className="score-label">Uncalibrated research output</span>
          <h3>Glucose event in the next {prediction.predictionWindowMinutes / 60} hours</h3>
          <p>{prediction.targetDefinition}</p>
        </div>
      </div>
      <div className="factors">
        <div className="section-kicker">What influenced this estimate</div>
        {prediction.topFactors.slice(0, 4).map((factor) => (
          <div className="factor" key={factor.feature}>
            <span className={`factor-icon ${factor.direction}`}>
              {factor.direction === 'higher' ? <ArrowUpRight size={15} /> : <ArrowDownRight size={15} />}
            </span>
            <span>{factor.displayName}</span>
            <small>moves the score {factor.direction}</small>
          </div>
        ))}
      </div>
      <div className="model-note">Model {prediction.modelVersion} · this score is not a calibrated clinical probability or medical advice</div>
    </div>
  )
}

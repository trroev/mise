export type StepProgressIndicatorProps = {
  completed: number
  total: number
}

export const StepProgressIndicator = ({
  completed,
  total,
}: StepProgressIndicatorProps): React.ReactElement => (
  <p
    aria-live="polite"
    className="font-sans text-body-sm text-text-muted tabular-nums"
  >
    <span aria-hidden="true">{`${completed} / ${total} steps`}</span>
    <span className="sr-only">{`${completed} of ${total} steps complete`}</span>
  </p>
)

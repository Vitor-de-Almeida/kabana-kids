type FieldErrorProps = {
  id: string
  messages?: string[]
}

// Mostra o primeiro erro que a API devolveu para o campo
export function FieldError({ id, messages }: FieldErrorProps) {
  if (!messages?.length) {
    return null
  }

  return (
    <p id={id} className="mt-2 text-sm font-semibold text-lilas-700">
      {messages[0]}
    </p>
  )
}

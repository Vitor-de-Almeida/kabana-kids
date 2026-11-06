// Logs em JSON, um evento por linha (D23).
// Só IDs e dados técnicos: nunca dados pessoais.
type LogFields = Record<string, string | number | boolean | null>

function write(level: "info" | "error", event: string, fields: LogFields): void {
  const line = JSON.stringify({ time: new Date().toISOString(), level, event, ...fields })

  if (level === "error") {
    console.error(line)
  } else {
    console.log(line)
  }
}

export const logger = {
  info: (event: string, fields: LogFields = {}): void => write("info", event, fields),
  error: (event: string, fields: LogFields = {}): void => write("error", event, fields),
}

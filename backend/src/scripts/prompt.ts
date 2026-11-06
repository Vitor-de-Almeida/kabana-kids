import { createInterface } from "node:readline/promises"

export async function ask(question: string): Promise<string> {
  const reader = createInterface({ input: process.stdin, output: process.stdout })
  const answer = await reader.question(question)
  reader.close()
  return answer
}

const ENTER = new Set(["\r", "\n"])
const BACKSPACE = new Set(["\u007f", "\b"])
const CTRL_C = "\u0003"

// Lê sem mostrar na tela: a senha não fica visível
export function askHidden(question: string): Promise<string> {
  const stdin = process.stdin
  if (!stdin.isTTY) {
    throw new Error("Rode este comando num terminal interativo")
  }

  process.stdout.write(question)
  stdin.setRawMode(true)
  stdin.setEncoding("utf8")
  stdin.resume()

  return new Promise((resolve) => {
    let value = ""

    const onData = (chunk: string) => {
      for (const char of chunk) {
        if (char === CTRL_C) {
          process.exit(1)
        }
        if (ENTER.has(char)) {
          stdin.setRawMode(false)
          stdin.pause()
          stdin.off("data", onData)
          process.stdout.write("\n")
          resolve(value)
          return
        }
        value = BACKSPACE.has(char) ? value.slice(0, -1) : value + char
      }
    }

    stdin.on("data", onData)
  })
}

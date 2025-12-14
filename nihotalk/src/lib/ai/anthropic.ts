import Anthropic from '@anthropic-ai/sdk'

let anthropicClient: Anthropic | null = null

export function getAnthropicClient(): Anthropic {
  if (!anthropicClient) {
    anthropicClient = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    })
  }
  return anthropicClient
}

// Anthropic alternatives for AI functions - can be used interchangeably with OpenAI versions
// The interface is the same, so we can switch between providers easily


import { type NextRequest, NextResponse } from "next/server"

// Add this mock summarization function
function getMockSummary(content: string) {
  // Create a simplified summary based on the content length
  const words = content.split(/\s+/)

  if (words.length <= 30) {
    return content // Content is already short
  }

  // For longer content, create a generic summary
  if (content.includes("http") || content.startsWith("www.")) {
    // It's a URL
    return "This appears to be an article discussing current events or information. The content likely covers key points related to the topic, provides some background context, and may include quotes from relevant sources or experts. Without access to the full content due to API limitations, I can't provide specific details, but the article seems to be informative in nature."
  } else {
    // It's text content
    // Extract first and last sentences for a basic summary
    const sentences = content.match(/[^.!?]+[.!?]+/g) || []

    if (sentences.length <= 3) {
      return content // Already concise
    }

    const firstSentence = sentences[0].trim()
    const lastSentence = sentences[sentences.length - 1].trim()

    return `${firstSentence} ${lastSentence} This summary is generated in offline mode due to API limitations. In normal operation, I would provide a more detailed and accurate summary of the content.`
  }
}

export async function POST(request: NextRequest) {
  try {
    const { inputType, content, apiKey } = await request.json()

    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 })
    }

    // If no API key is provided, use mock summary
    if (!apiKey) {
      console.log("No API key provided, using mock summary")
      return NextResponse.json({
        summary: getMockSummary(content),
        _notice: "Using simulated summary due to missing API key",
      })
    }

    let textToSummarize = content

    // If input is a URL, fetch the content first
    if (inputType === "url") {
      try {
        // Use a proxy service to avoid CORS issues
        const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(content)}`)

        if (!response.ok) {
          throw new Error(`Failed to fetch URL content: ${response.status}`)
        }

        const data = await response.json()

        if (!data.contents) {
          throw new Error("Failed to extract content from URL")
        }

        // Simple text extraction from HTML
        textToSummarize = data.contents
          .replace(/<[^>]*>/g, " ") // Remove HTML tags
          .replace(/\s+/g, " ") // Normalize whitespace
          .trim()
      } catch (error) {
        console.error("Error fetching URL content:", error)
        return NextResponse.json({
          summary: getMockSummary(content),
          _notice: "Failed to fetch content from URL, using simulated summary",
        })
      }
    }

    // Truncate text if it's too long (OpenAI has token limits)
    if (textToSummarize.length > 15000) {
      textToSummarize = textToSummarize.substring(0, 15000) + "..."
    }

    try {
      // Call OpenAI API for summarization
      const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content:
                "You are a helpful assistant that summarizes content. Provide a concise summary that captures the main points.",
            },
            {
              role: "user",
              content: `Please summarize the following text in a concise way, highlighting the key points and main ideas:

${textToSummarize}`,
            },
          ],
          max_tokens: 500,
          temperature: 0.5,
        }),
      })

      if (!openaiResponse.ok) {
        const errorData = await openaiResponse.json()
        console.error("OpenAI API error:", errorData)

        // Return mock summary for API key errors
        if (errorData.error?.code === "invalid_api_key" || openaiResponse.status === 401) {
          return NextResponse.json({
            summary: getMockSummary(content),
            _notice: "Using simulated summary due to API key issues",
          })
        }

        return NextResponse.json({
          summary: "I'm having trouble summarizing this content right now. Please try again later.",
          _notice: "API error occurred",
        })
      }

      const openaiData = await openaiResponse.json()
      const summary = openaiData.choices[0].message.content.trim()

      return NextResponse.json({ summary })
    } catch (error) {
      console.error("Error calling OpenAI API:", error)
      return NextResponse.json({
        summary: getMockSummary(content),
        _notice: "Using simulated summary due to API connection issues",
      })
    }
  } catch (error) {
    console.error("Error in summarize route:", error)
    return NextResponse.json({
      summary: "I'm sorry, I encountered an unexpected error. Please try again later.",
      _notice: "Internal server error",
    })
  }
}


import { type NextRequest, NextResponse } from "next/server"

// Add this mock response function at the top of the file
function getMockAIResponse(messages: any[]) {
  // Extract the last user message
  const lastUserMessage = messages.find((msg) => msg.role === "user")?.content || ""

  // Generate appropriate responses based on message content
  if (lastUserMessage.toLowerCase().includes("weather")) {
    return "I don't have access to real-time weather data, but I can tell you that weather patterns vary by location and season. For accurate weather information, you might want to check a dedicated weather service or the weather section of this app."
  } else if (lastUserMessage.toLowerCase().includes("travel") || lastUserMessage.toLowerCase().includes("visit")) {
    return "When planning travel, consider factors like local climate, cultural events, and peak tourist seasons. The best time to visit many destinations is during shoulder seasons when you can avoid crowds while still enjoying good weather."
  } else if (lastUserMessage.toLowerCase().includes("summarize") || lastUserMessage.toLowerCase().includes("summary")) {
    return "I'd be happy to summarize content for you. However, I'm currently operating in offline mode due to API limitations. In normal operation, I can summarize articles, blog posts, or any text you provide to extract the key points and main ideas."
  } else if (lastUserMessage.toLowerCase().includes("hello") || lastUserMessage.toLowerCase().includes("hi")) {
    return "Hello! I'm your AI assistant (currently in offline mode). I can provide information about travel, weather concepts, and more. How can I help you today?"
  } else {
    return "I'm currently operating in offline mode due to API connection issues. Normally, I could provide detailed information about your query. Please try again later when the service is fully operational, or explore other features of the app in the meantime."
  }
}

export async function POST(request: NextRequest) {
  try {
    const { messages, apiKey } = await request.json()

    if (!messages || !messages.length) {
      return NextResponse.json({ error: "Messages are required" }, { status: 400 })
    }

    // Check if API key is provided
    if (!apiKey) {
      console.log("No API key provided, using mock response")
      return NextResponse.json({
        response: getMockAIResponse(messages),
        _notice: "Using simulated AI response due to missing API key",
      })
    }

    try {
      // Format messages for OpenAI API
      const formattedMessages = [
        {
          role: "system",
          content:
            "You are a helpful assistant that specializes in weather information, travel advice, and summarizing content. Provide concise, accurate responses. If asked about real-time weather, explain that you don't have access to real-time data but can provide general information.",
        },
        ...messages.map((msg: any) => ({
          role: msg.role,
          content: msg.content,
        })),
      ]

      // Call OpenAI API
      const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: formattedMessages,
          max_tokens: 500,
          temperature: 0.7,
        }),
      })

      if (!openaiResponse.ok) {
        const errorData = await openaiResponse.json()
        console.error("OpenAI API error:", errorData)

        // Check specifically for invalid API key errors
        if (
          errorData.error?.code === "invalid_api_key" ||
          openaiResponse.status === 401 ||
          (errorData.error?.message && errorData.error.message.includes("API key"))
        ) {
          console.log("Invalid API key detected, using mock response")
          return NextResponse.json({
            response: getMockAIResponse(messages),
            _notice: "Using simulated AI response due to API key issues",
          })
        }

        return NextResponse.json({
          response: "I'm having trouble connecting to my knowledge base right now. Please try again later.",
          _notice: "API error occurred",
        })
      }

      const openaiData = await openaiResponse.json()
      const response = openaiData.choices[0].message.content.trim()

      return NextResponse.json({ response })
    } catch (error) {
      console.error("Error calling OpenAI API:", error)

      // Check if the error is related to an invalid API key
      const errorMessage = error.toString()
      if (errorMessage.includes("API key") || errorMessage.includes("401") || errorMessage.includes("authentication")) {
        return NextResponse.json({
          response: getMockAIResponse(messages),
          _notice: "Using simulated AI response due to API key authentication issues",
        })
      }

      return NextResponse.json({
        response: getMockAIResponse(messages),
        _notice: "Using simulated AI response due to API connection issues",
      })
    }
  } catch (error) {
    console.error("Error in chat route:", error)
    return NextResponse.json({
      response: "I'm sorry, I encountered an unexpected error. Please try again later.",
      _notice: "Internal server error",
    })
  }
}


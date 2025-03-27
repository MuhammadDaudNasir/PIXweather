"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, RefreshCw, Copy, Check, FileText, LinkIcon, Send, User, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface AIChatSummarizerProps {
  apiKey: string
}

interface Message {
  role: "user" | "assistant"
  content: string
}

export default function AIChatSummarizer({ apiKey }: AIChatSummarizerProps) {
  // Chat state
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hello! I'm your AI assistant. You can ask me questions about weather, travel, or paste an article URL or text for me to summarize.",
    },
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [chatLoading, setChatLoading] = useState(false)
  const [offlineMode, setOfflineMode] = useState(false)
  const [offlineNoticeShown, setOfflineNoticeShown] = useState(false)

  // Summarizer state
  const [url, setUrl] = useState("")
  const [text, setText] = useState("")
  const [summary, setSummary] = useState("")
  const [summaryLoading, setSummaryLoading] = useState(false)
  const [inputType, setInputType] = useState<"url" | "text">("url")
  const [copied, setCopied] = useState(false)

  const { toast } = useToast()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)

  // Check if we're using a placeholder or invalid API key
  useEffect(() => {
    if (!apiKey || apiKey === "placeholder-api-key" || apiKey.includes("abcdef")) {
      setOfflineMode(true)
      if (!offlineNoticeShown) {
        setOfflineNoticeShown(true)
        toast({
          title: "AI Assistant - Offline Mode",
          description: "Using simulated AI responses due to API key issues",
          variant: "default",
        })
      }
    }
  }, [apiKey, offlineNoticeShown, toast])

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage = { role: "user" as const, content: inputMessage }
    setMessages((prev) => [...prev, userMessage])
    setInputMessage("")
    setChatLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          apiKey,
        }),
      })

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }

      const data = await response.json()

      // Check if we're using a mock response
      if (data._notice && !offlineNoticeShown) {
        setOfflineMode(true)
        setOfflineNoticeShown(true)
        toast({
          title: "AI Assistant Notice",
          description: data._notice,
          variant: "default",
        })
      }

      setMessages((prev) => [...prev, { role: "assistant", content: data.response }])
    } catch (error) {
      console.error("Error in chat:", error)

      // If there's an error, use a fallback response
      const fallbackResponse =
        "I'm sorry, I encountered an error. I'm currently operating in offline mode, so my responses are limited."

      setMessages((prev) => [...prev, { role: "assistant", content: fallbackResponse }])

      setOfflineMode(true)
      if (!offlineNoticeShown) {
        setOfflineNoticeShown(true)
        toast({
          title: "AI Assistant - Offline Mode",
          description: "Using simulated AI responses due to connection issues",
          variant: "default",
        })
      }
    } finally {
      setChatLoading(false)
    }
  }

  const handleSummarize = async () => {
    if ((inputType === "url" && !url) || (inputType === "text" && !text)) {
      toast({
        title: "Input required",
        description: inputType === "url" ? "Please enter a URL" : "Please enter some text to summarize",
        variant: "default",
      })
      return
    }

    try {
      setSummaryLoading(true)
      setSummary("")

      const response = await fetch("/api/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputType,
          content: inputType === "url" ? url : text,
          apiKey,
        }),
      })

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }

      const data = await response.json()

      // Check if we're using a mock summary
      if (data._notice && !offlineNoticeShown) {
        setOfflineMode(true)
        setOfflineNoticeShown(true)
        toast({
          title: "AI Assistant Notice",
          description: data._notice,
          variant: "default",
        })
      }

      setSummary(data.summary)

      // Also add to chat history
      setMessages((prev) => [
        ...prev,
        {
          role: "user",
          content: `Please summarize this ${inputType === "url" ? "URL" : "text"}: ${inputType === "url" ? url : text.substring(0, 50) + "..."}`,
        },
        { role: "assistant", content: data.summary },
      ])
    } catch (error) {
      console.error("Error summarizing content:", error)

      // Use a fallback summary
      const fallbackSummary =
        "I'm sorry, I couldn't summarize the content due to technical limitations. I'm currently operating in offline mode with limited functionality."

      setSummary(fallbackSummary)
      setMessages((prev) => [
        ...prev,
        {
          role: "user",
          content: `Please summarize this ${inputType === "url" ? "URL" : "text"}: ${inputType === "url" ? url : text.substring(0, 50) + "..."}`,
        },
        { role: "assistant", content: fallbackSummary },
      ])

      setOfflineMode(true)
      if (!offlineNoticeShown) {
        setOfflineNoticeShown(true)
        toast({
          title: "Summarization - Offline Mode",
          description: "Using simulated summaries due to connection issues",
          variant: "default",
        })
      }
    } finally {
      setSummaryLoading(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(summary)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast({
      title: "Copied to clipboard",
      description: "The summary has been copied to your clipboard",
      variant: "default",
    })
  }

  const handleReset = () => {
    setUrl("")
    setText("")
    setSummary("")
  }

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }

  return (
    <Tabs defaultValue="chat" className="w-full">
      <TabsList className="grid grid-cols-2 mb-4">
        <TabsTrigger value="chat" className="data-[state=active]:bg-[#8B4513] data-[state=active]:text-white">
          <div className="flex items-center">
            <User className="h-4 w-4 mr-2" />
            Chat
          </div>
        </TabsTrigger>
        <TabsTrigger value="summarize" className="data-[state=active]:bg-[#8B4513] data-[state=active]:text-white">
          <div className="flex items-center">
            <FileText className="h-4 w-4 mr-2" />
            Summarize
          </div>
        </TabsTrigger>
      </TabsList>

      {offlineMode && (
        <div className="bg-yellow-500/20 backdrop-blur-md rounded-lg p-3 border border-yellow-500/30 mb-4">
          <div className="flex items-center text-yellow-500 mb-1">
            <AlertTriangle className="h-4 w-4 mr-2" />
            <h3 className="font-medium text-sm">AI Assistant - Offline Mode</h3>
          </div>
          <p className="text-xs text-[#d5bdaf]">
            The AI assistant is currently operating in offline mode due to API connection issues. Responses are
            simulated and may not be as detailed or accurate as normal operation.
          </p>
        </div>
      )}

      <TabsContent value="chat" className="mt-0">
        {/* Chat Interface */}
        <div className="bg-black/20 rounded-lg border border-[#3c2a21]/30 mb-4">
          <div className="h-[350px] overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.role === "user" ? "bg-[#8B4513] text-white" : "bg-[#3c2a21]/50 text-[#d5bdaf]"
                  }`}
                >
                  <div className="flex items-center mb-1">
                    {message.role === "user" ? (
                      <>
                        <span className="text-xs font-medium">You</span>
                        <User className="h-3 w-3 ml-1" />
                      </>
                    ) : (
                      <>
                        <span className="text-xs font-medium">AI Assistant</span>
                        <Sparkles className="h-3 w-3 ml-1" />
                      </>
                    )}
                  </div>
                  <p className="text-sm whitespace-pre-line">{message.content}</p>
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="flex justify-start">
                <div className="max-w-[80%] p-3 rounded-lg bg-[#3c2a21]/50 text-[#d5bdaf]">
                  <div className="flex items-center mb-1">
                    <span className="text-xs font-medium">AI Assistant</span>
                    <Sparkles className="h-3 w-3 ml-1" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <p className="text-sm">Thinking...</p>
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="p-4 border-t border-[#3c2a21]/30 flex space-x-2">
            <Input
              type="text"
              placeholder="Type your message..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage()
                }
              }}
              className="bg-black/30 border-[#3c2a21]/30 text-[#d5bdaf]"
            />
            <Button
              onClick={handleSendMessage}
              disabled={chatLoading || !inputMessage.trim()}
              className="bg-[#8B4513] hover:bg-[#6d3710] text-white"
            >
              {chatLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="summarize" className="mt-0">
        {/* Summarizer Interface */}
        <div className="space-y-4">
          {/* Input Type Toggle */}
          <div className="flex bg-black/30 rounded-lg p-1 w-fit mb-4">
            <button
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                inputType === "url" ? "bg-[#8B4513] text-white" : "bg-transparent text-[#d5bdaf] hover:bg-[#3c2a21]/50"
              }`}
              onClick={() => setInputType("url")}
            >
              <div className="flex items-center">
                <LinkIcon className="h-4 w-4 mr-1.5" />
                URL
              </div>
            </button>
            <button
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                inputType === "text" ? "bg-[#8B4513] text-white" : "bg-transparent text-[#d5bdaf] hover:bg-[#3c2a21]/50"
              }`}
              onClick={() => setInputType("text")}
            >
              <div className="flex items-center">
                <FileText className="h-4 w-4 mr-1.5" />
                Text
              </div>
            </button>
          </div>

          {/* URL Input */}
          <AnimatePresence mode="wait">
            {inputType === "url" ? (
              <motion.div
                key="url-input"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <Input
                  type="url"
                  placeholder="Enter article URL (e.g., https://example.com/article)"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full bg-black/20 border-[#3c2a21]/30 text-[#d5bdaf] placeholder:text-[#d5bdaf]/50"
                />
              </motion.div>
            ) : (
              <motion.div
                key="text-input"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <Textarea
                  ref={textareaRef}
                  placeholder="Paste article text here..."
                  value={text}
                  onChange={(e) => {
                    setText(e.target.value)
                    adjustTextareaHeight()
                  }}
                  className="w-full min-h-[150px] bg-black/20 border-[#3c2a21]/30 text-[#d5bdaf] placeholder:text-[#d5bdaf]/50 resize-none"
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <Button
              onClick={handleSummarize}
              disabled={summaryLoading}
              className="bg-[#8B4513] hover:bg-[#6d3710] text-white flex-1"
            >
              {summaryLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Summarizing...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Summarize
                </>
              )}
            </Button>
            <Button
              onClick={handleReset}
              variant="outline"
              className="border-[#3c2a21] text-[#d5bdaf] hover:bg-[#3c2a21]/30"
            >
              Reset
            </Button>
          </div>

          {/* Summary Output */}
          <AnimatePresence>
            {summary && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-6"
              >
                <div className="bg-black/30 backdrop-blur-md rounded-lg p-4 border border-[#3c2a21]/30">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-medium text-[#8B4513] flex items-center">
                      <Sparkles className="h-4 w-4 mr-2" />
                      Summary
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopy}
                      className="h-8 w-8 rounded-full bg-[#3c2a21]/50 text-[#d5bdaf] hover:bg-[#8B4513]/70"
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                  <div className="prose prose-invert max-w-none">
                    <p className="text-sm text-[#d5bdaf] whitespace-pre-line">{summary}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </TabsContent>
    </Tabs>
  )
}


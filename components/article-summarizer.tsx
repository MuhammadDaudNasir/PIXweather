"use client"

import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, RefreshCw, Copy, Check, FileText, LinkIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

interface ArticleSummarizerProps {
  apiKey: string
}

export default function ArticleSummarizer({ apiKey }: ArticleSummarizerProps) {
  const [url, setUrl] = useState("")
  const [text, setText] = useState("")
  const [summary, setSummary] = useState("")
  const [loading, setLoading] = useState(false)
  const [inputType, setInputType] = useState<"url" | "text">("url")
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()
  const textareaRef = useRef<HTMLTextAreaElement>(null)

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
      setLoading(true)
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
      setSummary(data.summary)
    } catch (error) {
      console.error("Error summarizing content:", error)
      toast({
        title: "Summarization failed",
        description: "There was an error summarizing the content. Please try again.",
        variant: "default",
      })
    } finally {
      setLoading(false)
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
          disabled={loading}
          className="bg-[#8B4513] hover:bg-[#6d3710] text-white flex-1"
        >
          {loading ? (
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
  )
}


"use client"

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface QuestionDisplayProps {
  question: {
    id: string
    type: string
    question: string // Changed from 'text' to 'question'
    options: Array<{
      id: string
      text: string
    }>
  }
  answer?: {
    answer: string // Single answer field (optionId or text)
    isCorrect: boolean | null
    points: number
  }
  onAnswerChange: (answer: { selectedOptionId?: string; textAnswer?: string }) => void
}

export function QuestionDisplay({
  question,
  answer,
  onAnswerChange
}: QuestionDisplayProps) {
  return (
    <div className="space-y-4">
      <div className="prose max-w-none">
        <p className="text-lg">{question.question}</p>
      </div>

      {question.type === "MULTIPLE_CHOICE" && (
        <RadioGroup
          value={answer?.answer || ""}
          onValueChange={(value) => onAnswerChange({ selectedOptionId: value })}
        >
          <div className="space-y-3">
            {question.options.map((option) => (
              <div
                key={option.id}
                className="flex items-start space-x-3 rounded-lg border p-4 hover:bg-muted/50"
              >
                <RadioGroupItem value={option.id} id={option.id} />
                <Label htmlFor={option.id} className="flex-1 cursor-pointer font-normal">
                  {option.text}
                </Label>
              </div>
            ))}
          </div>
        </RadioGroup>
      )}

      {question.type === "TRUE_FALSE" && (
        <RadioGroup
          value={answer?.answer || ""}
          onValueChange={(value) => onAnswerChange({ selectedOptionId: value })}
        >
          <div className="space-y-3">
            {question.options.map((option) => (
              <div
                key={option.id}
                className="flex items-start space-x-3 rounded-lg border p-4 hover:bg-muted/50"
              >
                <RadioGroupItem value={option.id} id={option.id} />
                <Label htmlFor={option.id} className="flex-1 cursor-pointer font-normal">
                  {option.text}
                </Label>
              </div>
            ))}
          </div>
        </RadioGroup>
      )}

      {(question.type === "SHORT_ANSWER" || question.type === "ESSAY") && (
        <div className="space-y-2">
          <Label htmlFor={`answer-${question.id}`}>Your Answer</Label>
          <Textarea
            id={`answer-${question.id}`}
            value={answer?.answer || ""}
            onChange={(e) => onAnswerChange({ textAnswer: e.target.value })}
            placeholder="Type your answer here..."
            rows={question.type === "ESSAY" ? 8 : 3}
            className="w-full"
          />
        </div>
      )}
    </div>
  )
}

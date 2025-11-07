"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { QuizQuestion } from "@/lib/types"
import { instructorQuizService } from "@/lib/services"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"
import { PlusCircle, Trash2 } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"

const formSchema = z.object({
  type: z.enum(["MULTIPLE_CHOICE", "TRUE_FALSE", "SHORT_ANSWER", "ESSAY"]),
  text: z.string().min(1, "Question text is required"),
  points: z.string().min(1, "Points required"),
})

interface Option {
  id?: string
  text: string
  isCorrect: boolean
  order: number
}

interface QuestionBuilderProps {
  quizId: string
  question?: QuizQuestion
  onCancel: () => void
  onSuccess: () => void
}

export function QuestionBuilder({
  quizId,
  question,
  onCancel,
  onSuccess,
}: QuestionBuilderProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [options, setOptions] = useState<Option[]>(
    question?.options || [
      { text: "", isCorrect: false, order: 0 },
      { text: "", isCorrect: false, order: 1 },
    ]
  )

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: (question?.type as "MULTIPLE_CHOICE" | "TRUE_FALSE" | "SHORT_ANSWER" | "ESSAY") || "MULTIPLE_CHOICE",
      text: question?.question || "",
      points: question?.points.toString() || "1",
    },
  })

  const questionType = form.watch("type")

  const addOption = () => {
    setOptions([...options, { text: "", isCorrect: false, order: options.length }])
  }

  const removeOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index))
  }

  const updateOption = (index: number, field: keyof Option, value: string | boolean | number) => {
    const newOptions = [...options]
    newOptions[index] = { ...newOptions[index], [field]: value }
    setOptions(newOptions)
  }

  const setCorrectAnswer = (index: number) => {
    const newOptions = options.map((opt, i) => ({
      ...opt,
      isCorrect: i === index,
    }))
    setOptions(newOptions)
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true)

      // Validate options for MC and T/F
      if (questionType === "MULTIPLE_CHOICE" || questionType === "TRUE_FALSE") {
        const filledOptions = options.filter(opt => opt.text.trim())
        
        if (filledOptions.length < 2) {
          toast.error("Please add at least 2 options")
          return
        }

        if (!filledOptions.some(opt => opt.isCorrect)) {
          toast.error("Please mark one option as correct")
          return
        }
      }

      const data = {
        ...values,
        points: parseInt(values.points),
        options: (questionType === "MULTIPLE_CHOICE" || questionType === "TRUE_FALSE")
          ? options.filter(opt => opt.text.trim()).map((opt, index) => ({
              ...opt,
              order: index
            }))
          : []
      }

      if (question) {
        // Update existing question
        await instructorQuizService.updateQuestion(quizId, question.id, data)
        toast.success("Question updated!")
      } else {
        // Create new question
        await instructorQuizService.createQuestion(quizId, data)
        toast.success("Question added!")
      }

      onSuccess()
      router.refresh()
    } catch {
      toast.error("Something went wrong")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Question Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isSubmitting || !!question}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="MULTIPLE_CHOICE">Multiple Choice</SelectItem>
                        <SelectItem value="TRUE_FALSE">True/False</SelectItem>
                        <SelectItem value="SHORT_ANSWER">Short Answer</SelectItem>
                        <SelectItem value="ESSAY">Essay</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="points"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Points</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Question Text</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter your question here..."
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {questionType === "MULTIPLE_CHOICE" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <FormLabel>Answer Options</FormLabel>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={addOption}
                    disabled={isSubmitting}
                  >
                    <PlusCircle className="mr-1 h-3 w-3" />
                    Add Option
                  </Button>
                </div>

                {options.map((option, index) => (
                  <div key={index} className="flex gap-2">
                    <div className="flex items-center pt-2">
                      <Checkbox
                        checked={option.isCorrect}
                        onCheckedChange={() => setCorrectAnswer(index)}
                        disabled={isSubmitting}
                      />
                    </div>
                    <Input
                      placeholder={`Option ${index + 1}`}
                      value={option.text}
                      onChange={(e) => updateOption(index, "text", e.target.value)}
                      disabled={isSubmitting}
                      className="flex-1"
                    />
                    {options.length > 2 && (
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() => removeOption(index)}
                        disabled={isSubmitting}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <p className="text-xs text-muted-foreground">
                  Check the box to mark the correct answer
                </p>
              </div>
            )}

            {questionType === "TRUE_FALSE" && (
              <div className="space-y-3">
                <FormLabel>Answer Options</FormLabel>
                {["True", "False"].map((label, index) => (
                  <div key={label} className="flex items-center gap-2">
                    <Checkbox
                      checked={options[index]?.isCorrect || false}
                      onCheckedChange={() => setCorrectAnswer(index)}
                      disabled={isSubmitting}
                    />
                    <span className="text-sm">{label}</span>
                  </div>
                ))}
                <p className="text-xs text-muted-foreground">
                  Check the box to mark the correct answer
                </p>
              </div>
            )}

            {(questionType === "SHORT_ANSWER" || questionType === "ESSAY") && (
              <div className="rounded-lg status-warning p-4 text-sm">
                <p className="font-medium">Manual Grading Required</p>
                <p className="text-muted-foreground">
                  This question type requires manual grading by the instructor after submission.
                </p>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : question ? "Update Question" : "Add Question"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

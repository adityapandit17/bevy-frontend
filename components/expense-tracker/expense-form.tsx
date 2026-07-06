"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { DatePicker } from "@/components/ui/date-picker"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { 
  Receipt, 
  DollarSign, 
  CreditCard, 
  Calendar, 
  Tag, 
  PieChart, 
  BarChart3, 
  Wallet, 
  PiggyBank, 
  Banknote 
} from "lucide-react"

const categories = [
  "Office", "Meals", "Transportation", "Software", "Travel", "Entertainment", 
  "Healthcare", "Education", "Utilities", "Other"
]

const paymentMethods = ["Credit Card", "Debit Card", "Cash", "Bank Transfer", "Digital Wallet"]

interface ExpenseFormData {
  title: string
  amount: number
  category: string
  date: string
  description: string
  paymentMethod: string
  tags: string[]
}

interface ExpenseFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (expense: ExpenseFormData) => void | Promise<void>
  initialData?: ExpenseFormData | null
  title: string
  description: string
}

const emptyForm = () => ({
  title: "",
  amount: "",
  category: "",
  date: new Date().toISOString().split("T")[0],
  description: "",
  paymentMethod: "",
  tags: "",
})

export function ExpenseForm({ isOpen, onClose, onSubmit, initialData, title, description }: ExpenseFormProps) {
  const [formData, setFormData] = useState(emptyForm())
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!isOpen) return

    if (initialData) {
      setFormData({
        title: initialData.title || "",
        amount: initialData.amount?.toString() || "",
        category: initialData.category || "",
        date: initialData.date || new Date().toISOString().split("T")[0],
        description: initialData.description || "",
        paymentMethod: initialData.paymentMethod || "",
        tags: initialData.tags?.join(", ") || "",
      })
    } else {
      setFormData(emptyForm())
    }
  }, [isOpen, initialData])

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Office": return <Receipt className="w-4 h-4" />
      case "Meals": return <DollarSign className="w-4 h-4" />
      case "Transportation": return <CreditCard className="w-4 h-4" />
      case "Software": return <PieChart className="w-4 h-4" />
      case "Travel": return <Calendar className="w-4 h-4" />
      case "Entertainment": return <BarChart3 className="w-4 h-4" />
      case "Healthcare": return <Wallet className="w-4 h-4" />
      case "Education": return <PiggyBank className="w-4 h-4" />
      case "Utilities": return <Banknote className="w-4 h-4" />
      default: return <Tag className="w-4 h-4" />
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title || !formData.amount || !formData.category) {
      return
    }

    const expense: ExpenseFormData = {
      title: formData.title,
      amount: parseFloat(formData.amount),
      category: formData.category,
      date: formData.date,
      description: formData.description,
      paymentMethod: formData.paymentMethod,
      tags: formData.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
    }

    setSubmitting(true)
    try {
      await onSubmit(expense)
      setFormData(emptyForm())
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    setFormData(emptyForm())
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="title" className="text-sm font-medium">Title</label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="Enter expense title"
              required
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="amount" className="text-sm font-medium">Amount</label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              placeholder="0.00"
              required
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="category" className="text-sm font-medium">Category</label>
            <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(category)}
                      {category}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <label htmlFor="date" className="text-sm font-medium">Date</label>
            <DatePicker
              value={formData.date}
              onChange={(v) => setFormData({ ...formData, date: v })}
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="paymentMethod" className="text-sm font-medium">Payment Method</label>
            <Select value={formData.paymentMethod} onValueChange={(value) => setFormData({...formData, paymentMethod: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                {paymentMethods.map((method) => (
                  <SelectItem key={method} value={method}>{method}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <label htmlFor="description" className="text-sm font-medium">Description</label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Enter expense description"
              rows={3}
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="tags" className="text-sm font-medium">Tags</label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) => setFormData({...formData, tags: e.target.value})}
              placeholder="Enter tags separated by commas"
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving…" : initialData ? "Update Expense" : "Add Expense"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Edit, 
  Trash2, 
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

interface Expense {
  id: number
  title: string
  amount: number
  category: string
  date: string
  description: string
  paymentMethod: string
  tags: string[]
  receipt?: string | null
}

interface ExpenseListProps {
  expenses: Expense[]
  onEdit: (expense: Expense) => void
  onDelete: (id: number) => void
  onView?: (expense: Expense) => void
}

export function ExpenseList({ expenses, onEdit, onDelete, onView }: ExpenseListProps) {
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

  const getCategoryColor = (category: string) => {
    const colors = {
      "Office": "bg-blue-100 text-blue-800",
      "Meals": "bg-green-100 text-green-800",
      "Transportation": "bg-yellow-100 text-yellow-800",
      "Software": "bg-purple-100 text-purple-800",
      "Travel": "bg-indigo-100 text-indigo-800",
      "Entertainment": "bg-pink-100 text-pink-800",
      "Healthcare": "bg-red-100 text-red-800",
      "Education": "bg-orange-100 text-orange-800",
      "Utilities": "bg-gray-100 text-gray-800",
      "Other": "bg-slate-100 text-slate-800"
    }
    return colors[category as keyof typeof colors] || colors["Other"]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  if (expenses.length === 0) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center">
            <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No expenses found</h3>
            <p className="text-gray-500">Start tracking your expenses by adding your first expense.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Expense List</CardTitle>
        <CardDescription>
          {expenses.length} expense{expenses.length !== 1 ? 's' : ''} found
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {expenses.map((expense) => (
            <div 
              key={expense.id} 
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-lg ${getCategoryColor(expense.category)}`}>
                  {getCategoryIcon(expense.category)}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{expense.title}</h3>
                  {expense.description && (
                    <p className="text-sm text-gray-500 mt-1">{expense.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      {expense.category}
                    </Badge>
                    <span className="text-xs text-gray-400">
                      {formatDate(expense.date)}
                    </span>
                    {expense.paymentMethod && (
                      <span className="text-xs text-gray-400">
                        {expense.paymentMethod}
                      </span>
                    )}
                  </div>
                  {expense.tags.length > 0 && (
                    <div className="flex gap-1 mt-2">
                      {expense.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-lg font-semibold text-gray-900">
                  {formatAmount(expense.amount)}
                </span>
                <div className="flex gap-1">
                  {onView && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => onView(expense)}
                      title="View details"
                    >
                      <Receipt className="w-4 h-4" />
                    </Button>
                  )}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => onEdit(expense)}
                    title="Edit expense"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => onDelete(expense.id)}
                    title="Delete expense"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

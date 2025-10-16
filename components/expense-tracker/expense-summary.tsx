"use client"

import { Card, CardContent } from "@/components/ui/card"
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  DollarSign,
  Receipt,
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

interface ExpenseSummaryProps {
  expenses: Expense[]
  filteredExpenses: Expense[]
}

export function ExpenseSummary({ expenses, filteredExpenses }: ExpenseSummaryProps) {
  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0)
  const averageExpense = filteredExpenses.length > 0 ? totalExpenses / filteredExpenses.length : 0
  
  // Calculate this month's expenses
  const currentDate = new Date()
  const thisMonthExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date)
    return expenseDate.getMonth() === currentDate.getMonth() && 
           expenseDate.getFullYear() === currentDate.getFullYear()
  }).reduce((sum, expense) => sum + expense.amount, 0)

  // Calculate last month's expenses for comparison
  const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
  const lastMonthExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date)
    return expenseDate.getMonth() === lastMonth.getMonth() && 
           expenseDate.getFullYear() === lastMonth.getFullYear()
  }).reduce((sum, expense) => sum + expense.amount, 0)

  // Calculate month-over-month change
  const monthOverMonthChange = lastMonthExpenses > 0 
    ? ((thisMonthExpenses - lastMonthExpenses) / lastMonthExpenses) * 100 
    : 0

  // Calculate highest expense
  const highestExpense = filteredExpenses.length > 0 
    ? Math.max(...filteredExpenses.map(e => e.amount)) 
    : 0

  // Calculate most used category
  const categoryCounts = filteredExpenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  const mostUsedCategory = Object.entries(categoryCounts).reduce((a, b) => 
    categoryCounts[a[0]] > categoryCounts[b[0]] ? a : b, 
    ['', 0]
  )[0]

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total Expenses */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Expenses</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalExpenses)}</p>
              <p className="text-sm text-gray-500">{filteredExpenses.length} transaction{filteredExpenses.length !== 1 ? 's' : ''}</p>
            </div>
            <div className="p-3 rounded-lg bg-red-50">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Average Expense */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average Expense</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(averageExpense)}</p>
              <p className="text-sm text-gray-500">Per transaction</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-50">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* This Month */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">This Month</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(thisMonthExpenses)}</p>
              <p className={`text-sm ${monthOverMonthChange >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                {formatPercentage(monthOverMonthChange)} vs last month
              </p>
            </div>
            <div className="p-3 rounded-lg bg-green-50">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Highest Expense */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Highest Expense</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(highestExpense)}</p>
              <p className="text-sm text-gray-500">
                {mostUsedCategory && `Most used: ${mostUsedCategory}`}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-purple-50">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

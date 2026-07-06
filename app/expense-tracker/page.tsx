"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Plus,
  Download,
  Receipt,
  PieChart,
  BarChart3,
  Wallet,
  CreditCard,
  Banknote,
  PiggyBank,
  DollarSign,
  Calendar,
  Tag,
  Loader2,
} from "lucide-react"
import { ExpenseForm } from "@/components/expense-tracker/expense-form"
import { ExpenseList } from "@/components/expense-tracker/expense-list"
import { ExpenseSummary } from "@/components/expense-tracker/expense-summary"
import { ExpenseFilters } from "@/components/expense-tracker/expense-filters"
import { apiRequest, getEndpointUrl } from "@/lib/api"

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
  status?: string
  employee_id?: number
  employee_name?: string
}

interface ExpenseFormData {
  title: string
  amount: number
  category: string
  date: string
  description: string
  paymentMethod: string
  tags: string[]
}

const categories = [
  "Office", "Meals", "Transportation", "Software", "Travel", "Entertainment",
  "Healthcare", "Education", "Utilities", "Other",
]

function buildExpensePayload(expenseData: ExpenseFormData) {
  return {
    expense: {
      title: expenseData.title,
      amount: expenseData.amount,
      category: expenseData.category,
      expense_date: expenseData.date,
      description: expenseData.description,
      payment_method: expenseData.paymentMethod,
      tags: expenseData.tags,
    },
  }
}

export default function ExpenseTracker() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedMonth, setSelectedMonth] = useState("all")
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("all")
  const [minAmount, setMinAmount] = useState("")
  const [maxAmount, setMaxAmount] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)

  useEffect(() => {
    fetchExpenses()
  }, [])

  const fetchExpenses = async () => {
    setLoading(true)
    try {
      const data = await apiRequest<Expense[]>(getEndpointUrl("EXPENSES"))
      setExpenses(Array.isArray(data) ? data : [])
    } catch {
      setExpenses([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let filtered = expenses

    if (searchTerm) {
      filtered = filtered.filter((expense) =>
        expense.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (expense.description || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (expense.tags || []).some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter((expense) => expense.category === selectedCategory)
    }

    if (selectedMonth !== "all") {
      filtered = filtered.filter((expense) => {
        const expenseDate = new Date(expense.date)
        const expenseMonth = expenseDate.getMonth() + 1
        return expenseMonth.toString() === selectedMonth
      })
    }

    if (selectedPaymentMethod !== "all") {
      filtered = filtered.filter((expense) => expense.paymentMethod === selectedPaymentMethod)
    }

    if (minAmount) {
      filtered = filtered.filter((expense) => expense.amount >= parseFloat(minAmount))
    }

    if (maxAmount) {
      filtered = filtered.filter((expense) => expense.amount <= parseFloat(maxAmount))
    }

    setFilteredExpenses(filtered)
  }, [expenses, searchTerm, selectedCategory, selectedMonth, selectedPaymentMethod, minAmount, maxAmount])

  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0)
  const categoryTotals = categories.reduce((acc, category) => {
    acc[category] = filteredExpenses
      .filter((expense) => expense.category === category)
      .reduce((sum, expense) => sum + expense.amount, 0)
    return acc
  }, {} as Record<string, number>)

  const handleAddExpense = async (expenseData: ExpenseFormData) => {
    const created = await apiRequest<Expense>(getEndpointUrl("EXPENSES"), {
      method: "POST",
      body: JSON.stringify(buildExpensePayload(expenseData)),
    })
    setExpenses((prev) => [created, ...prev])
    setIsAddDialogOpen(false)
  }

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense)
    setIsEditDialogOpen(true)
  }

  const handleUpdateExpense = async (expenseData: ExpenseFormData) => {
    if (!editingExpense) return

    const updated = await apiRequest<Expense>(
      `${getEndpointUrl("EXPENSES")}/${editingExpense.id}`,
      {
        method: "PATCH",
        body: JSON.stringify(buildExpensePayload(expenseData)),
      }
    )

    setExpenses((prev) => prev.map((expense) => (expense.id === updated.id ? updated : expense)))
    setIsEditDialogOpen(false)
    setEditingExpense(null)
  }

  const handleDeleteExpense = async (id: number) => {
    await apiRequest(`${getEndpointUrl("EXPENSES")}/${id}`, { method: "DELETE" })
    setExpenses((prev) => prev.filter((expense) => expense.id !== id))
  }

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
    const colors: Record<string, string> = {
      "Office": "bg-blue-100 text-blue-800",
      "Meals": "bg-green-100 text-green-800",
      "Transportation": "bg-yellow-100 text-yellow-800",
      "Software": "bg-purple-100 text-purple-800",
      "Travel": "bg-indigo-100 text-indigo-800",
      "Entertainment": "bg-pink-100 text-pink-800",
      "Healthcare": "bg-red-100 text-red-800",
      "Education": "bg-orange-100 text-orange-800",
      "Utilities": "bg-gray-100 text-gray-800",
      "Other": "bg-slate-100 text-slate-800",
    }
    return colors[category] || colors["Other"]
  }

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Expense Tracker</h1>
          <p className="text-gray-600">Track and manage your personal expenses</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Expense
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>
      </div>

      <ExpenseSummary expenses={expenses} filteredExpenses={filteredExpenses} />

      <ExpenseFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        selectedMonth={selectedMonth}
        onMonthChange={setSelectedMonth}
        selectedPaymentMethod={selectedPaymentMethod}
        onPaymentMethodChange={setSelectedPaymentMethod}
        minAmount={minAmount}
        onMinAmountChange={setMinAmount}
        maxAmount={maxAmount}
        onMaxAmountChange={setMaxAmount}
      />

      {loading ? (
        <div className="flex items-center justify-center py-16 text-gray-500">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          Loading expenses…
        </div>
      ) : (
        <Tabs defaultValue="list" className="space-y-6">
          <TabsList>
            <TabsTrigger value="list">Expense List</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="space-y-6">
            <ExpenseList
              expenses={filteredExpenses}
              onEdit={handleEditExpense}
              onDelete={handleDeleteExpense}
            />
          </TabsContent>

          <TabsContent value="categories" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Expenses by Category</CardTitle>
                <CardDescription>Breakdown of your expenses by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categories.map((category) => {
                    const total = categoryTotals[category]
                    const percentage = totalExpenses > 0 ? (total / totalExpenses) * 100 : 0
                    const count = filteredExpenses.filter((e) => e.category === category).length

                    if (total === 0) return null

                    return (
                      <div key={category} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-lg ${getCategoryColor(category)}`}>
                            {getCategoryIcon(category)}
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{category}</h3>
                            <p className="text-sm text-gray-500">{count} transaction{count !== 1 ? "s" : ""}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-gray-900">${total.toFixed(2)}</p>
                          <p className="text-sm text-gray-500">{percentage.toFixed(1)}%</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Trend</CardTitle>
                  <CardDescription>Your spending pattern over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <BarChart3 className="w-12 h-12 mx-auto mb-2" />
                      <p>Chart visualization would go here</p>
                      <p className="text-sm">Monthly spending trends</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Category Distribution</CardTitle>
                  <CardDescription>How your expenses are distributed</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <PieChart className="w-12 h-12 mx-auto mb-2" />
                      <p>Pie chart would go here</p>
                      <p className="text-sm">Category breakdown</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      )}

      <ExpenseForm
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSubmit={handleAddExpense}
        title="Add New Expense"
        description="Enter the details of your expense to track it."
      />

      <ExpenseForm
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false)
          setEditingExpense(null)
        }}
        onSubmit={handleUpdateExpense}
        initialData={editingExpense}
        title="Edit Expense"
        description="Update the details of your expense."
      />
    </div>
  )
}

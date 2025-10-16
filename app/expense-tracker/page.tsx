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
  Tag
} from "lucide-react"
import { ExpenseForm } from "@/components/expense-tracker/expense-form"
import { ExpenseList } from "@/components/expense-tracker/expense-list"
import { ExpenseSummary } from "@/components/expense-tracker/expense-summary"
import { ExpenseFilters } from "@/components/expense-tracker/expense-filters"

// Mock data for demonstration
const mockExpenses = [
  {
    id: 1,
    title: "Office Supplies",
    amount: 125.50,
    category: "Office",
    date: "2024-01-15",
    description: "Pens, notebooks, and stationery",
    paymentMethod: "Credit Card",
    tags: ["work", "supplies"],
    receipt: "receipt_001.pdf"
  },
  {
    id: 2,
    title: "Lunch Meeting",
    amount: 45.00,
    category: "Meals",
    date: "2024-01-14",
    description: "Client lunch at restaurant",
    paymentMethod: "Cash",
    tags: ["business", "client"],
    receipt: null
  },
  {
    id: 3,
    title: "Uber Ride",
    amount: 18.75,
    category: "Transportation",
    date: "2024-01-13",
    description: "Ride to client office",
    paymentMethod: "Credit Card",
    tags: ["transport", "business"],
    receipt: null
  },
  {
    id: 4,
    title: "Software License",
    amount: 299.00,
    category: "Software",
    date: "2024-01-12",
    description: "Annual subscription for design software",
    paymentMethod: "Bank Transfer",
    tags: ["software", "subscription"],
    receipt: "receipt_002.pdf"
  },
  {
    id: 5,
    title: "Coffee",
    amount: 4.50,
    category: "Meals",
    date: "2024-01-11",
    description: "Morning coffee",
    paymentMethod: "Credit Card",
    tags: ["coffee", "daily"],
    receipt: null
  }
]

const categories = [
  "Office", "Meals", "Transportation", "Software", "Travel", "Entertainment", 
  "Healthcare", "Education", "Utilities", "Other"
]

const paymentMethods = ["Credit Card", "Debit Card", "Cash", "Bank Transfer", "Digital Wallet"]

export default function ExpenseTracker() {
  const [expenses, setExpenses] = useState(mockExpenses)
  const [filteredExpenses, setFilteredExpenses] = useState(mockExpenses)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedMonth, setSelectedMonth] = useState("all")
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("all")
  const [minAmount, setMinAmount] = useState("")
  const [maxAmount, setMaxAmount] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState(null)

  // Filter expenses based on search and filters
  useEffect(() => {
    let filtered = expenses

    if (searchTerm) {
      filtered = filtered.filter(expense =>
        expense.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter(expense => expense.category === selectedCategory)
    }

    if (selectedMonth !== "all") {
      filtered = filtered.filter(expense => {
        const expenseDate = new Date(expense.date)
        const expenseMonth = expenseDate.getMonth() + 1
        return expenseMonth.toString() === selectedMonth
      })
    }

    if (selectedPaymentMethod !== "all") {
      filtered = filtered.filter(expense => expense.paymentMethod === selectedPaymentMethod)
    }

    if (minAmount) {
      filtered = filtered.filter(expense => expense.amount >= parseFloat(minAmount))
    }

    if (maxAmount) {
      filtered = filtered.filter(expense => expense.amount <= parseFloat(maxAmount))
    }

    setFilteredExpenses(filtered)
  }, [expenses, searchTerm, selectedCategory, selectedMonth, selectedPaymentMethod, minAmount, maxAmount])

  // Calculate summary statistics
  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0)
  const averageExpense = filteredExpenses.length > 0 ? totalExpenses / filteredExpenses.length : 0
  const categoryTotals = categories.reduce((acc, category) => {
    acc[category] = filteredExpenses
      .filter(expense => expense.category === category)
      .reduce((sum, expense) => sum + expense.amount, 0)
    return acc
  }, {})

  const handleAddExpense = (expenseData) => {
    const expense = {
      id: Math.max(...expenses.map(e => e.id)) + 1,
      ...expenseData,
      receipt: null
    }

    setExpenses([expense, ...expenses])
    setIsAddDialogOpen(false)
  }

  const handleEditExpense = (expense) => {
    setEditingExpense(expense)
    setIsEditDialogOpen(true)
  }

  const handleUpdateExpense = (expenseData) => {
    if (!editingExpense) return

    const updatedExpense = {
      ...editingExpense,
      ...expenseData
    }

    setExpenses(expenses.map(expense => 
      expense.id === editingExpense.id ? updatedExpense : expense
    ))
    setIsEditDialogOpen(false)
    setEditingExpense(null)
  }

  const handleDeleteExpense = (id) => {
    setExpenses(expenses.filter(expense => expense.id !== id))
  }

  const getCategoryIcon = (category) => {
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

  const getCategoryColor = (category) => {
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
    return colors[category] || colors["Other"]
  }

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-6">
      {/* Header */}
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

      {/* Summary Cards */}
      <ExpenseSummary expenses={expenses} filteredExpenses={filteredExpenses} />

      {/* Filters and Search */}
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

      {/* Main Content */}
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
                  const count = filteredExpenses.filter(e => e.category === category).length
                  
                  if (total === 0) return null
                  
                  return (
                    <div key={category} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${getCategoryColor(category)}`}>
                          {getCategoryIcon(category)}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{category}</h3>
                          <p className="text-sm text-gray-500">{count} transaction{count !== 1 ? 's' : ''}</p>
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

      {/* Expense Forms */}
      <ExpenseForm
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSubmit={handleAddExpense}
        title="Add New Expense"
        description="Enter the details of your expense to track it."
      />

      <ExpenseForm
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onSubmit={handleUpdateExpense}
        initialData={editingExpense}
        title="Edit Expense"
        description="Update the details of your expense."
      />
    </div>
  )
}

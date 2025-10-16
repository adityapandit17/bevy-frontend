"use client"

import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Search, Filter } from "lucide-react"

interface ExpenseFiltersProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  selectedCategory: string
  onCategoryChange: (value: string) => void
  selectedMonth: string
  onMonthChange: (value: string) => void
  selectedPaymentMethod: string
  onPaymentMethodChange: (value: string) => void
  minAmount: string
  onMinAmountChange: (value: string) => void
  maxAmount: string
  onMaxAmountChange: (value: string) => void
}

const categories = [
  "Office", "Meals", "Transportation", "Software", "Travel", "Entertainment", 
  "Healthcare", "Education", "Utilities", "Other"
]

const paymentMethods = ["Credit Card", "Debit Card", "Cash", "Bank Transfer", "Digital Wallet"]

const months = [
  { value: "1", label: "January" },
  { value: "2", label: "February" },
  { value: "3", label: "March" },
  { value: "4", label: "April" },
  { value: "5", label: "May" },
  { value: "6", label: "June" },
  { value: "7", label: "July" },
  { value: "8", label: "August" },
  { value: "9", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" }
]

export function ExpenseFilters({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedMonth,
  onMonthChange,
  selectedPaymentMethod,
  onPaymentMethodChange,
  minAmount,
  onMinAmountChange,
  maxAmount,
  onMaxAmountChange
}: ExpenseFiltersProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search expenses by title, description, or tags..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filters Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Category Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Category</label>
              <Select value={selectedCategory} onValueChange={onCategoryChange}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Month Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Month</label>
              <Select value={selectedMonth} onValueChange={onMonthChange}>
                <SelectTrigger>
                  <SelectValue placeholder="All Months" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Months</SelectItem>
                  {months.map((month) => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Payment Method Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Payment Method</label>
              <Select value={selectedPaymentMethod} onValueChange={onPaymentMethodChange}>
                <SelectTrigger>
                  <SelectValue placeholder="All Methods" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Methods</SelectItem>
                  {paymentMethods.map((method) => (
                    <SelectItem key={method} value={method}>
                      {method}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Min Amount Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Min Amount</label>
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={minAmount}
                onChange={(e) => onMinAmountChange(e.target.value)}
              />
            </div>

            {/* Max Amount Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Max Amount</label>
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="No limit"
                value={maxAmount}
                onChange={(e) => onMaxAmountChange(e.target.value)}
              />
            </div>
          </div>

          {/* Active Filters Summary */}
          {(selectedCategory !== "all" || selectedMonth !== "all" || selectedPaymentMethod !== "all" || minAmount || maxAmount) && (
            <div className="flex items-center gap-2 pt-2 border-t">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">Active filters:</span>
              <div className="flex gap-2 flex-wrap">
                {selectedCategory !== "all" && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    Category: {selectedCategory}
                  </span>
                )}
                {selectedMonth !== "all" && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    Month: {months.find(m => m.value === selectedMonth)?.label}
                  </span>
                )}
                {selectedPaymentMethod !== "all" && (
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                    Payment: {selectedPaymentMethod}
                  </span>
                )}
                {minAmount && (
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                    Min: ${minAmount}
                  </span>
                )}
                {maxAmount && (
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                    Max: ${maxAmount}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

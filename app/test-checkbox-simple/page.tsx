"use client"

import { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"

export default function TestCheckboxSimplePage() {
  const [checked, setChecked] = useState(false)

  const handleToggle = () => {
    console.log('Checkbox clicked, current state:', checked)
    setChecked(!checked)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Simple Checkbox Test</h1>
        
        <div className="space-y-4">
          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <Checkbox
                checked={checked}
                onCheckedChange={handleToggle}
                className="mt-1"
              />
              <div>
                <h4 className="font-medium">Test Checkbox</h4>
                <p className="text-sm text-gray-600">Status: {checked ? 'checked' : 'unchecked'}</p>
              </div>
            </div>
          </div>
          
          <div className="p-4 border rounded-lg">
            <Button onClick={() => setChecked(!checked)}>
              Toggle via Button
            </Button>
            <p className="text-sm text-gray-600 mt-2">Current state: {checked.toString()}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

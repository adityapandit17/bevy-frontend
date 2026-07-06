"use client"

import { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function TestCheckboxPage() {
  const [tasks, setTasks] = useState([
    { id: 1, title: "Task 1", is_completed: true },
    { id: 2, title: "Task 2", is_completed: false },
    { id: 3, title: "Task 3", is_completed: null },
  ])

  const handleToggle = (taskId: number) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, is_completed: !task.is_completed }
        : task
    ))
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8">Checkbox Test Page</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Test Checkboxes</CardTitle>
            <CardDescription>
              Testing different checkbox states and data types
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tasks.map((task) => {
                console.log('Test task:', { id: task.id, title: task.title, is_completed: task.is_completed, type: typeof task.is_completed })
                return (
                  <div key={task.id} className="p-4 border rounded-lg">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={Boolean(task.is_completed)}
                        onCheckedChange={() => handleToggle(task.id)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <h4 className={`font-medium ${task.is_completed ? "line-through text-gray-500" : "text-gray-900"}`}>
                          {task.title}
                        </h4>
                        <p className="text-sm text-gray-600">
                          Status: {task.is_completed === null ? 'null' : task.is_completed ? 'completed' : 'pending'}
                        </p>
                        <p className="text-xs text-gray-500">
                          Type: {typeof task.is_completed} | Boolean: {Boolean(task.is_completed).toString()}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


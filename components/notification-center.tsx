"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Bell, Send, MessageSquare, Share2 } from "lucide-react"

interface NotificationTemplate {
  id: string
  name: string
  type: "event_reminder" | "vendor_update" | "guest_info" | "custom"
  message: string
}

interface ShareableInfo {
  id: string
  title: string
  content: string
  recipients: string[]
  sharedDate: string
}

export default function NotificationCenter() {
  const [templates] = useState<NotificationTemplate[]>([
    {
      id: "1",
      name: "Attendance Reminder",
      type: "event_reminder",
      message:
        "Hi {employee_name}, please remember to mark your attendance for today. Thank you!",
    },
    {
      id: "2",
      name: "Payroll Update",
      type: "vendor_update",
      message:
        "Hello, your payroll for this month has been processed. Please check your account for details.",
    },
    {
      id: "3",
      name: "HR Policy Update",
      type: "guest_info",
      message:
        "Dear {employee_name}, please review the updated HR policies effective from {date}. Let us know if you have any questions.",
    },
  ])

  const [sharedInfo] = useState<ShareableInfo[]>([
    {
      id: "1",
      title: "Employee Handbook",
      content: "Comprehensive guide on company policies, benefits, and procedures",
      recipients: ["All Employees"],
      sharedDate: "2024-06-01",
    },
    {
      id: "2",
      title: "Leave Policy Update",
      content: "Detailed overview of the revised leave policies and approval workflow",
      recipients: ["HR Team", "Department Managers"],
      sharedDate: "2024-06-05",
    },
    {
      id: "3",
      title: "Payroll Schedule",
      content: "Monthly payroll dates and cut-off times for submissions",
      recipients: ["Finance Department", "HR Team"],
      sharedDate: "2024-06-10",
    },
  ])

  const [isNotifyDialogOpen, setIsNotifyDialogOpen] = useState(false)
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState("")
  const [customMessage, setCustomMessage] = useState("")
  const [recipients, setRecipients] = useState("")
  const [shareTitle, setShareTitle] = useState("")
  const [shareContent, setShareContent] = useState("")

  const sendNotification = (type: "sms" | "whatsapp") => {
    // In a real app, this would integrate with SMS/WhatsApp APIs
    console.log(`Sending ${type} notification:`, {
      template: selectedTemplate,
      message: customMessage,
      recipients: recipients.split(",").map((r) => r.trim()),
    })

    // Reset form
    setSelectedTemplate("")
    setCustomMessage("")
    setRecipients("")
    setIsNotifyDialogOpen(false)
  }

  const shareInformation = () => {
    // In a real app, this would create shareable links or send information
    console.log("Sharing information:", {
      title: shareTitle,
      content: shareContent,
      recipients: recipients.split(",").map((r) => r.trim()),
    })

    // Reset form
    setShareTitle("")
    setShareContent("")
    setRecipients("")
    setIsShareDialogOpen(false)
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="w-80">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Bell className="h-4 w-4" />
            Quick Actions
          </CardTitle>
          <CardDescription className="text-sm">Send notifications and share information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Dialog open={isNotifyDialogOpen} onOpenChange={setIsNotifyDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full" size="sm">
                <MessageSquare className="h-4 w-4 mr-2" />
                Send Notification
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Send Notification</DialogTitle>
                <DialogDescription>Send SMS or WhatsApp messages to guests or vendors</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="template">Message Template</Label>
                  <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a template or write custom message" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                      <SelectItem value="custom">Custom Message</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    value={
                      customMessage ||
                      (selectedTemplate ? templates.find((t) => t.id === selectedTemplate)?.message : "")
                    }
                    onChange={(e) => setCustomMessage(e.target.value)}
                    placeholder="Enter your message..."
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground">
                    Use placeholders like {"{event_name}"}, {"{date}"}, {"{time}"}, {"{venue}"}, {"{guest_name}"}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="recipients">Recipients</Label>
                  <Input
                    id="recipients"
                    value={recipients}
                    onChange={(e) => setRecipients(e.target.value)}
                    placeholder="Enter phone numbers separated by commas"
                  />
                  <p className="text-xs text-muted-foreground">Example: +91 98765 43210, +91 87654 32109</p>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setIsNotifyDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => sendNotification("sms")}>
                  <Send className="h-4 w-4 mr-2" />
                  Send SMS
                </Button>
                <Button onClick={() => sendNotification("whatsapp")}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  WhatsApp
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full bg-transparent" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share Information
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Share Information</DialogTitle>
                <DialogDescription>Share wedding details with family, friends, or vendors</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="shareTitle">Title</Label>
                  <Input
                    id="shareTitle"
                    value={shareTitle}
                    onChange={(e) => setShareTitle(e.target.value)}
                    placeholder="e.g., Wedding Timeline, Vendor Contacts"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shareContent">Content</Label>
                  <Textarea
                    id="shareContent"
                    value={shareContent}
                    onChange={(e) => setShareContent(e.target.value)}
                    placeholder="Enter the information you want to share..."
                    rows={6}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shareRecipients">Share With</Label>
                  <Input
                    id="shareRecipients"
                    value={recipients}
                    onChange={(e) => setRecipients(e.target.value)}
                    placeholder="Enter email addresses or phone numbers"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setIsShareDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={shareInformation}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Information
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <div className="pt-2 border-t">
            <h4 className="text-sm font-medium mb-2">Recent Shares</h4>
            <div className="space-y-2">
              {sharedInfo.slice(0, 2).map((info) => (
                <div key={info.id} className="text-xs p-2 bg-muted rounded">
                  <p className="font-medium">{info.title}</p>
                  <p className="text-muted-foreground">Shared on {info.sharedDate}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {info.recipients.map((recipient, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {recipient}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

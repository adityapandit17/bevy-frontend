"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  MessageSquare,
  Hash,
  Users,
  User,
  Search,
  Paperclip,
  Smile,
  Send,
  MoreVertical,
  Phone,
  Video,
  Info,
  Plus,
  Lock,
} from "lucide-react"
import { cn } from "@/lib/utils"

// Mock data types
interface User {
  id: string
  name: string
  email: string
  avatar?: string
  status: "online" | "away" | "offline"
}

interface Message {
  id: string
  userId: string
  userName: string
  userAvatar?: string
  content: string
  timestamp: Date
  isEdited?: boolean
  reactions?: { emoji: string; users: string[] }[]
}

interface Channel {
  id: string
  name: string
  type: "channel" | "direct" | "group"
  unreadCount?: number
  lastMessage?: string
  lastMessageTime?: Date
  members?: User[]
  isPrivate?: boolean
}

// Mock data
const mockUsers: User[] = [
  { id: "1", name: "John Doe", email: "john@example.com", status: "online" },
  { id: "2", name: "Jane Smith", email: "jane@example.com", status: "away" },
  { id: "3", name: "Bob Johnson", email: "bob@example.com", status: "online" },
  { id: "4", name: "Alice Williams", email: "alice@example.com", status: "offline" },
]

const mockChannels: Channel[] = [
  {
    id: "general",
    name: "general",
    type: "channel",
    unreadCount: 3,
    lastMessage: "Hey everyone! How's it going?",
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 30),
  },
  {
    id: "random",
    name: "random",
    type: "channel",
    unreadCount: 0,
    lastMessage: "Check out this cool article",
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 2),
  },
  {
    id: "engineering",
    name: "engineering",
    type: "channel",
    unreadCount: 0,
    lastMessage: "The deployment was successful",
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 5),
    isPrivate: true,
  },
  {
    id: "dm-john",
    name: "John Doe",
    type: "direct",
    unreadCount: 1,
    lastMessage: "Thanks for the help!",
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 15),
    members: [mockUsers[0]],
  },
  {
    id: "dm-jane",
    name: "Jane Smith",
    type: "direct",
    unreadCount: 0,
    lastMessage: "See you tomorrow",
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 24),
    members: [mockUsers[1]],
  },
  {
    id: "team-alpha",
    name: "Team Alpha",
    type: "group",
    unreadCount: 5,
    lastMessage: "Let's schedule a meeting",
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 10),
    members: [mockUsers[0], mockUsers[1], mockUsers[2]],
  },
]

const mockMessages: Record<string, Message[]> = {
  general: [
    {
      id: "1",
      userId: "1",
      userName: "John Doe",
      content: "Welcome to the general channel!",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    },
    {
      id: "2",
      userId: "2",
      userName: "Jane Smith",
      content: "Hey everyone! How's it going?",
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
    },
    {
      id: "3",
      userId: "3",
      userName: "Bob Johnson",
      content: "All good here! Working on the new feature.",
      timestamp: new Date(Date.now() - 1000 * 60 * 25),
    },
  ],
  "dm-john": [
    {
      id: "1",
      userId: "1",
      userName: "John Doe",
      content: "Hey! Can you help me with the API integration?",
      timestamp: new Date(Date.now() - 1000 * 60 * 20),
    },
    {
      id: "2",
      userId: "current",
      userName: "You",
      content: "Sure! What do you need help with?",
      timestamp: new Date(Date.now() - 1000 * 60 * 18),
    },
    {
      id: "3",
      userId: "1",
      userName: "John Doe",
      content: "Thanks for the help!",
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
    },
  ],
  "team-alpha": [
    {
      id: "1",
      userId: "1",
      userName: "John Doe",
      content: "Team Alpha meeting scheduled for tomorrow",
      timestamp: new Date(Date.now() - 1000 * 60 * 60),
    },
    {
      id: "2",
      userId: "2",
      userName: "Jane Smith",
      content: "Let's schedule a meeting",
      timestamp: new Date(Date.now() - 1000 * 60 * 10),
    },
  ],
}

export default function ChatPage() {
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(mockChannels[0])
  const [messageInput, setMessageInput] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  const currentMessages = selectedChannel ? mockMessages[selectedChannel.id] || [] : []

  const filteredChannels = mockChannels.filter((channel) =>
    channel.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return "now"
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString()
  }

  const formatMessageTime = (date: Date) => {
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
    } else {
      return date.toLocaleDateString([], {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    }
  }

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedChannel) return
    // In a real app, this would send the message to the backend
    setMessageInput("")
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-background">
      {/* Left Sidebar - Channels/Conversations */}
      <div className="w-64 border-r border-border bg-card flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Chat</h2>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-9"
            />
          </div>
        </div>

        {/* Channels List */}
        <ScrollArea className="flex-1">
          <div className="p-2">
            {/* Channels Section */}
            <div className="mb-4">
              <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase">
                Channels
              </div>
              {filteredChannels
                .filter((ch) => ch.type === "channel")
                .map((channel) => (
                  <button
                    key={channel.id}
                    onClick={() => setSelectedChannel(channel)}
                    className={cn(
                      "w-full flex items-center gap-2 px-2 py-2 rounded-md hover:bg-accent transition-colors text-left group",
                      selectedChannel?.id === channel.id && "bg-accent"
                    )}
                  >
                    {channel.isPrivate ? (
                      <Lock className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Hash className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="flex-1 truncate font-medium">{channel.name}</span>
                    {channel.unreadCount && channel.unreadCount > 0 && (
                      <Badge variant="secondary" className="h-5 min-w-5 px-1.5 text-xs">
                        {channel.unreadCount}
                      </Badge>
                    )}
                  </button>
                ))}
            </div>

            {/* Direct Messages Section */}
            <div className="mb-4">
              <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase">
                Direct Messages
              </div>
              {filteredChannels
                .filter((ch) => ch.type === "direct")
                .map((channel) => {
                  const user = channel.members?.[0]
                  const isOnline = user?.status === "online"
                  return (
                    <button
                      key={channel.id}
                      onClick={() => setSelectedChannel(channel)}
                      className={cn(
                        "w-full flex items-center gap-2 px-2 py-2 rounded-md hover:bg-accent transition-colors text-left group",
                        selectedChannel?.id === channel.id && "bg-accent"
                      )}
                    >
                      <div className="relative">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={user?.avatar} />
                          <AvatarFallback>{user?.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        {isOnline && (
                          <div className="absolute bottom-0 right-0 h-2 w-2 bg-green-500 rounded-full border-2 border-card" />
                        )}
                      </div>
                      <span className="flex-1 truncate font-medium">{channel.name}</span>
                      {channel.unreadCount && channel.unreadCount > 0 && (
                        <Badge variant="secondary" className="h-5 min-w-5 px-1.5 text-xs">
                          {channel.unreadCount}
                        </Badge>
                      )}
                    </button>
                  )
                })}
            </div>

            {/* Group Messages Section */}
            <div className="mb-4">
              <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase">
                Groups
              </div>
              {filteredChannels
                .filter((ch) => ch.type === "group")
                .map((channel) => (
                  <button
                    key={channel.id}
                    onClick={() => setSelectedChannel(channel)}
                    className={cn(
                      "w-full flex items-center gap-2 px-2 py-2 rounded-md hover:bg-accent transition-colors text-left group",
                      selectedChannel?.id === channel.id && "bg-accent"
                    )}
                  >
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="flex-1 truncate font-medium">{channel.name}</span>
                    {channel.unreadCount && channel.unreadCount > 0 && (
                      <Badge variant="secondary" className="h-5 min-w-5 px-1.5 text-xs">
                        {channel.unreadCount}
                      </Badge>
                    )}
                  </button>
                ))}
            </div>
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedChannel ? (
          <>
            {/* Chat Header */}
            <div className="h-14 border-b border-border bg-card flex items-center justify-between px-4">
              <div className="flex items-center gap-3">
                {selectedChannel.type === "channel" && (
                  <>
                    {selectedChannel.isPrivate ? (
                      <Lock className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <Hash className="h-5 w-5 text-muted-foreground" />
                    )}
                    <h3 className="font-semibold">{selectedChannel.name}</h3>
                  </>
                )}
                {selectedChannel.type === "direct" && (
                  <>
                    <div className="relative">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={selectedChannel.members?.[0]?.avatar} />
                        <AvatarFallback>
                          {selectedChannel.members?.[0]?.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      {selectedChannel.members?.[0]?.status === "online" && (
                        <div className="absolute bottom-0 right-0 h-2.5 w-2.5 bg-green-500 rounded-full border-2 border-card" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold">{selectedChannel.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {selectedChannel.members?.[0]?.status === "online"
                          ? "Active now"
                          : selectedChannel.members?.[0]?.status === "away"
                            ? "Away"
                            : "Offline"}
                      </p>
                    </div>
                  </>
                )}
                {selectedChannel.type === "group" && (
                  <>
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <h3 className="font-semibold">{selectedChannel.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {selectedChannel.members?.length} members
                      </p>
                    </div>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2">
                {selectedChannel.type === "direct" && (
                  <>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Video className="h-4 w-4" />
                    </Button>
                  </>
                )}
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Info className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {currentMessages.map((message, index) => {
                  const showAvatar =
                    index === 0 ||
                    currentMessages[index - 1].userId !== message.userId ||
                    new Date(message.timestamp).getTime() -
                      new Date(currentMessages[index - 1].timestamp).getTime() >
                      300000 // 5 minutes

                  const isCurrentUser = message.userId === "current"

                  return (
                    <div
                      key={message.id}
                      className={cn(
                        "flex gap-3 group hover:bg-accent/50 rounded-lg p-2 -mx-2 transition-colors",
                        isCurrentUser && "flex-row-reverse"
                      )}
                    >
                      {showAvatar && (
                        <Avatar className="h-8 w-8 shrink-0">
                          <AvatarImage src={message.userAvatar} />
                          <AvatarFallback>{message.userName.charAt(0)}</AvatarFallback>
                        </Avatar>
                      )}
                      {!showAvatar && <div className="w-8 shrink-0" />}
                      <div className={cn("flex-1 min-w-0", isCurrentUser && "flex flex-col items-end")}>
                        {showAvatar && (
                          <div className={cn("flex items-center gap-2 mb-1", isCurrentUser && "flex-row-reverse")}>
                            <span className="font-semibold text-sm">{message.userName}</span>
                            <span className="text-xs text-muted-foreground">
                              {formatMessageTime(message.timestamp)}
                            </span>
                          </div>
                        )}
                        <div
                          className={cn(
                            "text-sm break-words",
                            isCurrentUser && "bg-primary text-primary-foreground rounded-lg px-3 py-2 max-w-[70%]",
                            !isCurrentUser && "text-foreground"
                          )}
                        >
                          {message.content}
                        </div>
                        {message.isEdited && (
                          <span className="text-xs text-muted-foreground mt-1">(edited)</span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="border-t border-border bg-card p-4">
              <div className="flex items-end gap-2">
                <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <div className="flex-1 relative">
                  <Input
                    placeholder={`Message ${selectedChannel.name}...`}
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage()
                      }
                    }}
                    className="pr-10"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                  >
                    <Smile className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  onClick={handleSendMessage}
                  size="icon"
                  className="h-9 w-9 shrink-0"
                  disabled={!messageInput.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Select a conversation</h3>
              <p className="text-sm text-muted-foreground">
                Choose a channel or direct message to start chatting
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Right Sidebar - Channel Info (Optional, can be toggled) */}
      {selectedChannel && (
        <div className="w-64 border-l border-border bg-card p-4">
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold mb-3">About</h4>
              {selectedChannel.type === "channel" && (
                <div className="space-y-2 text-sm">
                  <p className="text-muted-foreground">
                    {selectedChannel.isPrivate ? "Private channel" : "Public channel"}
                  </p>
                  <p className="text-muted-foreground">
                    Topic: General discussions and announcements
                  </p>
                </div>
              )}
              {selectedChannel.type === "direct" && (
                <div className="space-y-2 text-sm">
                  <p className="text-muted-foreground">
                    {selectedChannel.members?.[0]?.email}
                  </p>
                  <p className="text-muted-foreground">
                    Status: {selectedChannel.members?.[0]?.status}
                  </p>
                </div>
              )}
              {selectedChannel.type === "group" && (
                <div className="space-y-2 text-sm">
                  <p className="text-muted-foreground">
                    {selectedChannel.members?.length} members
                  </p>
                </div>
              )}
            </div>

            {(selectedChannel.type === "group" || selectedChannel.type === "channel") && (
              <div>
                <h4 className="font-semibold mb-3">Members</h4>
                <div className="space-y-2">
                  {selectedChannel.members?.map((member) => (
                    <div key={member.id} className="flex items-center gap-2">
                      <div className="relative">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={member.avatar} />
                          <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        {member.status === "online" && (
                          <div className="absolute bottom-0 right-0 h-2.5 w-2.5 bg-green-500 rounded-full border-2 border-card" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{member.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

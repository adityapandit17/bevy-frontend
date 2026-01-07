"use client"

import { useState, useEffect, useRef } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  MessageSquare,
  Hash,
  Users,
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
  Loader2,
  UserPlus,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { chatApi, ChatCable, Channel, Message } from "@/lib/chat"
import { useAuthContext } from "@/lib/auth"
import { apiRequest, getApiUrl } from "@/lib/api"
import { toast } from "@/hooks/use-toast"

interface User {
  id: number
  name: string
  email: string
}

export default function ChatPage() {
  const { user: currentUser } = useAuthContext()
  const [channels, setChannels] = useState<Channel[]>([])
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [messageInput, setMessageInput] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [cable] = useState(() => new ChatCable())
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Dialog states
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [createChannelType, setCreateChannelType] = useState<"channel" | "direct" | "group">("channel")
  const [newChannelName, setNewChannelName] = useState("")
  const [newChannelDescription, setNewChannelDescription] = useState("")
  const [isPrivate, setIsPrivate] = useState(false)
  const [selectedUsers, setSelectedUsers] = useState<number[]>([])
  const [availableUsers, setAvailableUsers] = useState<User[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [creating, setCreating] = useState(false)

  // Emoji picker state
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)

  // Common emojis
  const commonEmojis = [
    "😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣",
    "😊", "😇", "🙂", "🙃", "😉", "😌", "😍", "🥰",
    "😘", "😗", "😙", "😚", "😋", "😛", "😝", "😜",
    "🤪", "🤨", "🧐", "🤓", "😎", "🤩", "🥳", "😏",
    "😒", "😞", "😔", "😟", "😕", "🙁", "☹️", "😣",
    "😖", "😫", "😩", "🥺", "😢", "😭", "😤", "😠",
    "👍", "👎", "👌", "✌️", "🤞", "🤟", "🤘", "👏",
    "🙌", "👐", "🤲", "🤝", "🙏", "💪", "❤️", "💛",
    "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔", "❣️",
    "💕", "💞", "💓", "💗", "💖", "💘", "💝", "💟",
  ]

  // Load channels on mount
  useEffect(() => {
    loadChannels()
    // Connect to ActionCable after a short delay to ensure token is available
    const connectTimer = setTimeout(() => {
      try {
        cable.connect()
      } catch (error) {
        console.warn('Failed to connect to ActionCable:', error)
      }
    }, 500)
    
    return () => {
      clearTimeout(connectTimer)
      cable.disconnect()
    }
  }, [])

  // Subscribe to channel updates when channel is selected
  useEffect(() => {
    if (selectedChannel) {
      loadMessages(selectedChannel.id)
      
      // Subscribe to real-time updates (may fail silently if ActionCable not available)
      const subscription = cable.subscribeToChannel(selectedChannel.id, (message: Message) => {
        setMessages((prev) => {
          // Avoid duplicates - check by id
          if (prev.some((m) => m.id === message.id && m.channel_id === message.channel_id)) {
            return prev
          }
          return [...prev, message]
        })
        scrollToBottom()
      })
      
      return () => {
        if (subscription) {
          cable.unsubscribeFromChannel(selectedChannel.id)
        }
      }
    }
  }, [selectedChannel])

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Load users when create dialog opens
  useEffect(() => {
    if (showCreateDialog && (createChannelType === "direct" || createChannelType === "group")) {
      loadUsers()
    }
  }, [showCreateDialog, createChannelType])

  const loadChannels = async () => {
    try {
      setLoading(true)
      const data = await chatApi.getChannels()
      setChannels(data)
      if (data.length > 0 && !selectedChannel) {
        setSelectedChannel(data[0])
      }
    } catch (error) {
      console.error("Failed to load channels:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadMessages = async (channelId: number) => {
    try {
      const data = await chatApi.getMessages(channelId)
      // Remove duplicates based on message id
      const uniqueMessages = data.messages.filter((msg, idx, self) =>
        idx === self.findIndex((m) => m.id === msg.id)
      )
      setMessages(uniqueMessages)
    } catch (error) {
      console.error("Failed to load messages:", error)
    }
  }

  const loadUsers = async () => {
    try {
      setLoadingUsers(true)
      const response = await apiRequest<{ users: User[] } | User[]>(getApiUrl("users"))
      const users = Array.isArray(response) ? response : (response as any).users || []
      // Filter out current user
      const filtered = users.filter((u: User) => u.id !== currentUser?.id)
      setAvailableUsers(filtered)
    } catch (error) {
      console.error("Failed to load users:", error)
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      })
    } finally {
      setLoadingUsers(false)
    }
  }

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedChannel || sending) return

    try {
      setSending(true)
      const newMessage = await chatApi.sendMessage(selectedChannel.id, messageInput.trim())
      setMessages((prev) => [...prev, newMessage])
      setMessageInput("")
      scrollToBottom()
    } catch (error) {
      console.error("Failed to send message:", error)
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      })
    } finally {
      setSending(false)
    }
  }

  const handleCreateChannel = async () => {
    if (!newChannelName.trim()) {
      toast({
        title: "Error",
        description: "Channel name is required",
        variant: "destructive",
      })
      return
    }

    if ((createChannelType === "direct" || createChannelType === "group") && selectedUsers.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one user",
        variant: "destructive",
      })
      return
    }

    try {
      setCreating(true)

      if (createChannelType === "direct") {
        // Create direct message channel
        const channel = await chatApi.createDirectChannel({ user_id: selectedUsers[0] })
        setChannels((prev) => [channel, ...prev])
        setSelectedChannel(channel)
        setShowCreateDialog(false)
        resetCreateDialog()
        toast({
          title: "Success",
          description: "Direct message created",
        })
      } else {
        // Create channel or group
        const channel = await chatApi.createChannel({
          name: newChannelName.trim(),
          channel_type: createChannelType,
          is_private: isPrivate,
          description: newChannelDescription.trim() || undefined,
          user_ids: selectedUsers,
        })
        setChannels((prev) => [channel, ...prev])
        setSelectedChannel(channel)
        setShowCreateDialog(false)
        resetCreateDialog()
        toast({
          title: "Success",
          description: `${createChannelType === "channel" ? "Channel" : "Group"} created successfully`,
        })
      }
    } catch (error: any) {
      console.error("Failed to create channel:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to create channel",
        variant: "destructive",
      })
    } finally {
      setCreating(false)
    }
  }

  const resetCreateDialog = () => {
    setNewChannelName("")
    setNewChannelDescription("")
    setIsPrivate(false)
    setSelectedUsers([])
    setCreateChannelType("channel")
  }

  const toggleUserSelection = (userId: number) => {
    setSelectedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    )
  }

  const insertEmoji = (emoji: string) => {
    setMessageInput((prev) => prev + emoji)
    setShowEmojiPicker(false)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      // For now, just show a toast - file upload will be implemented later
      toast({
        title: "File Attachment",
        description: `Selected ${files.length} file(s). File upload will be available soon.`,
      })
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
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

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString)
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

  const filteredChannels = channels.filter((channel) => {
    const searchLower = searchQuery.toLowerCase()
    const nameMatch = channel.name.toLowerCase().includes(searchLower)
    const memberMatch = channel.members.some((m) =>
      m.name.toLowerCase().includes(searchLower) || m.email.toLowerCase().includes(searchLower)
    )
    return nameMatch || memberMatch
  })

  const getChannelDisplayName = (channel: Channel) => {
    if (channel.channel_type === "direct") {
      // For direct messages, show the other user's name
      const otherMember = channel.members.find((m) => m.id !== currentUser?.id)
      return otherMember?.name || channel.name
    }
    return channel.name
  }

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-background">
      {/* Left Sidebar - Channels/Conversations */}
      <div className="w-64 border-r border-border bg-card flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Chat</h2>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setShowCreateDialog(true)}
            >
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
            {filteredChannels.filter((ch) => ch.channel_type === "channel").length > 0 && (
              <div key="channels-section" className="mb-4">
                <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase">
                  Channels
                </div>
                {filteredChannels
                  .filter((ch) => ch.channel_type === "channel")
                  .map((channel) => (
                    <button
                      key={`channel-${channel.id}`}
                      onClick={() => setSelectedChannel(channel)}
                      className={cn(
                        "w-full flex items-center gap-2 px-2 py-2 rounded-md hover:bg-accent transition-colors text-left group",
                        selectedChannel?.id === channel.id && "bg-accent"
                      )}
                    >
                      {channel.is_private ? (
                        <Lock className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Hash className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="flex-1 truncate font-medium">{channel.name}</span>
                      {channel.unread_count > 0 && (
                        <Badge variant="secondary" className="h-5 min-w-5 px-1.5 text-xs">
                          {channel.unread_count}
                        </Badge>
                      )}
                    </button>
                  ))}
              </div>
            )}

            {/* Direct Messages Section */}
            {filteredChannels.filter((ch) => ch.channel_type === "direct").length > 0 && (
              <div key="direct-messages-section" className="mb-4">
                <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase">
                  Direct Messages
                </div>
                {filteredChannels
                  .filter((ch) => ch.channel_type === "direct")
                  .map((channel) => {
                    const otherMember = channel.members.find((m) => m.id !== currentUser?.id)
                    return (
                      <button
                        key={`direct-${channel.id}`}
                        onClick={() => setSelectedChannel(channel)}
                        className={cn(
                          "w-full flex items-center gap-2 px-2 py-2 rounded-md hover:bg-accent transition-colors text-left group",
                          selectedChannel?.id === channel.id && "bg-accent"
                        )}
                      >
                        <Avatar className="h-6 w-6">
                          <AvatarFallback>
                            {getChannelDisplayName(channel).charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="flex-1 truncate font-medium">
                          {getChannelDisplayName(channel)}
                        </span>
                        {channel.unread_count > 0 && (
                          <Badge variant="secondary" className="h-5 min-w-5 px-1.5 text-xs">
                            {channel.unread_count}
                          </Badge>
                        )}
                      </button>
                    )
                  })}
              </div>
            )}

            {/* Group Messages Section */}
            {filteredChannels.filter((ch) => ch.channel_type === "group").length > 0 && (
              <div key="groups-section" className="mb-4">
                <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase">
                  Groups
                </div>
                {filteredChannels
                  .filter((ch) => ch.channel_type === "group")
                  .map((channel) => (
                    <button
                      key={`group-${channel.id}`}
                      onClick={() => setSelectedChannel(channel)}
                      className={cn(
                        "w-full flex items-center gap-2 px-2 py-2 rounded-md hover:bg-accent transition-colors text-left group",
                        selectedChannel?.id === channel.id && "bg-accent"
                      )}
                    >
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="flex-1 truncate font-medium">{channel.name}</span>
                      {channel.unread_count > 0 && (
                        <Badge variant="secondary" className="h-5 min-w-5 px-1.5 text-xs">
                          {channel.unread_count}
                        </Badge>
                      )}
                    </button>
                  ))}
              </div>
            )}

            {filteredChannels.length === 0 && searchQuery && (
              <div key="no-results" className="text-center py-8 text-sm text-muted-foreground">
                No conversations found
              </div>
            )}
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
                {selectedChannel.channel_type === "channel" && (
                  <>
                    {selectedChannel.is_private ? (
                      <Lock className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <Hash className="h-5 w-5 text-muted-foreground" />
                    )}
                    <h3 className="font-semibold">{selectedChannel.name}</h3>
                  </>
                )}
                {selectedChannel.channel_type === "direct" && (
                  <>
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {getChannelDisplayName(selectedChannel).charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{getChannelDisplayName(selectedChannel)}</h3>
                      <p className="text-xs text-muted-foreground">Direct message</p>
                    </div>
                  </>
                )}
                {selectedChannel.channel_type === "group" && (
                  <>
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <h3 className="font-semibold">{selectedChannel.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {selectedChannel.members_count} members
                      </p>
                    </div>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2">
                {selectedChannel.channel_type === "direct" && (
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
            <ScrollArea className="flex-1" ref={messagesContainerRef}>
              <div className="p-4 space-y-4">
                {messages.map((message, index) => {
                  // Safely get user name with fallback
                  const userName = message.user_name || message.user_email?.split('@')[0] || "Unknown User"
                  const userEmail = message.user_email || ""
                  
                  const showAvatar =
                    index === 0 ||
                    !messages[index - 1] ||
                    messages[index - 1].user_id !== message.user_id ||
                    (message.created_at && messages[index - 1].created_at &&
                      new Date(message.created_at).getTime() -
                        new Date(messages[index - 1].created_at).getTime() >
                        300000) // 5 minutes

                  const isCurrentUser = message.user_id === currentUser?.id

                  // Ensure unique key - combine channel_id, id, and index for uniqueness
                  // Use index as part of key to ensure uniqueness even if IDs are duplicated
                  const messageKey = `message-${message.channel_id || selectedChannel?.id || 'unknown'}-${message.id || index}-${index}`

                  return (
                    <div
                      key={messageKey}
                      className={cn(
                        "flex gap-3 group hover:bg-accent/50 rounded-lg p-2 -mx-2 transition-colors",
                        isCurrentUser && "flex-row-reverse"
                      )}
                    >
                      {showAvatar && (
                        <Avatar className="h-8 w-8 shrink-0">
                          <AvatarFallback>
                            {(message.user_name || message.user_email || "U").charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      {!showAvatar && <div className="w-8 shrink-0" />}
                      <div
                        className={cn(
                          "flex-1 min-w-0",
                          isCurrentUser && "flex flex-col items-end"
                        )}
                      >
                        {showAvatar && (
                          <div
                            className={cn(
                              "flex items-center gap-2 mb-1",
                              isCurrentUser && "flex-row-reverse"
                            )}
                          >
                            <span className="font-semibold text-sm">
                              {message.user_name || message.user_email || "Unknown User"}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {message.created_at ? formatMessageTime(message.created_at) : ""}
                            </span>
                          </div>
                        )}
                        <div
                          className={cn(
                            "text-sm break-words",
                            isCurrentUser &&
                              "bg-primary text-primary-foreground rounded-lg px-3 py-2 max-w-[70%]",
                            !isCurrentUser && "text-foreground"
                          )}
                        >
                          {message.content || ""}
                        </div>
                        {message.edited_at && (
                          <span className="text-xs text-muted-foreground mt-1">(edited)</span>
                        )}
                      </div>
                    </div>
                  )
                })}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="border-t border-border bg-card p-4">
              <div className="flex items-end gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  className="hidden"
                  multiple
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 shrink-0"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
                <div className="flex-1 relative">
                  <Input
                    placeholder={`Message ${getChannelDisplayName(selectedChannel)}...`}
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage()
                      }
                    }}
                    className="pr-10"
                    disabled={sending}
                  />
                  <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                      >
                        <Smile className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-2" align="end">
                      <div className="grid grid-cols-8 gap-1 max-h-64 overflow-y-auto">
                        {commonEmojis.map((emoji, idx) => (
                          <button
                            key={`emoji-${idx}-${emoji}`}
                            onClick={() => insertEmoji(emoji)}
                            className="text-2xl hover:bg-accent rounded p-1 transition-colors"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
                <Button
                  onClick={handleSendMessage}
                  size="icon"
                  className="h-9 w-9 shrink-0"
                  disabled={!messageInput.trim() || sending}
                >
                  {sending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
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

      {/* Right Sidebar - Channel Info */}
      {selectedChannel && (
        <div className="w-64 border-l border-border bg-card p-4">
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold mb-3">About</h4>
              {selectedChannel.channel_type === "channel" && (
                <div className="space-y-2 text-sm">
                  <p className="text-muted-foreground">
                    {selectedChannel.is_private ? "Private channel" : "Public channel"}
                  </p>
                  {selectedChannel.description && (
                    <p className="text-muted-foreground">{selectedChannel.description}</p>
                  )}
                </div>
              )}
              {selectedChannel.channel_type === "direct" && (
                <div className="space-y-2 text-sm">
                  <p className="text-muted-foreground">Direct message</p>
                </div>
              )}
              {selectedChannel.channel_type === "group" && (
                <div className="space-y-2 text-sm">
                  <p className="text-muted-foreground">
                    {selectedChannel.members_count} members
                  </p>
                </div>
              )}
            </div>

            {(selectedChannel.channel_type === "group" ||
              selectedChannel.channel_type === "channel") && (
              <div>
                <h4 className="font-semibold mb-3">Members</h4>
                <div className="space-y-2">
                  {selectedChannel.members.map((member) => (
                    <div key={member.id} className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                      </Avatar>
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

      {/* Create Channel/Conversation Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Conversation</DialogTitle>
            <DialogDescription>
              Create a new channel, group, or start a direct message
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Channel Type Selection */}
            <div className="space-y-2">
              <Label>Type</Label>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  type="button"
                  variant={createChannelType === "channel" ? "default" : "outline"}
                  onClick={() => setCreateChannelType("channel")}
                  className="w-full"
                >
                  <Hash className="h-4 w-4 mr-2" />
                  Channel
                </Button>
                <Button
                  type="button"
                  variant={createChannelType === "direct" ? "default" : "outline"}
                  onClick={() => setCreateChannelType("direct")}
                  className="w-full"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Direct
                </Button>
                <Button
                  type="button"
                  variant={createChannelType === "group" ? "default" : "outline"}
                  onClick={() => setCreateChannelType("group")}
                  className="w-full"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Group
                </Button>
              </div>
            </div>

            {/* Channel Name */}
            <div className="space-y-2">
              <Label htmlFor="channel-name">
                {createChannelType === "direct" ? "Select User" : "Name"}
              </Label>
              {createChannelType === "direct" ? (
                <ScrollArea className="h-48 border rounded-md p-2">
                  {loadingUsers ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {availableUsers.map((user) => (
                        <button
                          key={user.id}
                          type="button"
                          onClick={() => {
                            setSelectedUsers([user.id])
                            setNewChannelName(user.name)
                          }}
                          className={cn(
                            "w-full flex items-center gap-2 p-2 rounded-md hover:bg-accent transition-colors text-left",
                            selectedUsers.includes(user.id) && "bg-accent"
                          )}
                        >
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{user.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              ) : (
                <Input
                  id="channel-name"
                  placeholder="Enter channel name"
                  value={newChannelName}
                  onChange={(e) => setNewChannelName(e.target.value)}
                />
              )}
            </div>

            {/* Description (for channels and groups) */}
            {createChannelType !== "direct" && (
              <div className="space-y-2">
                <Label htmlFor="channel-description">Description (optional)</Label>
                <Textarea
                  id="channel-description"
                  placeholder="Enter channel description"
                  value={newChannelDescription}
                  onChange={(e) => setNewChannelDescription(e.target.value)}
                  rows={3}
                />
              </div>
            )}

            {/* Privacy Toggle (for channels) */}
            {createChannelType === "channel" && (
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is-private"
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="is-private" className="cursor-pointer">
                  Make this a private channel
                </Label>
              </div>
            )}

            {/* User Selection (for groups) */}
            {createChannelType === "group" && (
              <div className="space-y-2">
                <Label>Add Members</Label>
                <ScrollArea className="h-48 border rounded-md p-2">
                  {loadingUsers ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {availableUsers.map((user) => (
                        <button
                          key={user.id}
                          type="button"
                          onClick={() => toggleUserSelection(user.id)}
                          className={cn(
                            "w-full flex items-center gap-2 p-2 rounded-md hover:bg-accent transition-colors text-left",
                            selectedUsers.includes(user.id) && "bg-accent"
                          )}
                        >
                          <Checkbox
                            checked={selectedUsers.includes(user.id)}
                            onCheckedChange={() => toggleUserSelection(user.id)}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{user.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowCreateDialog(false)
              resetCreateDialog()
            }}>
              Cancel
            </Button>
            <Button onClick={handleCreateChannel} disabled={creating}>
              {creating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

"use client"

import { useState, useEffect, useRef, useCallback } from "react"
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
  Mic,
  MicOff,
  PhoneOff,
  ChevronUp,
  ChevronDown,
  X,
  Trash2,
  ArrowLeft,
  Pencil,
  Globe,
  FileText,
  Download,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/components/ui/use-mobile"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { chatApi, ChatCable, Channel, Message } from "@/lib/chat"
import { useAuthContext } from "@/lib/auth"
import { apiRequest, getApiUrl, getDocumentUrl } from "@/lib/api"
import { toast } from "@/hooks/use-toast"
import { useCallContext } from "@/providers/call-provider"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000'
import { huddleApi, Huddle, HuddleWebRTC } from "@/lib/huddle"

interface User {
  id: number
  name: string
  email: string
}

export default function ChatPage() {
  const { user: currentUser, checkRole } = useAuthContext()
  const isMobile = useIsMobile()
  const [mobileView, setMobileView] = useState<"list" | "chat">("list")
  const [showChannelInfo, setShowChannelInfo] = useState(false)
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

  // Add members dialog state
  const [showAddMembersDialog, setShowAddMembersDialog] = useState(false)
  const [selectedMembersToAdd, setSelectedMembersToAdd] = useState<number[]>([])
  const [addingMembers, setAddingMembers] = useState(false)

  // Delete channel dialog state
  const [showDeleteChannelDialog, setShowDeleteChannelDialog] = useState(false)
  const [deletingChannel, setDeletingChannel] = useState(false)

  // Rename channel dialog state
  const [showRenameDialog, setShowRenameDialog] = useState(false)
  const [renameValue, setRenameValue] = useState("")
  const [renamingChannel, setRenamingChannel] = useState(false)
  const [togglingPrivacy, setTogglingPrivacy] = useState(false)
  const [uploadingFile, setUploadingFile] = useState(false)

  // Emoji picker state
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)

  // Huddle state
  const [activeHuddle, setActiveHuddle] = useState<Huddle | null>(null)
  const [huddleWebRTC, setHuddleWebRTC] = useState<HuddleWebRTC | null>(null)
  const [isInHuddle, setIsInHuddle] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoEnabled, setIsVideoEnabled] = useState(true)
  const [huddleLoading, setHuddleLoading] = useState(false)
  const [huddlePanelExpanded, setHuddlePanelExpanded] = useState(false)
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRefs = useRef<Map<number, HTMLVideoElement>>(new Map())

  const selectChannel = useCallback(
    (channel: Channel, options?: { openChat?: boolean }) => {
      setSelectedChannel(channel)
      if (isMobile && (options?.openChat ?? true)) {
        setMobileView("chat")
      }
    },
    [isMobile]
  )

  const handleMobileBack = () => {
    setMobileView("list")
  }

  // WebRTC Call state from global provider (notifications work app-wide)
  const {
    callManager,
    currentCall,
    remoteStream,
    callDuration,
    callMuted,
    acceptingCall,
    setCallEventSink,
    startCall: startCallFromContext,
    acceptCall,
    rejectCall,
    endCall,
    toggleCallMute,
    formatDuration,
  } = useCallContext()

  // Register call event sink so we can post call history to the current channel when on chat
  useEffect(() => {
    if (!selectedChannel) {
      setCallEventSink(null)
      return
    }
    setCallEventSink({
      onCallAccepted: async ({ otherUser }) => {
        try {
          await chatApi.sendMessage(
            selectedChannel.id,
            `📞 Call from ${otherUser.name} was answered`
          )
        } catch (e) {
          console.error('Failed to create call history message:', e)
        }
      },
      onCallRejected: async ({ otherUser, rejectedByThem }) => {
        try {
          const text = rejectedByThem
            ? `📞 Call to ${otherUser.name} was declined`
            : `📞 Call from ${otherUser.name} was declined`
          await chatApi.sendMessage(selectedChannel.id, text)
        } catch (e) {
          console.error('Failed to create call history message:', e)
        }
      },
      onCallEnded: async ({ otherUser, duration }) => {
        const durationText = formatDuration(duration ?? 0)
        try {
          await chatApi.sendMessage(
            selectedChannel.id,
            `📞 Call with ${otherUser.name} ended (Duration: ${durationText})`
          )
        } catch (e) {
          console.error('Failed to create call history message:', e)
        }
      },
    })
    return () => setCallEventSink(null)
  }, [selectedChannel, setCallEventSink, formatDuration])

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
      // Clean up huddle on unmount
      if (huddleWebRTC) {
        huddleWebRTC.disconnect()
      }
      // Call state is global (CallProvider); do not end call on chat unmount
    }
  }, [])

  // Load active huddle when channel changes
  useEffect(() => {
    if (selectedChannel) {
      loadActiveHuddle()
    } else {
      setActiveHuddle(null)
      setIsInHuddle(false)
    }
  }, [selectedChannel])

  // Subscribe to huddle updates via ActionCable
  useEffect(() => {
    if (!selectedChannel) return

    const subscription = cable.subscribeToChannel(selectedChannel.id, (data: any) => {
      if (data.type === 'huddle_started' || data.type === 'huddle_updated') {
        setActiveHuddle(data.huddle)
        // If current user is a participant, join WebRTC
        const isParticipant = data.huddle.participants.some((p: any) => p.id === currentUser?.id)
        if (isParticipant && !isInHuddle) {
          joinHuddleWebRTC(data.huddle)
        } else if (!isParticipant && isInHuddle) {
          // User was removed from huddle
          leaveHuddle()
        }
      } else if (data.type === 'huddle_ended') {
        if (activeHuddle?.id === data.huddle_id) {
          leaveHuddle()
        }
      }
    })

    return () => {
      if (subscription) {
        cable.unsubscribeFromChannel(selectedChannel.id)
      }
    }
  }, [selectedChannel, currentUser])

  // Subscribe to channel updates when channel is selected
  useEffect(() => {
    if (selectedChannel) {
      loadMessages(selectedChannel.id)
      
      // Subscribe to real-time updates (may fail silently if ActionCable not available)
      const subscription = cable.subscribeToChannel(selectedChannel.id, {
        onMessage: (message: Message) => {
          if (message.channel_id !== selectedChannel.id) return

          setMessages((prev) => {
            if (prev.some((m) => m.id === message.id && m.channel_id === message.channel_id)) {
              return prev
            }
            return [...prev, message].sort(
              (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            )
          })
          scrollToBottom()
        },
        onChannelUpdated: (channelId) => {
          if (channelId === selectedChannel.id) {
            loadChannels()
          }
        },
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

  // Load users when add members dialog opens
  useEffect(() => {
    if (showAddMembersDialog) {
      loadUsers()
    }
  }, [showAddMembersDialog])

  // Attach local video stream when huddleWebRTC is initialized
  useEffect(() => {
    if (huddleWebRTC && localVideoRef.current) {
      const localStream = huddleWebRTC.getLocalStream()
      if (localStream && localVideoRef.current) {
        localVideoRef.current.srcObject = localStream
        setIsVideoEnabled(huddleWebRTC.isVideoEnabled())
      }
    }
  }, [huddleWebRTC])

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
      const users = await chatApi.getDirectoryUsers()
      setAvailableUsers(users as User[])
    } catch (error) {
      console.error("Failed to load users:", error)
      toast({
        title: "Error",
        description: "Failed to load colleagues for chat",
        variant: "destructive",
      })
    } finally {
      setLoadingUsers(false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const appendMessage = useCallback((message: Message) => {
    setMessages((prev) => {
      if (prev.some((m) => m.id === message.id && m.channel_id === message.channel_id)) {
        return prev
      }
      return [...prev, message].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      )
    })
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedChannel || sending) return

    const messageContent = messageInput.trim()
    setMessageInput("")

    try {
      setSending(true)
      const sent = await chatApi.sendMessage(selectedChannel.id, messageContent)
      // Always show the API response (works when WebSocket is down in production)
      appendMessage(sent)
    } catch (error) {
      console.error("Failed to send message:", error)
      setMessageInput(messageContent)
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
        selectChannel(channel)
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
        selectChannel(channel)
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

  const toggleMemberSelection = (userId: number) => {
    setSelectedMembersToAdd((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    )
  }

  const handleAddMembers = async () => {
    if (!selectedChannel || selectedMembersToAdd.length === 0 || addingMembers) return

    try {
      setAddingMembers(true)
      const updatedChannel = await chatApi.addMembers(selectedChannel.id, selectedMembersToAdd)
      
      // Update the channel in the list
      setChannels((prev) =>
        prev.map((ch) => (ch.id === updatedChannel.id ? updatedChannel : ch))
      )
      
      // Update selected channel if it's the current one
      if (selectedChannel.id === updatedChannel.id) {
        setSelectedChannel(updatedChannel)
      }

      setShowAddMembersDialog(false)
      setSelectedMembersToAdd([])
      toast({
        title: "Success",
        description: `${selectedMembersToAdd.length} member(s) added successfully`,
      })
    } catch (error: any) {
      console.error("Failed to add members:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to add members",
        variant: "destructive",
      })
    } finally {
      setAddingMembers(false)
    }
  }

  const canManageSelectedChannel =
    selectedChannel &&
    selectedChannel.channel_type !== "direct" &&
    (selectedChannel.created_by.id === currentUser?.id || checkRole("Super Admin"))

  const updateChannelInState = (updated: Channel) => {
    setChannels((prev) => prev.map((ch) => (ch.id === updated.id ? updated : ch)))
    setSelectedChannel(updated)
  }

  const handleRenameChannel = async () => {
    if (!selectedChannel || !renameValue.trim() || renamingChannel) return

    try {
      setRenamingChannel(true)
      const updated = await chatApi.updateChannel(selectedChannel.id, {
        name: renameValue.trim(),
      })
      updateChannelInState(updated)
      setShowRenameDialog(false)
      toast({
        title: "Renamed",
        description: `Channel is now "${updated.name}".`,
      })
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to rename channel"
      toast({ title: "Error", description: message, variant: "destructive" })
    } finally {
      setRenamingChannel(false)
    }
  }

  const handleTogglePrivacy = async () => {
    if (!selectedChannel || selectedChannel.channel_type !== "channel" || togglingPrivacy) return

    try {
      setTogglingPrivacy(true)
      const updated = await chatApi.updateChannel(selectedChannel.id, {
        is_private: !selectedChannel.is_private,
      })
      updateChannelInState(updated)
      toast({
        title: updated.is_private ? "Channel is now private" : "Channel is now public",
        description: updated.is_private
          ? "Only invited members can see this channel."
          : "All workspace members can discover this channel.",
      })
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to update channel privacy"
      toast({ title: "Error", description: message, variant: "destructive" })
    } finally {
      setTogglingPrivacy(false)
    }
  }

  const handleDeleteChannel = async () => {
    if (!selectedChannel || deletingChannel) return

    try {
      setDeletingChannel(true)
      await chatApi.deleteChannel(selectedChannel.id)
      setChannels((prev) => prev.filter((ch) => ch.id !== selectedChannel.id))
      setSelectedChannel(null)
      setMessages([])
      if (isMobile) setMobileView("list")
      setShowDeleteChannelDialog(false)
      toast({
        title: "Channel deleted",
        description: `"${selectedChannel.name}" has been removed.`,
      })
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to delete channel"
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      })
    } finally {
      setDeletingChannel(false)
    }
  }

  const insertEmoji = (emoji: string) => {
    setMessageInput((prev) => prev + emoji)
    setShowEmojiPicker(false)
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    if (!file || !selectedChannel || uploadingFile || sending) return

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Maximum file size is 5MB.",
        variant: "destructive",
      })
      return
    }

    try {
      setUploadingFile(true)
      const upload = await chatApi.uploadFile(file)
      const caption = messageInput.trim()
      const sent = await chatApi.sendMessage(selectedChannel.id, caption, {
        attachment_path: upload.path,
        attachment_filename: upload.filename,
        attachment_content_type: upload.content_type,
      })
      setMessageInput("")
      appendMessage(sent)
      toast({
        title: "File shared",
        description: upload.filename,
      })
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to upload file"
      toast({
        title: "Upload failed",
        description: message,
        variant: "destructive",
      })
    } finally {
      setUploadingFile(false)
    }
  }

  const renderMessageBody = (message: Message, isCurrentUser: boolean) => {
    const isImage = message.attachment_content_type?.startsWith("image/")
    const fileUrl = message.attachment_path ? getDocumentUrl(message.attachment_path) : ""

    return (
      <div className="space-y-2">
        {message.content?.trim() && (
          <div>{message.content}</div>
        )}
        {message.attachment_path && (
          <div className={cn(isCurrentUser ? "text-primary-foreground" : "text-foreground")}>
            {isImage ? (
              <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="block">
                <img
                  src={fileUrl}
                  alt={message.attachment_filename || "Attachment"}
                  className="max-w-full sm:max-w-xs rounded-md border border-border/50"
                />
              </a>
            ) : (
              <a
                href={getDocumentUrl(message.attachment_path, true)}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:opacity-90",
                  isCurrentUser
                    ? "border-primary-foreground/30 bg-primary-foreground/10"
                    : "border-border bg-muted"
                )}
              >
                <FileText className="h-4 w-4 shrink-0" />
                <span className="truncate max-w-[200px]">
                  {message.attachment_filename || "Download file"}
                </span>
                <Download className="h-4 w-4 shrink-0" />
              </a>
            )}
          </div>
        )}
      </div>
    )
  }

  // Huddle functions
  const loadActiveHuddle = async () => {
    if (!selectedChannel) return

    try {
      const huddles = await huddleApi.getHuddles(selectedChannel.id)
      const active = huddles.find((h) => h.status === 'active')
      if (active) {
        setActiveHuddle(active)
        // Check if current user is a participant
        const isParticipant = active.participants.some((p) => p.id === currentUser?.id)
        if (isParticipant && !isInHuddle) {
          await joinHuddleWebRTC(active)
        }
      } else {
        setActiveHuddle(null)
        setIsInHuddle(false)
      }
    } catch (error) {
      console.error("Failed to load huddles:", error)
    }
  }

  const startHuddle = async () => {
    if (!selectedChannel || huddleLoading) return

    try {
      setHuddleLoading(true)
      const huddle = await huddleApi.startHuddle(selectedChannel.id)
      setActiveHuddle(huddle)
      await joinHuddleWebRTC(huddle)
      toast({
        title: "Huddle Started",
        description: "Voice call is now active",
      })
    } catch (error: any) {
      console.error("Failed to start huddle:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to start huddle",
        variant: "destructive",
      })
    } finally {
      setHuddleLoading(false)
    }
  }

  const joinHuddle = async () => {
    if (!selectedChannel || !activeHuddle || huddleLoading) return

    try {
      setHuddleLoading(true)
      const huddle = await huddleApi.joinHuddle(selectedChannel.id, activeHuddle.id)
      setActiveHuddle(huddle)
      await joinHuddleWebRTC(huddle)
      toast({
        title: "Joined Huddle",
        description: "You're now in the voice call",
      })
    } catch (error: any) {
      console.error("Failed to join huddle:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to join huddle",
        variant: "destructive",
      })
    } finally {
      setHuddleLoading(false)
    }
  }

  const joinHuddleWebRTC = async (huddle: Huddle, enableVideo: boolean = true) => {
    if (!currentUser) return

    try {
      // Disconnect existing WebRTC if any
      if (huddleWebRTC) {
        await huddleWebRTC.disconnect()
      }

      const webrtc = new HuddleWebRTC(
        huddle.id,
        currentUser.id,
        () => {
          // Participants update callback
          loadActiveHuddle()
        },
        (error) => {
          toast({
            title: "WebRTC Error",
            description: error.message,
            variant: "destructive",
          })
        }
      )

      await webrtc.initialize(enableVideo)
      setHuddleWebRTC(webrtc)
      setIsInHuddle(true)
      setIsMuted(webrtc.isMuted())
      setIsVideoEnabled(webrtc.isVideoEnabled())
    } catch (error: any) {
      console.error("Failed to initialize WebRTC:", error)
      toast({
        title: "Microphone Access Required",
        description: error.message || "Please allow microphone access to join the huddle",
        variant: "destructive",
      })
    }
  }

  const leaveHuddle = async () => {
    if (!selectedChannel || !activeHuddle) return

    try {
      if (huddleWebRTC) {
        await huddleWebRTC.disconnect()
        setHuddleWebRTC(null)
      }

      await huddleApi.leaveHuddle(selectedChannel.id, activeHuddle.id)
      setIsInHuddle(false)
      setIsMuted(false)
      
      // Reload huddle to get updated state
      await loadActiveHuddle()
      
      toast({
        title: "Left Huddle",
        description: "You've left the voice call",
      })
    } catch (error: any) {
      console.error("Failed to leave huddle:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to leave huddle",
        variant: "destructive",
      })
    }
  }

  const toggleMute = async () => {
    if (!huddleWebRTC) return

    try {
      if (isMuted) {
        await huddleWebRTC.unmute()
        setIsMuted(false)
      } else {
        await huddleWebRTC.mute()
        setIsMuted(true)
      }
    } catch (error) {
      console.error("Failed to toggle mute:", error)
    }
  }

  const endHuddle = async () => {
    if (!selectedChannel || !activeHuddle) return

    try {
      if (huddleWebRTC) {
        await huddleWebRTC.disconnect()
        setHuddleWebRTC(null)
      }

      await huddleApi.endHuddle(selectedChannel.id, activeHuddle.id)
      setActiveHuddle(null)
      setIsInHuddle(false)
      setIsMuted(false)
      
      toast({
        title: "Huddle Ended",
        description: "Voice call has been ended",
      })
    } catch (error: any) {
      console.error("Failed to end huddle:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to end huddle",
        variant: "destructive",
      })
    }
  }

  // WebRTC Call functions (startCall from context; post "Calling X..." when on chat)
  const startCall = async (
    toUser: { id: number; name: string; email: string },
    options?: { video?: boolean }
  ) => {
    if (!selectedChannel) return
    try {
      if (selectedChannel) {
        try {
          await chatApi.sendMessage(
            selectedChannel.id,
            options?.video
              ? `📹 Video calling ${toUser.name}...`
              : `📞 Calling ${toUser.name}...`
          )
        } catch (e) {
          console.error('Failed to create call history message:', e)
        }
      }
      await startCallFromContext(toUser, options)
    } catch (error: any) {
      console.error("Failed to start call:", error)
      toast({
        title: "Call Failed",
        description: error.message || "Failed to start call. Please check microphone permissions.",
        variant: "destructive",
      })
    }
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
      <div className="flex h-[calc(100dvh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100dvh-4rem)] bg-background relative">
      {/* Main Chat Area - Adjust height when huddle is active */}
      <div className={cn(
        "flex flex-1 min-h-0 overflow-hidden",
        activeHuddle && activeHuddle.status === 'active' && !huddlePanelExpanded && "mb-16",
        activeHuddle && activeHuddle.status === 'active' && huddlePanelExpanded && "mb-64 md:mb-96"
      )}>
        {/* Left Sidebar - Channels/Conversations */}
        <div className={cn(
          "border-r border-border bg-card flex flex-col shrink-0",
          "w-full md:w-64",
          isMobile && mobileView === "chat" && "hidden",
          !isMobile && "flex"
        )}>
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
                      onClick={() => selectChannel(channel)}
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
                        onClick={() => selectChannel(channel)}
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
                      onClick={() => selectChannel(channel)}
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
        <div className={cn(
          "flex-1 flex flex-col min-w-0 overflow-hidden",
          isMobile && mobileView === "list" && "hidden",
          (!isMobile || mobileView === "chat") && "flex"
        )}>
          {selectedChannel ? (
            <>
              {/* Chat Header */}
              <div className="h-14 border-b border-border bg-card flex items-center justify-between px-3 sm:px-4 shrink-0">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                {isMobile && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    onClick={handleMobileBack}
                    aria-label="Back to conversations"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                )}
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                {selectedChannel.channel_type === "channel" && (
                  <>
                    {selectedChannel.is_private ? (
                      <Lock className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <Hash className="h-5 w-5 text-muted-foreground" />
                    )}
                    <h3 className="font-semibold truncate">{selectedChannel.name}</h3>
                  </>
                )}
                {selectedChannel.channel_type === "direct" && (
                  <>
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {getChannelDisplayName(selectedChannel).charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <h3 className="font-semibold truncate">{getChannelDisplayName(selectedChannel)}</h3>
                      <p className="text-xs text-muted-foreground">Direct message</p>
                    </div>
                  </>
                )}
                {selectedChannel.channel_type === "group" && (
                  <>
                    <Users className="h-5 w-5 text-muted-foreground shrink-0" />
                    <div className="min-w-0">
                      <h3 className="font-semibold truncate">{selectedChannel.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {selectedChannel.members_count} members
                      </p>
                    </div>
                  </>
                )}
                </div>
              </div>
              <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                {/* Call/Huddle Buttons - Show appropriate button based on channel type */}
                {selectedChannel.channel_type === "direct" ? (
                  // Direct messages: Show WebRTC call button
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => {
                      const otherMember = selectedChannel.members.find((m) => m.id !== currentUser?.id)
                      if (otherMember && currentUser) {
                        startCall(otherMember)
                      }
                    }}
                    disabled={!!currentCall || huddleLoading}
                    title="Start Voice Call"
                    data-testid="start-voice-call-btn"
                  >
                    {huddleLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : currentCall ? (
                      <PhoneOff className="h-4 w-4 text-destructive" />
                    ) : (
                      <Phone className="h-4 w-4" />
                    )}
                  </Button>
                ) : (
                  // Channels/Groups: Show huddle button (only if no active huddle)
                  (!activeHuddle || activeHuddle.status !== 'active') && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={startHuddle}
                      disabled={huddleLoading || !!currentCall}
                      title="Start Huddle"
                    >
                      {huddleLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Phone className="h-4 w-4" />
                      )}
                    </Button>
                  )
                )}
                {selectedChannel.channel_type === "direct" && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hidden sm:inline-flex"
                    onClick={() => {
                      const otherMember = selectedChannel.members.find((m) => m.id !== currentUser?.id)
                      if (otherMember && currentUser) {
                        startCall(otherMember, { video: true })
                      }
                    }}
                    disabled={!!currentCall || huddleLoading}
                    title="Start Video Call"
                    data-testid="start-video-call-btn"
                  >
                    <Video className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 lg:hidden"
                  onClick={() => setShowChannelInfo(true)}
                  title="Channel info"
                >
                  <Info className="h-4 w-4" />
                </Button>
                {canManageSelectedChannel && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8" title="Channel options">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => {
                          setRenameValue(selectedChannel.name)
                          setShowRenameDialog(true)
                        }}
                      >
                        <Pencil className="h-4 w-4 mr-2" />
                        Rename {selectedChannel.channel_type === "group" ? "group" : "channel"}
                      </DropdownMenuItem>
                      {selectedChannel.channel_type === "channel" && (
                        <DropdownMenuItem
                          onClick={handleTogglePrivacy}
                          disabled={togglingPrivacy}
                        >
                          {selectedChannel.is_private ? (
                            <>
                              <Globe className="h-4 w-4 mr-2" />
                              Make public
                            </>
                          ) : (
                            <>
                              <Lock className="h-4 w-4 mr-2" />
                              Make private
                            </>
                          )}
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-red-600 focus:text-red-600"
                        onClick={() => setShowDeleteChannelDialog(true)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete {selectedChannel.channel_type === "group" ? "group" : "channel"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>

            {/* Messages Area */}
            <ScrollArea className="flex-1" ref={messagesContainerRef}>
              <div className="p-4 space-y-4">
                {messages.map((message, index) => {
                  if (!message.id) return null
                  if (!message.content?.trim() && !message.attachment_path) return null

                  const currentUserId = currentUser?.id != null ? Number(currentUser.id) : null
                  const messageUserId = message.user_id != null ? Number(message.user_id) : null
                  const isCurrentUser =
                    currentUserId !== null && messageUserId !== null && currentUserId === messageUserId
                  
                  // Safely get user name with fallback - use currentUser data if it's the current user's message
                  let userName = message.user_name || message.user_email?.split('@')[0] || ""
                  let userEmail = message.user_email || ""
                  
                  if (isCurrentUser) {
                    // For current user's messages, use currentUser data as fallback
                    userName = userName || currentUser?.name || currentUser?.email?.split('@')[0] || "You"
                    userEmail = userEmail || currentUser?.email || ""
                  } else {
                    // For other users, use message data or fallback to "Unknown User"
                    userName = userName || "Unknown User"
                  }
                  
                  const showAvatar =
                    index === 0 ||
                    !messages[index - 1] ||
                    messages[index - 1].user_id !== message.user_id ||
                    (message.created_at && messages[index - 1].created_at &&
                      new Date(message.created_at).getTime() -
                        new Date(messages[index - 1].created_at).getTime() >
                        300000) // 5 minutes

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
                            {userName.charAt(0).toUpperCase()}
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
                              {userName}
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
                              "bg-primary text-primary-foreground rounded-lg px-3 py-2 max-w-[85%] sm:max-w-[70%]",
                            !isCurrentUser && "text-foreground"
                          )}
                        >
                          {renderMessageBody(message, isCurrentUser)}
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
            <div className="border-t border-border bg-card p-3 sm:p-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] shrink-0">
              <div className="flex items-end gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  className="hidden"
                  accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 shrink-0"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingFile || sending || !selectedChannel}
                  title="Attach file"
                >
                  {uploadingFile ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Paperclip className="h-4 w-4" />
                  )}
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
                    disabled={sending || uploadingFile}
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
          <div className={cn(
            "flex-1 flex items-center justify-center",
            isMobile && "hidden"
          )}>
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

        {/* Right Sidebar - Channel Info (desktop only) */}
        {selectedChannel && (
          <div className="hidden lg:flex w-64 border-l border-border bg-card p-4 flex-col shrink-0 overflow-y-auto">
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
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold">Members</h4>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => setShowAddMembersDialog(true)}
                      title="Add Members"
                    >
                      <UserPlus className="h-4 w-4" />
                    </Button>
                  </div>
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
      </div>

      {/* Mobile Channel Info Sheet */}
      <Sheet open={showChannelInfo} onOpenChange={setShowChannelInfo}>
        <SheetContent side="right" className="w-full sm:max-w-sm overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {selectedChannel ? getChannelDisplayName(selectedChannel) : "Channel Info"}
            </SheetTitle>
          </SheetHeader>
          {selectedChannel && (
            <div className="space-y-6 mt-6">
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
                  <p className="text-sm text-muted-foreground">Direct message</p>
                )}
                {selectedChannel.channel_type === "group" && (
                  <p className="text-sm text-muted-foreground">
                    {selectedChannel.members_count} members
                  </p>
                )}
              </div>

              {(selectedChannel.channel_type === "group" ||
                selectedChannel.channel_type === "channel") && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold">Members</h4>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => {
                        setShowChannelInfo(false)
                        setShowAddMembersDialog(true)
                      }}
                      title="Add Members"
                    >
                      <UserPlus className="h-4 w-4" />
                    </Button>
                  </div>
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
          )}
        </SheetContent>
      </Sheet>

      {/* Add Members Dialog */}
      <Dialog open={showAddMembersDialog} onOpenChange={setShowAddMembersDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Members</DialogTitle>
            <DialogDescription>
              Select users to add to {selectedChannel?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {loadingUsers ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <ScrollArea className="h-64">
                <div className="space-y-2">
                  {availableUsers
                    .filter((user) => !selectedChannel?.members.some((m) => m.id === user.id))
                    .map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center gap-3 p-2 rounded-md hover:bg-accent cursor-pointer"
                        onClick={() => toggleMemberSelection(user.id)}
                      >
                        <Checkbox
                          checked={selectedMembersToAdd.includes(user.id)}
                          onCheckedChange={() => toggleMemberSelection(user.id)}
                        />
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{user.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        </div>
                      </div>
                    ))}
                  {availableUsers.filter(
                    (user) => !selectedChannel?.members.some((m) => m.id === user.id)
                  ).length === 0 && (
                    <div className="text-center py-8 text-sm text-muted-foreground">
                      All users are already members
                    </div>
                  )}
                </div>
              </ScrollArea>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowAddMembersDialog(false)
                setSelectedMembersToAdd([])
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddMembers}
              disabled={selectedMembersToAdd.length === 0 || addingMembers}
            >
              {addingMembers ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Adding...
                </>
              ) : (
                `Add ${selectedMembersToAdd.length > 0 ? `(${selectedMembersToAdd.length})` : ""}`
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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

      {/* Huddle Panel - Slack-style bottom bar */}
      {activeHuddle && activeHuddle.status === 'active' && (
        <div className={cn(
          "fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border shadow-lg transition-all duration-300",
          huddlePanelExpanded ? "h-96" : "h-16"
        )}>
          {/* Collapsed View */}
          <div className="h-16 flex items-center justify-between px-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <Phone className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">
                  {selectedChannel?.name || "Huddle"}
                </div>
                <div className="text-xs text-muted-foreground">
                  {activeHuddle.participants_count} {activeHuddle.participants_count === 1 ? 'person' : 'people'} in call
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {isInHuddle && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9"
                    onClick={toggleMute}
                    title={isMuted ? "Unmute" : "Mute"}
                  >
                    {isMuted ? (
                      <MicOff className="h-4 w-4 text-destructive" />
                    ) : (
                      <Mic className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9"
                    onClick={async () => {
                      if (huddleWebRTC) {
                        try {
                          // If video is not available but we want to enable it, use enableVideo
                          if (!huddleWebRTC.hasVideoCapability() && !isVideoEnabled) {
                            await huddleWebRTC.enableVideo()
                            setIsVideoEnabled(true)
                            toast({
                              title: "Video Enabled",
                              description: "Camera is now enabled for this huddle",
                            })
                          } else {
                            await huddleWebRTC.toggleVideo()
                            setIsVideoEnabled(huddleWebRTC.isVideoEnabled())
                          }
                        } catch (error: any) {
                          toast({
                            title: "Video Error",
                            description: error.message || "Failed to toggle video",
                            variant: "destructive",
                          })
                        }
                      }
                    }}
                    title={
                      !huddleWebRTC?.hasVideoCapability() 
                        ? "Enable video call" 
                        : isVideoEnabled 
                        ? "Turn off camera" 
                        : "Turn on camera"
                    }
                  >
                    {huddleWebRTC?.hasVideoCapability() && isVideoEnabled ? (
                      <Video className="h-4 w-4" />
                    ) : (
                      <Video className="h-4 w-4 text-destructive" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9"
                    onClick={leaveHuddle}
                    title="Leave Huddle"
                  >
                    <PhoneOff className="h-4 w-4 text-destructive" />
                  </Button>
                </>
              )}
              {!isInHuddle && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={joinHuddle}
                  disabled={huddleLoading}
                >
                  {huddleLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Join"
                  )}
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                onClick={() => setHuddlePanelExpanded(!huddlePanelExpanded)}
              >
                {huddlePanelExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronUp className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Expanded View */}
          {huddlePanelExpanded && (
            <div className="h-80 border-t border-border p-4 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-sm">Participants</h3>
                  <p className="text-xs text-muted-foreground">
                    {activeHuddle.participants_count} {activeHuddle.participants_count === 1 ? 'person' : 'people'} in call
                  </p>
                </div>
                {activeHuddle.started_by.id === currentUser?.id && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={endHuddle}
                  >
                    End Call
                  </Button>
                )}
              </div>
              
              {/* Video Grid */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                {/* Local Video */}
                {isInHuddle && huddleWebRTC && (
                  <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                    <video
                      ref={localVideoRef}
                      autoPlay
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                      {currentUser?.name} (You)
                    </div>
                  </div>
                )}
                
                {/* Remote Videos */}
                {activeHuddle.participants
                  .filter((p) => p.id !== currentUser?.id)
                  .map((participant) => {
                    const remoteStream = huddleWebRTC?.getRemoteStream(participant.id)
                    return (
                      <div key={participant.id} className="relative aspect-video bg-black rounded-lg overflow-hidden">
                        {remoteStream ? (
                          <video
                            ref={(el) => {
                              if (el) {
                                remoteVideoRefs.current.set(participant.id, el)
                                el.srcObject = remoteStream
                              }
                            }}
                            autoPlay
                            playsInline
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Avatar className="h-16 w-16">
                              <AvatarFallback>
                                {participant.name.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          </div>
                        )}
                        <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                          {participant.name}
                        </div>
                      </div>
                    )
                  })}
              </div>
              
              {/* Participants List */}
              <div className="space-y-2">
                {activeHuddle.participants.map((participant) => {
                  const isCurrentUserParticipant = participant.id === currentUser?.id
                  return (
                    <div
                      key={participant.id}
                      className={cn(
                        "flex items-center gap-3 p-2 rounded-md",
                        isCurrentUserParticipant && "bg-accent"
                      )}
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {participant.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">
                          {participant.name}
                          {isCurrentUserParticipant && (
                            <span className="text-xs text-muted-foreground ml-1">(You)</span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {participant.email}
                        </div>
                      </div>
                      {isCurrentUserParticipant && (
                        <div className="flex items-center gap-1">
                          {isMuted ? (
                            <MicOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Mic className="h-4 w-4 text-green-500" />
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

      <Dialog open={showRenameDialog} onOpenChange={setShowRenameDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Rename {selectedChannel?.channel_type === "group" ? "group" : "channel"}
            </DialogTitle>
            <DialogDescription>
              Choose a new name for &quot;{selectedChannel?.name}&quot;.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="rename-channel">Name</Label>
            <Input
              id="rename-channel"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              placeholder="Enter channel name"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  handleRenameChannel()
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRenameDialog(false)} disabled={renamingChannel}>
              Cancel
            </Button>
            <Button onClick={handleRenameChannel} disabled={renamingChannel || !renameValue.trim()}>
              {renamingChannel ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteChannelDialog} onOpenChange={setShowDeleteChannelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete channel?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &quot;{selectedChannel?.name}&quot; and all of its messages.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingChannel}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleDeleteChannel()
              }}
              disabled={deletingChannel}
              className="bg-red-600 hover:bg-red-700"
            >
              {deletingChannel ? "Deleting..." : "Delete channel"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

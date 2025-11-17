"use client"

import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  FileText, 
  Download, 
  ExternalLink, 
  Loader2,
  AlertCircle,
} from "lucide-react"

interface DocumentPreviewProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  documentUrl: string
  documentName: string
  documentType?: string
}

export function DocumentPreview({ 
  open, 
  onOpenChange, 
  documentUrl, 
  documentName, 
  documentType = "pdf" 
}: DocumentPreviewProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (open && documentUrl) {
      setIsLoading(true)
      setHasError(false)
      setErrorMessage("")
      
      timeoutRef.current = setTimeout(() => {
        setIsLoading(prev => {
          if (prev) {
            setHasError(true)
            setErrorMessage("The document took too long to load. Please try downloading or opening in a new tab.")
            return false
          }
          return prev
        })
      }, 10000)
    }
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [open, documentUrl])

  const handleLoad = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setIsLoading(false)
    setHasError(false)
  }

  const handleError = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setIsLoading(false)
    setHasError(true)
    setErrorMessage("Failed to load the document. The link may be invalid or the server may be unreachable.")
  }

  const handleDownload = () => {
    const downloadUrl = documentUrl.includes('?') 
      ? `${documentUrl}&download=true` 
      : `${documentUrl}?download=true`
    
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = documentName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleOpenInNewTab = () => {
    window.open(documentUrl, '_blank', 'noopener,noreferrer')
  }

  const getFileIcon = () => {
    switch (documentType.toLowerCase()) {
      case "pdf":
        return <FileText className="w-6 h-6 text-red-500" />
      case "doc":
      case "docx":
        return <FileText className="w-6 h-6 text-blue-500" />
      default:
        return <FileText className="w-6 h-6 text-gray-500" />
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] w-[95vw] p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getFileIcon()}
              <div>
                <DialogTitle className="text-lg font-semibold truncate">
                  {documentName}
                </DialogTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {documentType.toUpperCase()}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenInNewTab}
                className="flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Open in New Tab
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="relative w-full h-[80vh] bg-gray-50">
          {isLoading && !hasError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 z-10">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              <p className="text-sm text-gray-600 mt-2">Loading document...</p>
            </div>
          )}

          {hasError ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-6">
              <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Unable to Preview Document
              </h3>
              <p className="text-gray-600 mb-4">{errorMessage}</p>
              <div className="flex gap-3">
                <Button variant="outline" onClick={handleOpenInNewTab}>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open in New Tab
                </Button>
                <Button variant="outline" onClick={handleDownload}>
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          ) : (
            <iframe
              key={documentUrl}
              src={documentUrl}
              onLoad={handleLoad}
              onError={handleError}
              className="w-full h-full border-none"
              title={documentName}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Hook for managing preview state
export function useDocumentPreview() {
  const [previewState, setPreviewState] = useState<{
    open: boolean
    documentUrl: string
    documentName: string
    documentType: string
  }>({
    open: false,
    documentUrl: "",
    documentName: "",
    documentType: "pdf",
  })

  const openPreview = (url: string, name: string, type: string = "pdf") => {
    setPreviewState({
      open: true,
      documentUrl: url,
      documentName: name,
      documentType: type,
    })
  }

  const closePreview = () => {
    setPreviewState((prev) => ({ ...prev, open: false }))
  }

  return {
    previewState,
    openPreview,
    closePreview,
  }
}

"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  FileText, 
  Download, 
  ExternalLink, 
  X, 
  Loader2,
  AlertCircle,
  Eye
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

  const handleLoad = () => {
    setIsLoading(false)
    setHasError(false)
  }

  const handleError = () => {
    setIsLoading(false)
    setHasError(true)
    setErrorMessage(`Failed to load document. The file may be corrupted or the link may be invalid. URL: ${documentUrl}`)
  }

  const handleDownload = () => {
    // Add download parameter to force download
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
      case 'pdf':
        return <FileText className="w-6 h-6 text-red-500" />
      case 'doc':
      case 'docx':
        return <FileText className="w-6 h-6 text-blue-500" />
      default:
        return <FileText className="w-6 h-6 text-gray-500" />
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] p-0 w-[95vw]">
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

        <div className="flex-1 p-6">
          {hasError ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Unable to Preview Document
              </h3>
              <p className="text-gray-600 mb-4 max-w-md">
                {errorMessage}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleOpenInNewTab}
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  Try Opening in New Tab
                </Button>
                <Button
                  variant="outline"
                  onClick={handleDownload}
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download Instead
                </Button>
              </div>
            </div>
          ) : (
            <div className="relative w-full h-[75vh] border rounded-lg overflow-hidden bg-gray-50">
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                    <p className="text-sm text-gray-600">Loading document...</p>
                  </div>
                </div>
              )}
              
              {documentType.toLowerCase() === 'pdf' ? (
                <div className="w-full h-full flex flex-col">
                  <div className="flex items-center justify-between p-4 border-b bg-gray-50">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-red-500" />
                      <span className="text-sm font-medium text-gray-700">PDF Document</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(documentUrl, '_blank')}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        Open in New Tab
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDownload}
                        className="text-green-600 hover:text-green-800"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                  <div className="flex-1 flex items-center justify-center bg-gray-100">
                    <div className="text-center">
                      <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        PDF Preview Not Available
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        For security reasons, PDFs cannot be displayed in this preview.
                      </p>
                      <div className="flex items-center justify-center gap-3">
                        <Button
                          onClick={() => window.open(documentUrl, '_blank')}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Open in New Tab
                        </Button>
                        <Button
                          variant="outline"
                          onClick={handleDownload}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download PDF
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full bg-gray-50">
                  <div className="text-center">
                    {getFileIcon()}
                    <h3 className="text-lg font-medium text-gray-900 mt-3 mb-2">
                      Preview Not Available
                    </h3>
                    <p className="text-gray-600 mb-4">
                      This file type cannot be previewed in the browser.
                    </p>
                    <div className="flex gap-2 justify-center">
                      <Button
                        variant="outline"
                        onClick={handleOpenInNewTab}
                        className="flex items-center gap-2"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Open in New Tab
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleDownload}
                        className="flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Hook for document preview functionality
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
    documentType: "pdf"
  })

  const openPreview = (url: string, name: string, type: string = "pdf") => {
    setPreviewState({
      open: true,
      documentUrl: url,
      documentName: name,
      documentType: type
    })
  }

  const closePreview = () => {
    setPreviewState(prev => ({ ...prev, open: false }))
  }

  return {
    previewState,
    openPreview,
    closePreview
  }
}

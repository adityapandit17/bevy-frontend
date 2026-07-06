"use client"

import { useRef, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { SignaturePad } from "@/components/documents/signature-pad"
import { Loader2, FileText } from "lucide-react"
import { apiRequest, getApiUrl } from "@/lib/api"
import { toast } from "@/hooks/use-toast"

export interface SignableDocument {
  id: number
  documentTitle: string
  policyDocumentId?: number
  status?: string
}

interface DocumentSignDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  signature: SignableDocument | null
  onSigned?: () => void
}

export function DocumentSignDialog({
  open,
  onOpenChange,
  signature,
  onSigned,
}: DocumentSignDialogProps) {
  const [agreed, setAgreed] = useState(false)
  const [isEmpty, setIsEmpty] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const padKey = useRef(0)

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setAgreed(false)
      setIsEmpty(true)
      padKey.current += 1
    }
    onOpenChange(next)
  }

  const handleSubmit = async () => {
    if (!signature) return

    const canvas = document.querySelector<HTMLCanvasElement>(
      '[data-signature-pad="true"] canvas'
    )
    if (!canvas) {
      toast({
        title: "Error",
        description: "Please draw your signature",
        variant: "destructive",
      })
      return
    }

    const signatureImage = canvas.toDataURL("image/png")
    if (!signatureImage || signatureImage.length < 100) {
      toast({
        title: "Error",
        description: "Please draw your signature before submitting",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)
      await apiRequest(getApiUrl(`digital_signatures/${signature.id}/sign`), {
        method: "POST",
        body: JSON.stringify({ signature_image: signatureImage }),
      })

      toast({
        title: "Document signed",
        description: `You have signed "${signature.documentTitle}"`,
      })

      handleOpenChange(false)
      onSigned?.()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to sign document",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Sign Document
          </DialogTitle>
          <DialogDescription>
            Review and electronically sign: <strong>{signature?.documentTitle}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2" data-signature-pad="true">
          <div>
            <Label className="mb-2 block">Your signature</Label>
            <SignaturePad key={padKey.current} onChange={setIsEmpty} />
          </div>

          <div className="flex items-start gap-2 rounded-lg border bg-gray-50 p-3">
            <Checkbox
              id="sign-agreement"
              checked={agreed}
              onCheckedChange={(v) => setAgreed(v === true)}
            />
            <Label htmlFor="sign-agreement" className="text-sm leading-relaxed">
              I confirm that I have read and understood this document. My electronic
              signature is legally binding and equivalent to a handwritten signature.
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || isEmpty || !agreed}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing...
              </>
            ) : (
              "Sign Document"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

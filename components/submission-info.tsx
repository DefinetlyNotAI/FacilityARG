"use client"

import {Info} from "lucide-react"
import {Button} from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

export function SubmissionInfo() {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1">
                    <Info className="h-4 w-4"/>
                    <span>Submission Info</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Quest Submission Information</DialogTitle>
                    <DialogDescription>How to get your quest solutions recognized globally</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <p className="text-sm">
                        Email <a href="mailto:TREEFacility@outlook.com" className="font-medium">here</a> with proof of
                        submission as
                        well as your name (to credit you), and if accepted you will have globally solved the puzzle, and
                        will be credited.<br/>
                        If you get rejected or accepted, you will receive an custom email back.
                    </p>
                    <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md">
                        <h4 className="font-medium mb-2">What to include in your submission:</h4>
                        <ul className="list-disc pl-5 space-y-1 text-sm">
                            <li>Screenshot or detailed description of your solution</li>
                            <li>The name you want to be credited with</li>
                            <li>The quest name you've completed</li>
                            <li>Optional: <a href="https://discord.gg/rVBFQCTV4F" className="font-medium"
                                             target="_blank" rel="noopener noreferrer">Join the discord for the
                                community - Major puzzle part.</a></li>
                        </ul>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Submissions are reviewed manually. Please allow some time for your solution to be verified and
                        added to the
                        global quest log.
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    )
}

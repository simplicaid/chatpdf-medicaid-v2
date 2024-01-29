import { UserButton, auth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {LogIn} from "lucide-react"

// we make it async to ensure it is a server component.
export default async function Home() {
  const {userId} = await auth()
  const isAuth = !!userId
  return (
    <div className="w-screen min-h-screen bg-gradient-to-r from-blue-100 via-blue-300 to-blue-500">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="flex flex-col items-center text-center items-center">
          <div className="flex items-center">
            <h1 className="mr-3 text-5xl font-semibold">Medicaid application. <span className="text-blue-700">Simplified</span></h1>
            <UserButton afterSignOutUrl="/" />
          </div>
          <div className="flex mt-2">
            {isAuth && <Button>Go to Chats</Button>}
          </div>
          <p className="max-w-x1 mt-1 text-lg text-black-600">
            Complete the Medicaid procress in minutes instead of hours, with a<br/>
            verification system to ensure you are not making any mistakes.
          </p>
          <div className="w-full mt-4">
            {isAuth ? (
            <h1>FileUpload</h1>):(
              <Link href="/sign-in">
                <Button>Log in to get Started!
                <LogIn className="w-4 ml-2"></LogIn>
                </Button>  
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
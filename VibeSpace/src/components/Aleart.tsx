import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
// import { useDelete } from "@/hooks/useDelete";

interface DialogDemoProps {
  setIsOpen?: React.Dispatch<React.SetStateAction<boolean>>; // Dot থেকে আসবে
  name: string;
  title: string;
  button_name: string,
  handleClick:()=>void
}

export function AlertDialogDemo({ setIsOpen, name, title, button_name, handleClick}: DialogDemoProps) {
  
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" className ="w-full cursor-pointer">{ name }</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            { title }
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel  onClick={() => setIsOpen?.(false)}> Cancel </AlertDialogCancel>
          <AlertDialogAction className ="bg-red-500" onClick={ handleClick }>{ button_name }</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
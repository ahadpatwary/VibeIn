'use client'
import { InputWithLabel } from "@/components/UserInformation";
import { useCreateUser } from "@/hooks/useCreateUser";
import { Button } from "@/components/ui/button";


function Home(){

    const {
        name, 
        setName, 
        dob, 
        setDob, 
        phoneNumber, 
        setPhoneNumber, 
        picture, 
        setPicture, 
        handleSubmit
    } = useCreateUser();
    return (
        <div className="h-screen max-w-screen flex justify-center items-center m-3">
            <form
                className="grid w-full max-w-lg items-center gap-3 border-2 p-4 rounded-lg shadow-lg"
                onSubmit={handleSubmit}
            >
                <InputWithLabel
                    name={name}
                    setName={setName}
                    dob={dob}
                    setDob={setDob}
                    phoneNumber={phoneNumber}
                    picture={picture}
                    setPhoneNumber={setPhoneNumber}
                    setPicture={setPicture} 
                />
                <Button type="submit"> Submit </Button>
            </form>
        </div>
    )
}
export default Home;

//       const [preview, setPreview] = useState<string | null>(null);
//   const router = useRouter();

//   const choosePic = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (file) {
//       const url = URL.createObjectURL(file);
//       setPreview(url);
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();

//     const form = e.currentTarget;
//     const formData = new FormData(form);

//     // POST to API route
//     const res = await fetch("/api/user", {
//       method: "POST",
//       body: formData
//     });

//     if (res.ok) {
//       router.push("/feed");
//     } else {
//       console.log("erro to post data");
//     }
//   };
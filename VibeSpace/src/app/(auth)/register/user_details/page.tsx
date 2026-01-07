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
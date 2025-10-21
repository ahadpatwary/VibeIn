"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// import { AvatarDemo } from "@/components/AvaterDemo";

interface propsType{
  name: string;
  setName:(value:string)=>void
  dob:string;
  setDob:(value:string)=>void
  phoneNumber:string
  setPhoneNumber:(value:string)=>void
  picture:File | null
  setPicture:(value:File | null)=>void
}

export function InputWithLabel(
  {
    name, 
    setName,
    dob,
    setDob,
    phoneNumber,
    setPhoneNumber,
    // picture,
    setPicture,
  } : propsType 
) {

  return (
    <>
      <Label htmlFor="name">Name</Label>
      <Input 
        type="text" 
        name="name" 
        id="name" 
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <Label htmlFor="dob">DOB</Label>
      <Input 
        type="date" 
        name="dob" 
        id="dob" 
        placeholder="Date of Birth" 
        value={dob}
        onChange={(e) => setDob(e.target.value)}
      />

      <Label htmlFor="phoneNumber">Phone Number</Label>
      <Input 
          type="tel" 
          name="phoneNumber" 
          id="phoneNumber" 
          placeholder="Phone Number"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
        />

      <div className="grid w-full max-w-sm items-center gap-3">
        <Label htmlFor="picture">Picture</Label>
        <Input
          id="picture" 
          type="file" 
          name="picture"
          onChange={(e) => {
            const file = e.target.files?.[0] || null;
            setPicture(file);
          }}
        />
      </div>
    </>
  );
}
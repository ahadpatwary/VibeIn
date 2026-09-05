import { Dispatch, SetStateAction } from "react"
import { Input } from "./ui/input"

interface propsType {
    id: string,
    type: string,
    placeholder: string,
    required?: boolean,
    value: string,
    disable?: boolean,
    setValue: Dispatch<SetStateAction<string>>
}
export const CustomInput = ({
    id,
    type, 
    placeholder, 
    required=true, 
    value, 
    disable=false, 
    setValue
}: propsType) => {
    return(
        <Input
            id={id}
            type={type}
            placeholder={placeholder}
            required={required}
            value={value}
            disabled={disable}
            onChange={(e) => setValue(e.target.value)}
        />
    )
}
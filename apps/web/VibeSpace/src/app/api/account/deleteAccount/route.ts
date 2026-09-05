import Account from '@/modules/account/models/Account';
import { NextResponse } from 'next/server';


export async function DELETE (req: Request) {
    try {
        
        const body = await req.json();
        const { accountId } = body;

        if( !accountId ) return NextResponse.json(
            { message: 'accountId must be required ' },
            { status: 400 }
        )

        await Account.findByIdAndDelete(accountId)

        return NextResponse.json(
            { message: 'Account deleted successfully!' },
            { status: 200 }
        )

    } catch (error) {
        if(error instanceof Error){
            throw new Error(error.message);
        }
    }
}
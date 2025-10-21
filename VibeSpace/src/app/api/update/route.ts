import { connectToDb } from '@/lib/db';
import { NextResponse } from 'next/server';
import { Types } from 'mongoose';
import User from '@/models/User'; 
import Card from '@/models/Card'
import { updateFile } from '@/lib/updatePicture';

interface type{
    success: boolean,
    data: {
        url:string,
        public_id:string,
    } | null,
    message: string
}

export const PUT = async (req: Request) => {

    try {

        const formData = await req.formData();  //id must be sent

        if (!formData) {
            return NextResponse.json(
                { message: 'Data missing' },
                { status: 1010 }
            );
        }

        await connectToDb();

        const id = formData.get('id') as string;
        console.log(id);

        if (!id) {
            return NextResponse.json(
                { message: 'ID missing' },
                { status: 402 }
            );
        }

        const objectId = new Types.ObjectId(id);

        const model = formData.get('model');
        const Model = model === 'User' ? User : Card;

        const existingUser = await Model.findById(objectId);

        if (!existingUser) {
            return NextResponse.json(
                { message: 'model not found' },
                { status: 404 }
            );
        }

        const updateData: Record<string, unknown> = {};

        for (const [key, value] of formData.entries()) {
            if (key !== 'picture' && key !== 'id' && key !== 'oldPublicId' && key !== 'property' && key !== 'model') {
                updateData[key] = value;
            }
        }

        const newPicture = formData.get('picture') as File | null; 
        const oldPublicId = formData.get('oldPublicId') as string;
        const property = formData.get("property") as string;

        if ( !newPicture || newPicture.size < 1) {
            return NextResponse.json(
                { success: false, message: "plese fill all value"},
                { status : 400}
            )
        }
        
        const uploadRes: type = await updateFile({ newFile:newPicture, oldPublicId });

        if(!uploadRes.success) {
            return NextResponse.json(
                { success: false, message : uploadRes.message},
                { status : 401}
            )
        } 

        updateData[property] = {
            url: (uploadRes as type )?.data?.url,
            public_id: (uploadRes as type)?.data?.public_id,
        };

        await Model.findByIdAndUpdate(objectId, updateData, { new: true });

        return NextResponse.json(
            { success: true, message: 'User updated successfully!' },
            { status: 200 }
        );

    } catch (error) {
        console.error('Something wrong:', error);
        return NextResponse.json(
            { success: false, message: 'Internal Server Error' },
            { status: 500 }
        );
    }
};
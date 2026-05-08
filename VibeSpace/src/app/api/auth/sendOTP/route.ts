import { NextResponse, NextRequest } from "next/server";
import { getRedisClient } from "@/shared/lib/redis";
import { getRabbitChannel } from "@/shared/lib/rabbitMQ";
import { connectToDb } from "@/shared/lib/db";
import Account from "@/modules/account/models/Account";

export async function POST(req: NextRequest) {
  try {

    await connectToDb();
    const Redis = getRedisClient();

    if (!Redis)  return NextResponse.json(
      { message: "Please try again" },
      { status: 500 }
    );
    
    const {email} = await req.json();


    if (!email) return NextResponse.json(
      { message: "email is required" },
      { status: 400 }
    );
    

    const accountExistKey = `accountExist:${email}`;


    const accountExist = await Redis.get(accountExistKey);

    if (accountExist) return NextResponse.json(
      { message: "account already exist", account: true },
      { status: 200 }
    );

 
    const account = await Account.findOne({ email }) 


    if(!account) {
      try {
        const emailValidateTimeKey = `emailValidate:${email}`;

        await Redis.set(emailValidateTimeKey, "value", "EX", 5 * 60);

        const channel = await getRabbitChannel();

        await channel.assertQueue("emailNotificationQueue", {
          durable: true
        });

        channel.sendToQueue(
          "emailNotificationQueue",
          Buffer.from(JSON.stringify({ email })),
          { persistent: true }
        );
        
      } catch (err) {
        console.error("RabbitMQ error:", err);
      }

      return NextResponse.json(
        { user: false }, 
        { status: 200 }
      );
    }


    return NextResponse.json(
      { message: "account not exist", account: false },
      { status: 200 }
    );

  } catch (error) {
    return NextResponse.json(
      { message: "Server error" }, 
      { status: 500 }
    );
  }
}
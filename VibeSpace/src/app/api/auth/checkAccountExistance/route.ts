import { NextResponse, NextRequest } from "next/server";
import { connectToDb } from "@/lib/db";
import { getRedisClient } from "@/lib/redis";
import { getRabbitChannel } from "@/lib/rabbitMQ";
import Account from "@/models/Account";

export async function POST(req: NextRequest) {
  try {

    await connectToDb();
    const Redis = getRedisClient();

    if (!Redis)  return NextResponse.json(
      { message: "Please try again" },
      { status: 500 }
    );
    
    const body = await req.json();

    const { type } = body;

    if (!type) return NextResponse.json(
      { message: "type is required" },
      { status: 400 }
    );
    

    const accountExistKey = `accountExist:${body?.email ?? body?.providerId}`;


    const accountExist = await Redis.get(accountExistKey);
    if (accountExist) return NextResponse.json( //.........................
      { message: "account already exist", account: true },
      { status: 200 }
    );

 
    const account = type === 'crediantials' ? 
      await Account.findOne({ type: type, email: body.email }) :
      await Account.findOne({ type: type, providerId: body.providerId })
    ;


    if(!account && type === 'crediantials') {
      try {
        const emailValidateTimeKey = `emailValidate:${body.email}`;

        await Redis.set(emailValidateTimeKey, "value", "EX", 5 * 60);

        const channel = await getRabbitChannel();

        await channel.assertQueue("emailNotificationQueue", {
          durable: true
        });

        channel.sendToQueue(
          "emailNotificationQueue",
          Buffer.from(JSON.stringify({ email: body.email })),
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
import NextAuth, { NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectToDb } from "@/lib/db";
import User from "@/models/User";
import { getRedisClient } from "@/lib/redis";
// import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.EX_GITHUB_CLIENT_ID!,
      clientSecret: process.env.EX_GITHUB_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "openid name email profile",
          prompt: "select_account",
        },
      },
    }),


    CredentialsProvider({

      name: "credentials",
      credentials: {
        payload: { type: "text" },
      },

      // const isValid = await bcrypt.compare(credentials.password, user.password);
      async authorize(credentials) {
        try {
  
          if(!credentials) return null;
          const data = JSON.parse(credentials.payload);

          if (!data || !data.email) return null;

          const Redis = await getRedisClient();

          if(!Redis) return null;

          const verifyKey = await Redis.get(`otpSuccess:${data.email}`);
          await Redis.del(`otpSuccess:${data.email}`);


          if(!verifyKey) return null;

          await connectToDb();

          if(data.id){
            return {
              id: data.id,
              email: data.email,
            }
          }

          const user = await User.create({
            email: data.email,
            password: data?.password || "123456",
            name: data?.name,
            picture:{
              url: data?.image,
              public_id: "123456",
            }
          })

          return {
            id: user._id,
            email: user.email
          }
        } catch (error) {
          if(error instanceof Error)
            console.error('error', error.message)
          ;
          return null;
        }

      }

    }),
  ],

  callbacks: {

    async signIn({user}) {
      try {

        if(user.id) return true;

        if (!user.email) return false;

        await connectToDb();
        
        let dbUser = await User.findOne({ email: user.email });

        if (!dbUser) {
          dbUser = await User.create({
            name: user.name,
            email: user.email,
            password: "1234567",
            picture: {
              url: user?.image,
              public_id: "123456"
            }
          });
        }

        user.id = dbUser._id.toString(); 
        return true;
    
      } catch (error) {
        return false;
      }
    },

    async jwt({ token, user }) {
      if (user?.id) {
        token.id = user.id;
      }
      return token;
    },

    async session({ session, token }) {
      if (token?.id && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  
  },

  session: {
    strategy: "jwt",
    maxAge: 15 * 60, // 15 minutes
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
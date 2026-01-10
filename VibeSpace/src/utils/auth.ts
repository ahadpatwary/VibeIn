import NextAuth, { NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectToDb } from "@/lib/db";
import User from "@/models/User";
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

        console.log("crediantial data", credentials);
        const data = JSON.parse(credentials.payload);

        console.log("crediantials", data);

        if (!data || !data.email) return null;

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





      //   if (!credentials?.type) return null;

      //   if (credentials.type === "password") {
      //     if (!credentials.email || !credentials.password) return null;

      //     let user = await User.findOne({email: credentials.email});

      //     if(!user) {
      //       user = await User.create({
      //         email: credentials.email,
      //         password: credentials.password,
      //       })
      //     }

      //     const user = await findUser(credentials.email, credentials.password);
      //     if (!user) return null;

      //     return {
      //       id: user.id,
      //       email: user.email,
      //       name: user.name,
      //     };
      //   }

 
      //   if (credentials.type === "provider") {
      //     if (!credentials.providerId || !credentials.email) return null;

      //     // 👉 এখানে provider user create / find
      //     const user = await findOrCreateProviderUser({
      //       providerId: credentials.providerId,
      //       email: credentials.email,
      //       name: credentials.name,
      //       image: credentials.image,
      //     });

      //     return {
      //       id: user.id,
      //       email: user.email,
      //       name: user.name,
      //       image: user.image,
      //     };
      //   }

      //   return null;
      // }
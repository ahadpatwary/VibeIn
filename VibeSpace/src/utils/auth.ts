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

      name: "Credentials",
      credentials: {
        type: { label: "Type", type: "text" }, // "password" | "provider"
        id: { label: "id", type: "text", optional: true },
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password", optional: true },
        name: { label: "Name", type: "text", optional: true },
        image: { label: "Image", type: "text", optional: true },
      },

          // const isValid = await bcrypt.compare(credentials.password, user.password);

      async authorize(credentials) {

        if(credentials?.id){
          return {
            id: credentials.id,
            email: credentials.email,
          }
        }

        const user = await User.create({
          email: credentials.email,
          password: credentials?.password || "123456",
          name: credentials?.name,
          picture:{
            url: credentials?.image,
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

    async session({token}){

      if(!token) return;
      return { id: token.id };

    },

    async jwt({ user }) {
      
      if(!user) return;
      return { id: user.id }

    },

  },

  session: {
    strategy: "jwt",
    maxAge: 15 * 60, // 15 minute
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
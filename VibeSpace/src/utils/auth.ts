import NextAuth, { NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectToDb } from "@/lib/db";
import User from "@/models/User";
// import bcrypt from "bcryptjs";

interface credintialType {
  _id: string | null,
  email: string,
  password: string,
}

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

    // GoogleProvider({
    //   clientId: process.env.GOOGLE_CLIENT_ID!,
    //   clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    //   authorization: {
    //     params: {
    //       scope: "openid name email profile",
    //       prompt: "select_account",
    //     },
    //   },
    // }),

    CredentialsProvider({

      name: "Credentials",
      async authorize(credentials: credintialType) {
        try {

          if(!credentials?.password){
            return {
              id: undefined,
              name: credentials?.name,
              email: credentials?.email,
              image: credentials?.picture,

            }
          }

          if (!credentials?.email || !credentials?.password) {
            throw new Error("Email or password missing");
          }

          await connectToDb();

          const user = !credentials._id && await User.create({
            email: credentials.email,
            picture: {
              url: 'https://res.cloudinary.com/dnyr37sgw/image/upload/v1767060823/cards/cnkuyvvvdup2gwk5dfic.jpg',
              public_id: "12345678"
            },
            password: credentials.password,
          })

          // const isValid = await bcrypt.compare(credentials.password, user.password);


          return {
            id: user._id.toString() || credentials._id,
            email: user.email || credentials.email,
          };

        } catch (error: unknown) {
          if (error instanceof Error) {
            throw new Error(error.message);
          }
          throw new Error("Login failed");
        }
      },
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
              public_id: "https://res.cloudinary.com/dnyr37sgw/image/upload/v1767060823/cards/cnkuyvvvdup2gwk5dfic.jpg"
            }
          });
        }

        user.id = dbUser._id.toString(); 
        return true;
    
      } catch (error) {
        return false;
      }
    },

    async session(obj){
      console.log("sess", obj);

      if (obj.token) {
        obj.session.user = {
          id: obj.token.id as string,
          email: obj.token.email as string,
        };
      }
      return obj.session;
    },

    async jwt(obj) {
      console.log("obj", obj);

      if (obj.user) {
        obj.token = {
          ...obj.user
        }
      }
      return obj.token;
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



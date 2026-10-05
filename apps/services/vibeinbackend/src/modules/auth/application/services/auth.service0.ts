// import { AuthProvider } from '@app/db-schemas';
// import { injectable } from 'tsyringe';

// export interface RegisterType {
//    email: string;
//    credential: AuthProvider;
//    providerId?: string;
//    password?: string;
// }

// @injectable()
// export class AuthService {
//    constructor() {}

//    /**
//       POST /auth/register/otp/send
//       POST /auth/register/otp/verify
//       POST /auth/register/complete

//       POST /auth/login
//       POST /auth/login/otp/verify

//       POST /auth/password/forgot
//       POST /auth/password/otp/verify
//       POST /auth/password/reset
//     */

//    /**
//     *              AUTHENTICATION SYSTEM
//                             │
//        ┌────────────────────┼────────────────────┐
//        │                    │                    │
//        ▼                    ▼                    ▼
//  Registration             Login            Forgot Password
//        │                    │                    │
//        ▼                    ▼                    ▼
//    Email OTP          Email + Password       Email OTP
//        │                    │                    │
//        ▼                    ▼                    ▼
//    Verify OTP         Password Verify       Verify OTP
//        │                    │                    │
//        ▼              ┌─────┴─────┐              ▼
// Registration Token   2FA ON/OFF   Password    Reset Token
//        │              │       │     │              │
//        │             OTP     Login  │              │
//        │              │             │              │
//        ▼              ▼             ▼              ▼
//  User + Auth       Verify OTP      Login       New Password
//  Transaction           │
//                        ▼
//                      Login
//     */

//    /**
//     *  ------------ Registration flow ------------------
//     * 1-STEP: user send (email)
//     *      => use OtpService -> send OTP
//     * 2-STEP: user send (otp)
//     *      => verifyOtp -> return token(TTL 5 min, attempt 3)
//     * 3-STEP: user send(password) -> id?: 'token'
//     *      => we collect the data from redis using token
//     *           -> if exist => next process.
//     *           -> not exist => return error.
//     */

//    /**
//     * -------------- Login flow -------------------
//     * 1-STEP: user send (email and password)
//     *      => query db if email not exist or blockend
//     *           -> send proper messages.
//     *      => all ok and 2 step-verification on
//     *           -> send otp on backned side and (fronend show the OTP section)
//     *      => all ok and 2 step-verification off
//     *           -> no otp direct passwod match and login
//     * 2-STEP(OTP_CASE): user send (OTP)
//     *      => verify otp and access the account.
//     */

//    /**
//     * -------------- Forget password flow ---------------
//     *   sendOtp(email)
//     *   verifyOtp(otp)  -> "with tokne"
//     *   changePassword(password)
//     */

//    /**
//     * ------------------- ROUTE -------------------
//     *  sendRegisterOTP(email)
//     *  verifyOTP(email, otp)
//     *  createAccount(password)
//     *
//     *  login(email, password)
//     *  sendLoginOTP()
//     *  verifyOTP(otp) -> token
//     */

//    async register(registerData: RegisterType): Promise<void> {
//       /**
//                AUTHENTICATION
//                        │
//           ┌────────────┴────────────┐
//           │                         │
//       Credentials                Provider
//           │                         │
//           ▼                         ▼
//     Find User(email)       Find Auth(provider + providerId)
//           │                         │
//        exists?                   exists?
//        /     \                    /    \
//       yes     no                 yes     no
//       │        │                  │       │
//     ERROR   Transaction          LOGIN   Find User(email)
//                │                          │
//           ┌────┴────┐                  ┌──┴──┐
//           ▼         ▼               exists  no
//         User       Auth                │      │
//                                        ▼      ▼
//                                       LINK   Transaction
//                                              │
//                                         ┌────┴────┐
//                                         ▼         ▼
//                                       User       Auth
//        */

//       if (registerData.credential === AuthProvider.Credentials) {
//          /**
//           * -> search the user collection that documnet is exist or
//           * not using 'email'
//           *
//           *     -> if exist => access the account
//           *     -> If not exist => create the account
//           */
//          /** -> create auth and user using same transaction
//           * -> email
//           * -> password
//           * -> credential === 'email'
//           */
//       }

//       /**
//        * -> searche the Auth collection that document is exist or not
//        * using provider_Id
//        *
//        *   -> if exist => login the user at that account
//        *   -> if not exist => search on user collectoin that user email is exist or not
//        *
//        *             -> if exist => access the account
//        *             -> create a new account
//        */

//       /**
//        * -> This is the provider registration
//        * -> email
//        * -> providerId
//        */

//       /** using CDC user get the message by email */

//       /**
//        * crete accessToken.
//        * create refreshToken.
//        * create session
//        */

//       /**
//        * return to the user.
//        */
//    }

//    async login(loginData: RegisterType): Promise<void> {
//       /**
//        *         LoginUseCase
//                       │
//               ┌───────┴────────┐
//               │                │
//         Credentials         Provider
//               │                │
//         User by email    Auth by provider+id
//               │                │
//               │          ┌─────┴─────┐
//               │          │           │
//               │        found       not found
//               │          │           │
//               │          │       User by email
//               │          │           │
//               │          │      ┌────┴────┐
//               │          │      │         │
//               │          │    found     absent
//               │          │      │         │
//               │          │   link*    AccountNotFound
//               │          │      │
//               └──────────┴──────┘
//                          │
//                   Check user state
//                          │
//                   Verify identity
//                          │
//                   Create session
//                          │
//              ┌───────────┴───────────┐
//              │                       │
//         Access Token            Refresh Token
//              │                       │
//              └───────────┬───────────┘
//                          ▼
//                        Return
//        */

//       /** check user state -> user block or active */

//       if (/** this is credential login */ true) {
//          /**
//           *  -> check email is exist or not in user collection
//           *
//           *        -> if exist => access the account
//           *        -> if not exist => send message to user "
//           *                   account not found please register.
//           *                   -> we not create new account(it's my specific rule)
//           *           "
//           */
//       }

//       /**
//        *  ------------ IN PROVIDER LOGIN CASE ----------------
//        *  -> check provider id exis or not in auth collection (providerId + provider)
//        *
//        *         -> if exist => user login successfully
//        *         -> If not exist => check the email exist on user collection
//        *                   -> if exist => access the account
//        *                   -> if not exist => send message to user "
//        *                          account not found please register.
//        *                          -> we not create new account(it's my specific rule)
//        *                      "
//        */

//       /** using CDC user get the message by email */

//       /**
//        * crete accessToken.
//        * create refreshToken.
//        * create session
//        */

//       /**
//        * return to the user.
//        */
//    }

//    async rotateSession(): Promise<void> {
//       /**
//        *  -----> check the validation first
//        *  -----> means user active or block
//        *  -----> from redis
//        */
//       /**
//        * ----> create new accessToken and refrest token
//        * ----> store the refresh token in session
//        */
//       /**
//        * return access and refresh token
//        */
//    }

//    /** Those 2 method I will not keep hear
//     * controller direct call the OtpService
//     */
//    async verifyOtp(email: string, otp: string): Promise<void> {
//       const identifire = ''; /** create identifire using email */

//       /**
//        * --------------> call otp service that verifiy the otp
//        *   --> otpSerive.otpVerify(identifire, otp);
//        *   --> return verifyToken
//        */
//    }

//    async sendOtp(email: string): Promise<void> {
//       /**
//        *  --------------> call otp Service that
//        *   --> store the otp in redis
//        *   --> and rend the otp using email
//        */
//    }
// }

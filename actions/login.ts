"use server"

import * as z from "zod"

import { db } from "@/lib/db"
import { signIn } from "@/auth"
import { LoginSchema } from "@/schemas"
import { DEFAULT_LOGIN_REDIRECT } from "@/routes"
import { AuthError } from "@auth/core/errors"
import { generateVerificationToken, generateTwoFactorToken } from "@/lib/token"
import { getUserByEmail } from "@/data/user"
import { sendVerificationEmail, sendTwoFactorTokenEmail } from "@/lib/mail"
import { getTwoFactorTokenByEmail } from "@/data/two-factor-token"
import { getTwoFactorConfirmationByUserId } from "@/data/two-factor-confirmation"

export const login = async (values: z.infer<typeof LoginSchema>) => {
    
    const validatedFields = LoginSchema.safeParse(values)

    if(!validatedFields.success) {
        return { error:"Invalid fields!"}
    }

    const { email, password, code } = validatedFields.data

    const existingUser = await getUserByEmail(email);

    if(!existingUser || !existingUser.email || !existingUser.password) {
        return { error: "Email does not exist!" }
    }

    if(!existingUser.emailVerified) {
        const verificationToken = await generateVerificationToken(
            existingUser.email
    )

    await sendVerificationEmail(
        verificationToken.email,
        verificationToken.token,
    );

    return { success: "Confirmation email sent!" }
    }

    if(existingUser.isTwoFactorEnabled && existingUser.email) {

        if(code) {
        // Verify code.
        const twoFactorToken = await getTwoFactorTokenByEmail(
            existingUser.email
        )
        
        if(!twoFactorToken){
            return { error: "Invalid Code!"}
        }

        if(twoFactorToken.token !== code) {
            return { error: "Invalid Code!"}
        }

        const hasExpired = new Date(twoFactorToken.expires) < new Date()

        if(hasExpired) {
            return { error: "Code expired!" }
        }

        await db.twoFactorToken.delete({
            where: { id: twoFactorToken.id}
        });

        const existingConfirmation = await getTwoFactorConfirmationByUserId
        (
            existingUser.id
        )

        if(existingConfirmation) {
            await db.twoFactorConfirmation.delete({
                where: { id: existingConfirmation.id}
            })
        }

        await db.twoFactorConfirmation.create({
            data: {
                userId: existingUser.id
            }
        })

        } else {
        const twoFactorToken = await generateTwoFactorToken(existingUser.email)

        await sendTwoFactorTokenEmail(
            twoFactorToken.email,
            twoFactorToken.token
        )
        return { twoFactor: true }
        }
    }

    try {
        await signIn("credentials", {
            email,
            password,
            redirectTo: DEFAULT_LOGIN_REDIRECT,
        })
    } catch(error) {
        if ((error as any) instanceof AuthError) {
            switch((error as any).type) {
                case "CredentialsSignin":
                    return { error: "Invalid Credentials!"}
                default:
                    return { error: "Something went wrong!"}
            }
        }

        throw error;
    }
}
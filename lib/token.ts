import crypto from "crypto"
import { db } from "./db"  // Import database connection
import { v4 as uuidv4 } from "uuid"  // Import a package to generate UUID
import { getVerificationTokenByEmail } from "@/data/verification-token"
import { getPasswordResetTokenByEmail } from "@/data/password-reset-token"
import { getTwoFactorTokenByEmail } from "@/data/two-factor-token"

// Function to generate two-factor authentication token
export const generateTwoFactorToken = async (email: string) => {
    // Generate a random 6-digit number
    const token = crypto.randomInt(100_000, 1_000_000).toString()
    // Set expiration time to 5 minutes from now
    const expires = new Date(new Date().getTime() + 5 * 60 * 1000)
    
    // Check if there's an existing token for this email in the database
    const existingToken = await getTwoFactorTokenByEmail(email)

    // If there's an existing token, we need to delete it
    if (existingToken) {
        await db.twoFactorToken.delete({
            where: {
                id: existingToken.id
            }
        })
    }

    // Create a new two-factor authentication token and save it to the database
    const twoFactorToken = await db.twoFactorToken.create({
        data: {
            email,  // User's email address
            token,  // Generated token value
            expires  // Token expiration time
        }
    })
    // Return the newly created token
    return twoFactorToken
}

// Parola sıfırlama token'ı oluşturma fonksiyonu
export const generatePasswordResetToken = async (email: string) => {
    // UUID biçiminde bir rastgele token oluşturuyoruz
    const token = uuidv4()
    // Token'ın 1 saat sonra süresinin dolacağı zamanı belirliyoruz
    const expires = new Date(new Date().getTime() + 3600 * 1000)

    // Veritabanında bu e-posta ile ilişkili bir mevcut parola sıfırlama token'ı olup olmadığını kontrol ediyoruz
    const existingToken = await getPasswordResetTokenByEmail(email)

    // Eğer mevcut bir token varsa, onu silmeliyiz
    if (existingToken) {
        await db.passwordResetToken.delete({
            where: { id: existingToken.id }
        })
    }

    // Yeni parola sıfırlama token'ını oluşturuyoruz ve veritabanına kaydediyoruz
    const passwordResetToken = await db.passwordResetToken.create({
        data: {
            email,  // Kullanıcının e-posta adresi
            token,  // Oluşturulan token değeri
            expires  // Token'ın geçerlilik süresi
        }
    })

    // Yeni oluşturulan token'ı geri döndürüyoruz
    return passwordResetToken
}

// Hesap doğrulama token'ı oluşturma fonksiyonu
export const generateVerificationToken = async (email: string) => {
    // UUID biçiminde bir rastgele token oluşturuyoruz
    const token = uuidv4()
    // Token'ın 1 saat sonra süresinin dolacağı zamanı belirliyoruz
    const expires = new Date(new Date().getTime() + 3600 * 1000)

    // Veritabanında bu e-posta ile ilişkili bir mevcut hesap doğrulama token'ı olup olmadığını kontrol ediyoruz
    const existingToken = await getVerificationTokenByEmail(email)

    // Eğer mevcut bir token varsa, onu silmeliyiz
    if (existingToken) {
        await db.verificationToken.delete({
            where: {
                id: existingToken.id
            }
        })
    }

    // Yeni hesap doğrulama token'ını oluşturuyoruz ve veritabanına kaydediyoruz
    const verificationToken = await db.verificationToken.create({
        data: {
            email,  // Kullanıcının e-posta adresi
            token,  // Oluşturulan token değeri
            expires  // Token'ın geçerlilik süresi
        }
    })
    // Yeni oluşturulan token'ı geri döndürüyoruz
    return verificationToken
}

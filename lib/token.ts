import crypto from "crypto"
import { db } from "./db"  // Veritabanı bağlantısını içe aktarıyoruz
import { v4 as uuidv4 } from "uuid"  // UUID oluşturmak için bir paket içe aktarıyoruz
import { getVerificationTokenByEmail } from "@/data/verification-token"
import { getPasswordResetTokenByEmail } from "@/data/password-reset-token"
import { getTwoFactorTokenByEmail } from "@/data/two-factor-token"

// İki faktörlü kimlik doğrulama token'ı oluşturma fonksiyonu
export const generateTwoFactorToken = async (email: string) => {
    // 6 basamaklı bir rastgele sayı oluşturuyoruz
    const token = crypto.randomInt(100_000, 1_000_000).toString()
    // Token'ın 5 dakika sonra süresinin dolacağı zamanı belirliyoruz
    const expires = new Date(new Date().getTime() + 5 * 60 * 1000)
    
    // Veritabanında bu e-posta ile ilişkili bir mevcut token olup olmadığını kontrol ediyoruz
    const existingToken = await getTwoFactorTokenByEmail(email)

    // Eğer mevcut bir token varsa, onu silmeliyiz
    if (existingToken) {
        await db.twoFactorToken.delete({
            where: {
                id: existingToken.id
            }
        })
    }

    // Yeni iki faktörlü kimlik doğrulama token'ını oluşturuyoruz ve veritabanına kaydediyoruz
    const twoFactorToken = await db.twoFactorToken.create({
        data: {
            email,  // Kullanıcının e-posta adresi
            token,  // Oluşturulan token değeri
            expires  // Token'ın geçerlilik süresi
        }
    })
    // Yeni oluşturulan token'ı geri döndürüyoruz
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

import { db } from "@/lib/db";

// `getVerificationTokenByToken` fonksiyonu, belirli bir token'a göre doğrulama token'ını veritabanından almak için kullanılır.
// Eğer token bulunamazsa veya bir hata meydana gelirse, `null` döndürülür.
export const getVerificationTokenByToken = async (
    token: string  // Bu fonksiyon bir token string'i alır
) => {
    try {
        // `db.verificationToken.findUnique` fonksiyonu, veritabanında benzersiz bir kayıt bulmak için kullanılır.
        // Bu durumda, `token` değeriyle eşleşen bir doğrulama token'ı aranır.
        const verificationToken = await db.verificationToken.findUnique({
            where: { 
                token  // Veritabanında bu token'a sahip olan kaydı bulur
            }
        });
        
        // Eğer token bulunursa, bu token'ı döndürür.
        return verificationToken;
    } 
    catch {
        // Eğer bir hata oluşursa (örneğin, veritabanı bağlantısında bir sorun varsa), `null` döndürülür.
        return null;
    }
}

// `getVerificationTokenByEmail` function is used to retrieve a verification token from the database based on a specific email address.
// If no token is found for the email address or an error occurs, it returns `null`.
export const getVerificationTokenByEmail = async (
    email: string  // This function takes an email address string
) => {
    try {
        // `db.verificationToken.findFirst` function is used to find the first record in the database that matches a specific condition.
        // In this case, it searches for a verification token with the matching `email`.
        const verificationToken = await db.verificationToken.findFirst({
            where: { email }  // Find the first record in the database with this email address
        });
        
        // If a token is found, return it.
        return verificationToken;
    } 
    catch {
        // If an error occurs, return `null`.
        return null;
    }
}

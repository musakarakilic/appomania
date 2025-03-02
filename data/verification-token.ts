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

// `getVerificationTokenByEmail` fonksiyonu, belirli bir e-posta adresine göre doğrulama token'ını veritabanından almak için kullanılır.
// Eğer e-posta adresine ait bir token bulunamazsa veya bir hata meydana gelirse, `null` döndürülür.
export const getVerificationTokenByEmail = async (
    email: string  // Bu fonksiyon bir e-posta adresi string'i alır
) => {
    try {
        // `db.verificationToken.findFirst` fonksiyonu, veritabanında belirli bir koşula uyan ilk kaydı bulmak için kullanılır.
        // Bu durumda, `email` değeriyle eşleşen bir doğrulama token'ı aranır.
        const verificationToken = await db.verificationToken.findFirst({
            where: { email }  // Veritabanında bu e-posta adresine sahip olan ilk kaydı bulur
        });
        
        // Eğer token bulunursa, bu token'ı döndürür.
        return verificationToken;
    } 
    catch {
        // Eğer bir hata oluşursa, `null` döndürülür.
        return null;
    }
}

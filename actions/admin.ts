"use server"

// Admin yetkilerini kontrol eden modül
import { currentRole } from "@/lib/auth"
import { UserRole } from "@prisma/client"

// Admin yetkisi kontrolü yapan fonksiyon
export const admin = async () => {
    // Mevcut kullanıcının rolünü al
    const role = await currentRole()

    // Kullanıcı admin ise erişime izin ver
    if(role === UserRole.ADMIN) {
        return { success: "Allowed"}
    }

    // Admin değilse erişimi reddet
    return { error: "Forbidden!"}
}
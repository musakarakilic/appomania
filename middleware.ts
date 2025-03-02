import authConfig from "./auth.config" // Auth yapılandırmasını içe aktarıyoruz.
import NextAuth from "next-auth" // NextAuth kimlik doğrulama kütüphanesini içe aktarıyoruz.

import { 
  DEFAULT_LOGIN_REDIRECT, // Oturum açtıktan sonra yönlendirilecek varsayılan URL.
  apiAuthPrefix, // API kimlik doğrulama yollarının prefix'i.
  authRoutes, // Kimlik doğrulama gerektiren yolların listesi.
  publicRoutes // Herkes tarafından erişilebilir, kimlik doğrulama gerektirmeyen yolların listesi.
} from "./routes" // Yollarla ilgili yapılandırmaları içe aktarıyoruz.

import { getUserById } from "./data/user" // Kullanıcı verilerini almak için bir fonksiyon içe aktarıyoruz.

const { auth } = NextAuth(authConfig) // NextAuth kimlik doğrulama middleware'ini yapılandırıyoruz.
 
export default auth((req) => {
  const { nextUrl } = req // İstek URL'sini alıyoruz.
  const isLoggedIn = !!req.auth // Kullanıcının oturum açmış olup olmadığını kontrol ediyoruz.

  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix) // URL, API kimlik doğrulama yollarından biri mi?
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname) // URL, genel bir rota mı (herkes tarafından erişilebilir mi)?
  const isAuthRoute = authRoutes.includes(nextUrl.pathname) // URL, kimlik doğrulama gerektiren bir rota mı?

  // Eğer API kimlik doğrulama yolundaysak, herhangi bir işlem yapmadan devam ediyoruz.
  if(isApiAuthRoute){
    return null
  }

  // Eğer kimlik doğrulama gerektiren bir rotadaysak:
  if(isAuthRoute){
    if(isLoggedIn){ 
      // Eğer kullanıcı zaten oturum açmışsa, onu varsayılan yönlendirme rotasına yönlendiriyoruz.
      return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl))
    }
    return null // Eğer oturum açmamışsa, herhangi bir işlem yapmadan devam ediyoruz.
  }

  // Eğer kullanıcı oturum açmamış ve rota genel bir rota değilse:
  if(!isLoggedIn && !isPublicRoute) {
    // Kullanıcıyı oturum açma sayfasına yönlendiriyoruz.
    return Response.redirect(new URL("/auth/login", nextUrl))
  }

  // Yukarıdaki durumlar gerçekleşmezse, herhangi bir işlem yapmadan devam ediyoruz.
  return null
})
 
// Bu bölümde, middleware'in hangi yollar için çalışacağını belirtiyoruz.
export const config = {
  matcher: [
    // Next.js'in dahili yollarını ve statik dosyaları geçmek için,
    // arama parametrelerinde bulunmadıkça bu dosyaları es geçiyoruz.
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // API yolları için her zaman çalıştırıyoruz.
    '/(api|trpc)(.*)',
  ],
}

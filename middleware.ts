import { auth } from "@/auth"
import { NextResponse } from "next/server"

import { 
  DEFAULT_LOGIN_REDIRECT, // Oturum açtıktan sonra yönlendirilecek varsayılan URL.
  apiAuthPrefix, // API kimlik doğrulama yollarının prefix'i.
  authRoutes, // Kimlik doğrulama gerektiren yolların listesi.
  publicRoutes // Herkes tarafından erişilebilir, kimlik doğrulama gerektirmeyen yolların listesi.
} from "./routes" // Yollarla ilgili yapılandırmaları içe aktarıyoruz.

import { getUserById } from "./data/user" // Kullanıcı verilerini almak için bir fonksiyon içe aktarıyoruz.
 
export default auth((req) => {
  const { nextUrl } = req // İstek URL'sini alıyoruz.
  const isLoggedIn = !!req.auth // Kullanıcının oturum açmış olup olmadığını kontrol ediyoruz.

  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix) // URL, API kimlik doğrulama yollarından biri mi?
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname) // URL, genel bir rota mı (herkes tarafından erişilebilir mi)?
  const isAuthRoute = authRoutes.includes(nextUrl.pathname) // URL, kimlik doğrulama gerektiren bir rota mı?

  // Eğer API kimlik doğrulama yolundaysak, herhangi bir işlem yapmadan devam ediyoruz.
  if(isApiAuthRoute){
    return NextResponse.next()
  }

  // Eğer kimlik doğrulama gerektiren bir rotadaysak:
  if(isAuthRoute){
    if(isLoggedIn){ 
      // Eğer kullanıcı zaten oturum açmışsa, onu varsayılan yönlendirme rotasına yönlendiriyoruz.
      return NextResponse.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl))
    }
    return NextResponse.next() // Eğer oturum açmamışsa, herhangi bir işlem yapmadan devam ediyoruz.
  }

  // Eğer kullanıcı oturum açmamış ve rota genel bir rota değilse:
  if(!isLoggedIn && !isPublicRoute) {
    // Kullanıcıyı oturum açma sayfasına yönlendiriyoruz.
    return NextResponse.redirect(new URL("/auth/login", nextUrl))
  }

  // Yukarıdaki durumlar gerçekleşmezse, herhangi bir işlem yapmadan devam ediyoruz.
  return NextResponse.next()
})
 
// Here we specify which paths the middleware will run for.
export const config = {
  matcher: [
    // To skip Next.js's internal paths and static files,
    // we bypass these files unless they appear in search parameters.
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes.
    '/(api|trpc)(.*)',
  ],
}

import Link from "next/link"
import Image from "next/image"

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-100 py-12 border-t border-gray-700">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {/* Brand */}
          <div className="space-y-4">
            <Image src="/images/athleland-logo.png" alt="ATHLELAND" width={180} height={54} className="h-12 w-auto" />
            <p className="text-gray-400 font-light leading-relaxed max-w-sm">
              Elite fitness programming designed for athletes who demand excellence.
            </p>
          </div>

          {/* Connect */}
          <div className="space-y-4">
            <h3 className="text-white font-medium">Connect</h3>
            <div className="flex gap-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22.254 4.037c-.779.346-1.614.578-2.484.685.898-.538 1.589-1.393 1.91-2.408-.839.497-1.764.858-2.75 1.053-.791-.84-1.92-1.365-3.17-1.365-2.407 0-4.364 1.957-4.364 4.364 0 .343.039.675.114.992-3.627-.183-6.837-1.916-8.987-4.545-.375.646-.589 1.399-.589 2.195 0 1.512.769 2.846 1.94 3.628-.714-.022-1.386-.219-1.97-.542v.054c0 2.118 1.506 3.882 3.506 4.29-.368.1-.758.15-1.16.15-.285 0-.56-.027-.828-.079.558 1.745 2.173 3.018 4.09 3.057-1.496 1.174-3.382 1.879-5.435 1.879-.353 0-.699-.02-1.04-.061 1.933 1.237 4.233 1.959 6.697 1.959 8.037 0 12.443-6.666 12.443-12.443 0-.19-.004-.379-.012-.569.855-.616 1.597-1.387 2.182-2.268z" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M7.828 2H16.172A5.828 5.828 0 0122 7.828V16.172A5.828 5.828 0 0116.172 22H7.828A5.828 5.828 0 012 16.172V7.828A5.828 5.828 0 017.828 2zm8.344 0h-8.344A3.828 3.828 0 004 7.828V16.172A3.828 3.828 0 007.828 20H16.172A3.828 3.828 0 0020 16.172V7.828A3.828 3.828 0 0016.172 4zM12 7a5 5 0 100 10 5 5 0 000-10zm0 2a3 3 0 110 6 3 3 0 010-6zM17.25 6.1a1.25 1.25 0 100 2.5 1.25 1.25 0 000-2.5z" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 1.5a8.5 8.5 0 110 17 8.5 8.5 0 010-17zM12 6a6 6 0 100 12 6 6 0 000-12zm0 1.5a4.5 4.5 0 110 9 4.5 4.5 0 010-9zm0 1.5a3 3 0 100 6 3 3 0 000-6zm0 1.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4 lg:justify-self-end">
            <h3 className="text-white font-medium">Quick Links</h3>
            <div className="space-y-2">
              <a href="#classes" className="block text-gray-400 hover:text-white transition-colors font-light">
                Classes
              </a>
              <a href="#programs" className="block text-gray-400 hover:text-white transition-colors font-light">
                Programs
              </a>
              <a href="#photos" className="block text-gray-400 hover:text-white transition-colors font-light">
                Gallery
              </a>
              <Link href="/about" className="block text-gray-400 hover:text-white transition-colors font-light">
                About Us
              </Link>
              <Link href="/admin" className="block text-gray-400 hover:text-white transition-colors font-light">
                Admin
              </Link>
              <Link href="#" className="block text-gray-400 hover:text-white transition-colors font-light">
                Contact
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-700 text-center">
          <p className="text-gray-400 font-light text-sm">© 2025 ATHLELAND. All Rights Reserved</p>
        </div>
      </div>
    </footer>
  )
}

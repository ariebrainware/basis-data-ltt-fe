import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { SpeedInsights } from '@vercel/speed-insights/next'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Lee Tit Tar',
  description: 'Lee Tit Tar one solution website',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <SpeedInsights />
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* E2E-only shim: when running Playwright tests we enable a small
            runtime patch that ensures programmatic value assignments to
            inputs dispatch input events. This improves cross-browser
            reliability for automated fills (only active when the
            __E2E_TEST__ flag is present in localStorage). */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(() => {
              try {
                if (typeof window !== 'undefined' && localStorage.getItem('__E2E_TEST__') === '1') {
                  const desc = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')
                  if (desc && desc.set) {
                    const originalSet = desc.set
                    Object.defineProperty(HTMLInputElement.prototype, 'value', {
                      set: function (v) {
                        originalSet.call(this, v)
                        try { this.dispatchEvent(new Event('input', { bubbles: true })) } catch (e) {}
                      },
                      get: desc.get,
                      configurable: true,
                      enumerable: true,
                    })
                  }
                  const tdesc = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')
                  if (tdesc && tdesc.set) {
                    const originalSetT = tdesc.set
                    Object.defineProperty(HTMLTextAreaElement.prototype, 'value', {
                      set: function (v) {
                        originalSetT.call(this, v)
                        try { this.dispatchEvent(new Event('input', { bubbles: true })) } catch (e) {}
                      },
                      get: tdesc.get,
                      configurable: true,
                      enumerable: true,
                    })
                  }
                }
              } catch (e) {}
            })();`,
          }}
        />
        {children}
      </body>
    </html>
  )
}

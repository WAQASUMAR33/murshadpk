'use client';

import { Poppins } from 'next/font/google';
import { Provider } from 'react-redux';
import store from './store/store';
import './globals.css';
import WhatsAppButton from './customer/components/whatsappbutton';

const poppins = Poppins({
  weight: ['400', '700'],
  subsets: ['latin'],
});

export default function RootLayout({ children }) {
  return (
    <Provider store={store}>
      <html lang="en">
        <body className={poppins.className}>
          <div className='text-black'>
          {/* <WhatsAppButton /> Ensure WhatsAppButton is included in the layout */}
          {children}
          </div>
        </body>
      </html>
    </Provider>
  );
}

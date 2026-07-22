import React from 'react';

export const metadata = {
  title: 'Terms & Conditions',
  description: 'Terms and Conditions of Saheli Shrungar.',
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="rounded-3xl border border-[#F0E6F2] bg-white p-8 shadow-xl shadow-[#8B1D8F]/5 sm:p-12">
        <h1 className="mb-8 text-3xl font-bold tracking-tight text-[#3A2A3D] sm:text-4xl">Terms & Conditions</h1>
        
        <div className="prose prose-purple mx-auto max-w-none space-y-6 text-[#6B5A6F]">
          <p>Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
          
          <p>
            Welcome to Saheli Shrungar! These terms and conditions outline the rules and regulations for the use of Saheli Shrungar's Website, located at sahelishrungar.com.
          </p>
          <p>
            By accessing this website we assume you accept these terms and conditions. Do not continue to use Saheli Shrungar if you do not agree to take all of the terms and conditions stated on this page.
          </p>

          <h2 className="mt-8 text-xl font-semibold text-[#8B1D8F]">1. Products and Services</h2>
          <p>
            We attempt to be as accurate as possible in the description of the products. However, we do not warrant that product descriptions or other content of this site is accurate, complete, reliable, current, or error-free. Colors may vary slightly due to photographic lighting sources or your monitor settings.
          </p>

          <h2 className="mt-8 text-xl font-semibold text-[#8B1D8F]">2. Pricing and Payments</h2>
          <p>
            All prices are subject to change without notice. We reserve the right to modify or discontinue the Service (or any part or content thereof) without notice at any time. We support various payment methods, including Cash on Delivery (COD) for eligible areas.
          </p>

          <h2 className="mt-8 text-xl font-semibold text-[#8B1D8F]">3. Shipping and Delivery</h2>
          <p>
            Delivery times are estimates and commence from the date of shipping, rather than the date of order. Delivery times are to be used as a guide only and are subject to the acceptance and approval of your order. Next-day delivery is subject to availability and location.
          </p>

          <h2 className="mt-8 text-xl font-semibold text-[#8B1D8F]">4. Returns and Refunds</h2>
          <p>
            Due to the nature of fancy dress costumes (hygiene and seasonal use), returns and exchanges are strictly subject to our Return Policy. Please review our specific Return Policy page for detailed information on eligible returns, timeframes, and conditions.
          </p>

          <h2 className="mt-8 text-xl font-semibold text-[#8B1D8F]">5. User Accounts</h2>
          <p>
            If you create an account on the website, you are responsible for maintaining the security of your account, and you are fully responsible for all activities that occur under the account and any other actions taken in connection with it.
          </p>

          <h2 className="mt-8 text-xl font-semibold text-[#8B1D8F]">6. Limitation of Liability</h2>
          <p>
            In no event shall Saheli Shrungar, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
          </p>
        </div>
      </div>
    </div>
  );
}

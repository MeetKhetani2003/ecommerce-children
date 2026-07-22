

export const metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy of Saheli Shrungar.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="rounded-3xl border border-[#F0E6F2] bg-white p-8 shadow-xl shadow-[#8B1D8F]/5 sm:p-12">
        <h1 className="mb-8 text-3xl font-bold tracking-tight text-[#3A2A3D] sm:text-4xl">Privacy Policy</h1>
        
        <div className="prose prose-purple mx-auto max-w-none space-y-6 text-[#6B5A6F]">
          <p>Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
          
          <p>
            At Saheli Shrungar, accessible from sahelishrungar.com, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by Saheli Shrungar and how we use it.
          </p>

          <h2 className="mt-8 text-xl font-semibold text-[#8B1D8F]">Information We Collect</h2>
          <p>
            The personal information that you are asked to provide, and the reasons why you are asked to provide it, will be made clear to you at the point we ask you to provide your personal information.
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Personal Details:</strong> Name, email address, phone number, and shipping address when you create an account or place an order.</li>
            <li><strong>Payment Information:</strong> We do not store your payment card details. Transactions are processed through secure payment gateways.</li>
            <li><strong>Log Data:</strong> We collect information that your browser sends whenever you visit our Site (e.g., IP address, browser type, pages visited).</li>
          </ul>

          <h2 className="mt-8 text-xl font-semibold text-[#8B1D8F]">How We Use Your Information</h2>
          <p>We use the information we collect in various ways, including to:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Provide, operate, and maintain our website</li>
            <li>Improve, personalize, and expand our website</li>
            <li>Process your orders and manage your account</li>
            <li>Communicate with you, including for customer service, updates, and marketing</li>
            <li>Find and prevent fraud</li>
          </ul>

          <h2 className="mt-8 text-xl font-semibold text-[#8B1D8F]">Cookies</h2>
          <p>
            Like any other website, Saheli Shrungar uses 'cookies'. These cookies are used to store information including visitors' preferences, and the pages on the website that the visitor accessed or visited. The information is used to optimize the users' experience by customizing our web page content based on visitors' browser type and/or other information.
          </p>

          <h2 className="mt-8 text-xl font-semibold text-[#8B1D8F]">Contact Us</h2>
          <p>
            If you have additional questions or require more information about our Privacy Policy, do not hesitate to contact us.
          </p>
        </div>
      </div>
    </div>
  );
}

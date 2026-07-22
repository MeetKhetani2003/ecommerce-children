import React from 'react';

export const metadata = {
  title: 'About Us',
  description: 'Learn more about Saheli Shrungar, India\'s premier online store for premium kids fancy dress costumes.',
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="rounded-3xl border border-[#F0E6F2] bg-white p-8 shadow-xl shadow-[#8B1D8F]/5 sm:p-12">
        <h1 className="mb-8 text-3xl font-bold tracking-tight text-[#3A2A3D] sm:text-4xl text-center">About Saheli Shrungar</h1>
        
        <div className="prose prose-purple mx-auto max-w-none space-y-6 text-[#6B5A6F]">
          <p className="text-lg leading-relaxed">
            Welcome to <strong>Saheli Shrungar</strong>, India's most loved fancy dress destination for school events, competitions, and festivals. We are dedicated to providing the highest quality, most authentic, and comfortable fancy dress costumes for children.
          </p>
          
          <h2 className="mt-8 text-2xl font-semibold text-[#8B1D8F]">Our Mission</h2>
          <p>
            Our mission is to bring joy and confidence to every child who steps onto a stage. We believe that a great costume is the first step to a great performance. That's why we meticulously design and source costumes that are not just visually stunning but also skin-friendly and easy to wear.
          </p>

          <h2 className="mt-8 text-2xl font-semibold text-[#8B1D8F]">Why Choose Us?</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Premium Quality:</strong> We use soft, breathable, and durable fabrics that are gentle on children's skin.</li>
            <li><strong>Wide Variety:</strong> From Indian mythology and freedom fighters to animals, nature, and community helpers, we have a costume for every theme.</li>
            <li><strong>Fast Delivery:</strong> We offer next-day delivery in major cities because we know school events often come with short notice.</li>
            <li><strong>Complete Sets:</strong> Our costumes come with all necessary accessories, so you don't have to hunt for matching pieces.</li>
          </ul>

          <h2 className="mt-8 text-2xl font-semibold text-[#8B1D8F]">Our Story</h2>
          <p>
            Saheli Shrungar started with a simple observation: parents often struggled to find high-quality, complete fancy dress costumes for their children's school events. What was available in local markets was often itchy, poorly stitched, or incomplete. We set out to change that by offering a premium online shopping experience where parents can find exactly what they need, with the assurance of quality and timely delivery.
          </p>

          <div className="mt-12 rounded-2xl bg-[#FCF7FD] p-6 text-center border border-[#EEDDF0]">
            <p className="text-[#8B1D8F] font-medium">Thank you for choosing Saheli Shrungar to be a part of your child's special moments.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

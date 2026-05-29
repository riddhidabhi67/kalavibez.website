import { useState } from 'react';
import { Mail, Phone, MapPin, Instagram, Send, Check } from 'lucide-react';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const msg = encodeURIComponent(
      `Hi Kala Vibez!\n\nName: ${form.name}\nEmail: ${form.email}\nSubject: ${form.subject}\n\n${form.message}`
    );
    window.open(`https://wa.me/+919876543210?text=${msg}`, '_blank');
    setSent(true);
    setTimeout(() => setSent(false), 3000);
    setForm({ name: '', email: '', subject: '', message: '' });
  }

  return (
    <div className="min-h-screen bg-luxury-gradient pt-20">
      {/* Header */}
      <div className="bg-warm-800 py-14 px-6 md:px-10 text-center">
        <p className="font-poppins text-xs text-champagne-400 tracking-[0.3em] uppercase mb-3">Get In Touch</p>
        <h1 className="font-playfair text-4xl md:text-5xl text-cream-100">Contact Us</h1>
        <p className="font-poppins text-sm text-warm-400 mt-3 max-w-md mx-auto">
          Have a custom order in mind? We'd love to bring your vision to life.
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-6 md:px-10 py-16 grid md:grid-cols-2 gap-12">
        {/* Contact info */}
        <div>
          <h2 className="font-playfair text-3xl text-warm-800 mb-8">Let's create something beautiful together</h2>
          <p className="font-poppins text-sm text-warm-500 leading-relaxed mb-8">
            Whether you're looking for a wedding keepsake, a corporate gift, or just something beautiful for your home — we're here to help. Reach out via WhatsApp for the fastest response.
          </p>

          <div className="space-y-5">
            {[
              { icon: <Phone size={18} />, label: 'WhatsApp & Phone', value: '+91 98765 43210', href: 'tel:+919876543210' },
              { icon: <Mail size={18} />, label: 'Email', value: 'kala.vibez.art@gmail.com', href: 'mailto:kala.vibez.art@gmail.com' },
              { icon: <Instagram size={18} />, label: 'Instagram', value: '@kala_vibez.art', href: 'https://instagram.com/kala_vibez.art' },
              { icon: <MapPin size={18} />, label: 'Ships From', value: 'India — Pan India Delivery', href: undefined },
            ].map(item => (
              <div key={item.label} className="flex items-start gap-4">
                <div className="w-11 h-11 bg-champagne-50 border border-champagne-200 flex items-center justify-center shrink-0 text-champagne-600">
                  {item.icon}
                </div>
                <div>
                  <p className="font-poppins text-xs text-warm-400 tracking-wide uppercase">{item.label}</p>
                  {item.href ? (
                    <a href={item.href} target="_blank" rel="noopener noreferrer" className="font-poppins text-sm text-warm-800 hover:text-champagne-600 transition-colors">
                      {item.value}
                    </a>
                  ) : (
                    <p className="font-poppins text-sm text-warm-800">{item.value}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 p-5 bg-champagne-50 border border-champagne-200">
            <p className="font-poppins text-xs text-champagne-700 font-medium mb-1">Fastest Response</p>
            <p className="font-poppins text-sm text-warm-600">Message us on WhatsApp for same-day response. We typically reply within 2 hours during business hours.</p>
            <a
              href="https://wa.me/+919876543210"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-gold mt-4 inline-flex text-sm"
            >
              Chat on WhatsApp
            </a>
          </div>
        </div>

        {/* Contact form */}
        <div className="bg-white p-8 shadow-luxury">
          <h3 className="font-playfair text-2xl text-warm-800 mb-6">Send a Message</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-poppins text-xs text-warm-600 mb-1.5 block">Your Name</label>
                <input
                  type="text"
                  required
                  placeholder="Full name"
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  className="input-luxury"
                />
              </div>
              <div>
                <label className="font-poppins text-xs text-warm-600 mb-1.5 block">Email</label>
                <input
                  type="email"
                  required
                  placeholder="your@email.com"
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  className="input-luxury"
                />
              </div>
            </div>
            <div>
              <label className="font-poppins text-xs text-warm-600 mb-1.5 block">Subject</label>
              <select
                value={form.subject}
                onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
                className="input-luxury"
              >
                <option value="">Select a subject</option>
                <option>Custom Order Inquiry</option>
                <option>Product Question</option>
                <option>Corporate Gifting</option>
                <option>Wedding Order</option>
                <option>Wholesale Inquiry</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="font-poppins text-xs text-warm-600 mb-1.5 block">Message</label>
              <textarea
                required
                rows={5}
                placeholder="Tell us about your order or question..."
                value={form.message}
                onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                className="input-luxury resize-none"
              />
            </div>
            <button type="submit" className="btn-gold w-full">
              {sent ? (
                <><Check size={14} /> Opening WhatsApp...</>
              ) : (
                <><Send size={14} /> Send via WhatsApp</>
              )}
            </button>
            <p className="font-poppins text-xs text-warm-400 text-center">Your message will open in WhatsApp for a faster reply.</p>
          </form>
        </div>
      </div>
    </div>
  );
}

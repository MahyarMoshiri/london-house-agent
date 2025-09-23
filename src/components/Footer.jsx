import { Phone, Mail, MapPin, Clock } from 'lucide-react'

function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-black text-white">
      <div className="lha-container lha-section-padding">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-[#FFCC00]">
              London House Agent
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              Your trusted partner in finding premium properties across London. 
              We specialise in rental solutions with personalised service.
            </p>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-[#FFCC00]">Contact Us</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-[#FFCC00] flex-shrink-0" />
                <span className="text-gray-300 text-sm">+44 0203 509 8903</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-[#FFCC00] flex-shrink-0" />
                <span className="text-gray-300 text-sm">info@londonhouseagent.co.uk</span>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 text-[#FFCC00] flex-shrink-0 mt-0.5" />
                <span className="text-gray-300 text-sm">
                  87 Evelyn Avenue<br />
                  London, NW9 0JF
                </span>
              </div>
            </div>
          </div>

          {/* Office Hours */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-[#FFCC00]">Office Hours</h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <Clock className="w-4 h-4 text-[#FFCC00] flex-shrink-0" />
                <div className="text-gray-300 text-sm">
                  <div>Mon - Fri: 10:00 AM - 6:00 PM</div>
                  <div>Saturday: 10:00 AM - 4:00 PM</div>
                  <div>Sunday: Closed</div>
                </div>
              </div>
            </div>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-[#FFCC00]">Our Services</h4>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li>• Private Let</li>
              <li>• Social Let</li>
              <li>• Property Management</li>
              <li>• Investment Advice</li>
              <li>• Market Valuations</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm">
              © {currentYear} London House Agent. All rights reserved.
            </p>
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <a href="#" className="hover:text-[#FFCC00] transition-colors duration-200">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-[#FFCC00] transition-colors duration-200">
                Terms of Service
              </a>
              <a href="#" className="hover:text-[#FFCC00] transition-colors duration-200">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer

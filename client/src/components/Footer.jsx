import { Link } from "react-router-dom";
import {
  PenSquare,
  Twitter,
  Github,
  Linkedin,
  Heart,
  Mail,
  MapPin,
} from "lucide-react";
import { motion } from "framer-motion";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-linear-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-300 mt-20 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{ duration: 30, repeat: Infinity }}
          className="absolute -top-20 -right-20 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            rotate: [360, 180, 0],
          }}
          transition={{ duration: 35, repeat: Infinity }}
          className="absolute -bottom-20 -left-20 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl"
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center space-x-2 mb-4 group">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <PenSquare className="w-7 h-7 text-blue-500" />
              </motion.div>
              <span className="text-2xl font-bold gradient-text">
                PenPortal
              </span>
            </div>
            <p className="text-sm leading-relaxed mb-4">
              A modern platform for writers and readers to share and discover
              amazing stories and articles.
            </p>
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-blue-500" />
              <span>Global Community</span>
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h3 className="text-white font-bold mb-4 text-lg">Quick Links</h3>
            <ul className="space-y-3 text-sm">
              {[
                { to: "/", label: "Home" },
                { to: "/trending", label: "Trending" },
                { to: "/write", label: "Write" },
                { to: "/search", label: "Search" },
              ].map((link, index) => (
                <motion.li
                  key={link.to}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ x: 5 }}
                >
                  <Link
                    to={link.to}
                    className="hover:text-blue-400 transition-colors inline-flex items-center gap-2"
                  >
                    <span className="w-1 h-1 bg-blue-500 rounded-full" />
                    {link.label}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Resources */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3 className="text-white font-bold mb-4 text-lg">Resources</h3>
            <ul className="space-y-3 text-sm">
              {[
                { label: "About Us" },
                { label: "Contact" },
                { label: "Privacy Policy" },
                { label: "Terms of Service" },
              ].map((link, index) => (
                <motion.li
                  key={link.label}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ x: 5 }}
                >
                  <a
                    href="#"
                    className="hover:text-blue-400 transition-colors inline-flex items-center gap-2"
                  >
                    <span className="w-1 h-1 bg-purple-500 rounded-full" />
                    {link.label}
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Social */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h3 className="text-white font-bold mb-4 text-lg">
              Connect With Us
            </h3>
            <p className="text-sm mb-4">Stay updated with our latest stories</p>
            <div className="flex space-x-3 mb-6">
              {[
                { Icon: Twitter, color: "hover:bg-blue-500" },
                { Icon: Github, color: "hover:bg-gray-700" },
                { Icon: Linkedin, color: "hover:bg-blue-600" },
              ].map(({ Icon, color }, index) => (
                <motion.a
                  key={index}
                  href="#"
                  whileHover={{ scale: 1.1, y: -3 }}
                  whileTap={{ scale: 0.9 }}
                  className={`p-3 bg-gray-800 rounded-xl ${color} transition-all text-white shadow-lg hover:shadow-xl`}
                >
                  <Icon className="w-5 h-5" />
                </motion.a>
              ))}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Mail className="w-4 h-4 text-blue-500" />
              <a
                href="mailto:hello@penportal.com"
                className="hover:text-blue-400 transition-colors"
              >
                hello@penportal.com
              </a>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="border-t border-gray-700 mt-12 pt-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
            <p className="flex items-center gap-2">
              &copy; {currentYear} PenPortal. Made with
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <Heart className="w-4 h-4 text-red-500 fill-current" />
              </motion.span>
              by developers
            </p>
            <div className="flex gap-6 text-sm">
              <a href="#" className="hover:text-blue-400 transition-colors">
                Privacy
              </a>
              <a href="#" className="hover:text-blue-400 transition-colors">
                Terms
              </a>
              <a href="#" className="hover:text-blue-400 transition-colors">
                Cookies
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;

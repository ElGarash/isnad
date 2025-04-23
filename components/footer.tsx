import Link from "next/link";
import { FaGithub } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="mt-auto w-full border-t border-gray-200 py-6">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center">
          <Link
            href="https://github.com/ElGarash/isnad"
            rel="noopener"
            className="group relative flex items-center gap-2 overflow-hidden text-gray-600 transition-colors hover:text-gray-900"
          >
            <FaGithub className="text-lg" />
            <span className="relative z-10 text-sm">الكود</span>
            <span className="absolute bottom-0 left-0 h-1 w-full origin-left scale-x-0 transform bg-parchment transition-transform group-hover:scale-x-100"></span>
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

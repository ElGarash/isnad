import { FaGithub } from 'react-icons/fa'
import Link from 'next/link'

const Footer = () => {
    return (
        <footer className="w-full border-t border-gray-200 py-6 mt-auto">
            <div className="container mx-auto px-4">
                <div className="flex justify-center items-center">
                    <Link
                        href="https://github.com/ElGarash/isnad"
                        rel='noopener'
                        className="relative overflow-hidden group flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <FaGithub className="text-lg" />
                        <span className="text-sm relative z-10">الكود</span>
                        <span className="absolute bottom-0 left-0 w-full h-1 bg-parchment transform origin-left scale-x-0 transition-transform group-hover:scale-x-100"></span>
                    </Link>
                </div>
            </div>
        </footer>
    )
}

export default Footer

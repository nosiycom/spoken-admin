import Link from 'next/link'

export default function Logo() {
  return (
    <Link className="block" href="/dashboard" aria-label="Spoken">
      <div className="flex items-center">
        <div className="flex items-center justify-center w-8 h-8 bg-violet-500 rounded-lg lg:mr-3">
          <span className="text-white font-bold text-lg">S</span>
        </div>
        <span className="text-xl font-bold text-gray-900 dark:text-white lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">Spoken Admin</span>
      </div>
    </Link>
  )
}
import { NavLink, useLocation } from 'react-router-dom'
import Icon from './Icons'

const ITEMS = [
  { to: '/', label: 'Home', icon: 'home', end: true },
  { to: '/saved', label: 'Saved', icon: 'heart' },
  { to: '/account', label: 'Account', icon: 'user' },
]

export default function BottomNav() {
  const { pathname } = useLocation()
  if (pathname.startsWith('/admin')) return null

  return (
    <nav className="fixed bottom-4 inset-x-0 z-40 flex justify-center pointer-events-none">
      <div className="pointer-events-auto flex gap-1 bg-brand-950/95 backdrop-blur rounded-full p-1.5 shadow-soft">
        {ITEMS.map(({ to, label, icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition ${
                isActive ? 'bg-brand-400 text-brand-950' : 'text-brand-400 hover:text-white'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon name={icon} className="w-5 h-5" filled={isActive && icon === 'heart'} />
                {isActive && <span>{label}</span>}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
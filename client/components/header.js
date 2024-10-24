import Link from 'next/link'
export const Header = ({ currentUser }) => {
  const isUserLogged = !!currentUser

  const links = [
    !isUserLogged && { label: 'Sign Up', href: '/auth/signup' },
    !isUserLogged && { label: 'Sign In', href: '/auth/signin' },
    isUserLogged && { label: 'Sell Ticket', href: '/tickets/new' },
    isUserLogged && { label: 'My Orders', href: '/orders' },
    isUserLogged && { label: 'Sign Out', href: '/auth/signout' },
  ]
    .filter((linkCfg) => linkCfg)
    .map(({ href, label }) => {
      return (
        <li key={href} className='nav-item'>
          <Link className='nav-link' href={href}>
            {label}
          </Link>
        </li>
      )
    })

  return (
    <nav className='navbar navbar-light bg-light'>
      <Link className='navbar-brand' href='/'>
        GitTix
      </Link>

      <div className='d-flex justify-content-end'>
        <ul className='nav d-flex align-items-center'>{links}</ul>
      </div>
    </nav>
  )
}
